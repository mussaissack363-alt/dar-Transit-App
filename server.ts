/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { calculateTransitRoute } from './src/utils/dijkstra';
import { ScenarioId, CommuterReport } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily & safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Prepopulated user-reported active updates for transport prices and road conditions in Dar
  const SEED_REPORTS: CommuterReport[] = [
    {
      id: 'rep-1',
      type: 'price',
      targetType: 'Route',
      targetId: 'daladala_d1',
      title: 'Tegeta-Mwenge conductors hiking fare',
      details: 'Due to severe supply container delays on Bagamoyo Road, daladala conductors are demanding 700 TZS instead of the standard 500 TZS. Commuters have no choice but to pay.',
      reporterName: 'Juma Omari',
      timestamp: '12 mins ago',
      votes: 14,
      priceValue: 700,
    },
    {
      id: 'rep-2',
      type: 'condition',
      targetType: 'Stop',
      targetId: 'morocco',
      title: 'Morocco DART footbridge card validators broken',
      details: 'Two of the automatic turnstile validators are frozen. Long crowding on the entrance stairs. Plan an extra 5-10 mins for boarding or enter via cashier gate.',
      reporterName: 'Mariam K.',
      timestamp: '24 mins ago',
      votes: 9,
      severity: 'low',
    },
    {
      id: 'rep-3',
      type: 'traffic',
      targetType: 'Stop',
      targetId: 'ubungo',
      title: 'Gridlock near Ubungo Interchange',
      details: 'Truck collision spilling container contents on Mandela Expressway underpass is blocking all feeder lane traffic. Vehicles are fully paralyzed.',
      reporterName: 'Kelvin Shayo',
      timestamp: '45 mins ago',
      votes: 21,
      severity: 'medium',
    },
    {
      id: 'rep-4',
      type: 'condition',
      targetType: 'Stop',
      targetId: 'kivukoni',
      title: 'Harbor swells delaying Kigamboni boarding',
      details: 'Strong winds are creating choppy water at the bay; cars are boarded at half speed. Ferry departures are running late.',
      reporterName: 'Captain Ally',
      timestamp: '1 hr ago',
      votes: 18,
      severity: 'medium',
    },
    {
      id: 'rep-5',
      type: 'condition',
      targetType: 'Stop',
      targetId: 'kariakoo_gerezani',
      title: 'Morogoro Rd flooding (Jangwani Valley warning)',
      details: 'High tides and rains are beginning to submerge the local river valley near Jangwani. Water level is close to yellow caution level. Commuters, take note!',
      reporterName: 'Amani R.',
      timestamp: '5 mins ago',
      votes: 38,
      severity: 'high',
    }
  ];

  const commuterReports: CommuterReport[] = [...SEED_REPORTS];

  // 1. API - Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. API - Transit Routing calculation (now incorporates live reported prices & condition delays!)
  app.post('/api/route-plan', (req, res) => {
    try {
      const { startStopId, endStopId, scenarioId } = req.body;
      if (!startStopId || !endStopId) {
        return res.status(400).json({ error: 'Missing startStopId or endStopId' });
      }

      const result = calculateTransitRoute(
        startStopId,
        endStopId,
        (scenarioId || 'normal') as ScenarioId,
        commuterReports
      );
      if (!result) {
        return res.status(404).json({ error: 'No reachable transit route found.' });
      }

      return res.json(result);
    } catch (err: any) {
      console.error('Error calculating route:', err);
      return res.status(500).json({ error: 'Server route calculation error' });
    }
  });

  // 2b. API - Receive active updates on prices, road conditions, and traffic levels
  app.get('/api/reports', (req, res) => {
    return res.json(commuterReports);
  });

  app.post('/api/reports', (req, res) => {
    try {
      const { type, targetType, targetId, title, details, reporterName, priceValue, severity } = req.body;
      if (!type || !targetType || !targetId || !title || !details || !reporterName) {
        return res.status(400).json({ error: 'Missing required report fields' });
      }

      const newReport: CommuterReport = {
        id: `rep-${Date.now()}`,
        type,
        targetType,
        targetId,
        title,
        details,
        reporterName,
        timestamp: 'Just now',
        votes: 1, // Start with reporter’s upvote
        priceValue: priceValue ? Number(priceValue) : undefined,
        severity: severity || undefined
      };

      commuterReports.unshift(newReport);
      return res.json({ success: true, report: newReport });
    } catch (err) {
      console.error('Error saving user report:', err);
      return res.status(500).json({ error: 'Failed to process report' });
    }
  });

  // 2c. API - Vote verification (crowd-sourced confirmation)
  app.post('/api/reports/vote', (req, res) => {
    try {
      const { id, voteType } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing report id' });

      const report = commuterReports.find((r) => r.id === id);
      if (!report) return res.status(404).json({ error: 'Report not found' });

      if (voteType === 'down') {
        report.votes = Math.max(0, report.votes - 1);
      } else {
        report.votes += 1;
      }

      return res.json({ success: true, votes: report.votes });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to apply vote' });
    }
  });

  // 2d. API - Dynamic AI analyses on traffic patterns and reports
  app.get('/api/traffic-analysis', async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          bulletin: 'Mambo vipi! Please configure your GEMINI_API_KEY in the Secrets panel on the top-right to activate live AI Traffic Pattern Analytics. Default commuting advice: Ubungo Interchange remains busy, and Kariakoo Daladalas report slight delays, but DART M1 remains smooth and consistent!'
        });
      }

      const prompt = `Here are the active, live updates reported by commuters on transit prices, traffic levels, and road conditions in Dar es Salaam:\n` +
        JSON.stringify(commuterReports, null, 2) +
        `\n\nPlease analyze these patterns and generate a concise commuter weather report bulletin titled "Dar Commute Intelligence Bulletin" in bilingual (friendly, casual Swahili paired with direct English transit recommendations). ` +
        `Conclude with: \n` +
        `- General Traffic pattern quality index (e.g., Fair, Paralysed, Congested)\n` +
        `- Top Fare Alert warnings\n` +
        `- Road advisory shortcuts (hubs or routes to bypass and what alternative to take).\n` +
        `Praise Kelvin Shayo, Juma Omari or any active commuter updates reporters by name with a fun Swahili gratitude! Keep the overall length short, engaging, and professional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: 'You are the "Dar Transit Traffic Analyst AI". Write helpful commutes advice, summarizing crowd-sourced user fare hikes and flood blockades.',
          temperature: 0.65,
        }
      });

      return res.json({ bulletin: response.text });
    } catch (err) {
      console.error('Error generating AI traffic analysis:', err);
      return res.json({
        bulletin: 'Usafiri wa Leo Dar: AI is currently resting. Commuting is fair; Juma J. reports Daladalas are crowded but DART is running smoothly. Safe travels!'
      });
    }
  });

  // 3. API - Transit AI Assistant chatbot with Swahili + English Dar context
  app.post('/api/assistant', async (req, res) => {
    try {
      const { message, history, routeDetails } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'No message provided' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          text: 'Mambo vipi! Gemini API key is missing. Please set your GEMINI_API_KEY in the Secrets panel of AI Studio so I can guide you on Dar es Salaam Transit networks! (Here is a standard offline Swahili greetings instead!)',
        });
      }

      const systemInstruction = 
        "You are 'Dar es Salaam Transit Companion' (Msaidizi wa Usafiri wa Dar). " +
        "You are an expert guide for Dar es Salaam's DART BRT (mwendokasi) and informal Daladala networks. " +
        "Answer warmly, utilizing friendly local Dar Swahili ('kaka', 'dada', 'mambo vipi', 'daladala za Mwenge', 'safiri salama') " +
        "or professional English when asked in English. " +
        "Provide advice on commuting safely, DART pricing (650 TZS for main trunks), Gerezani/Kivukoni terminal navigation, " +
        "and tell commuters about rules: e.g., you cannot walk on BRT dedicated lanes (fines are heavy!), avoid sitting on yellow seats allocated for elderly/pregnant mothers. " +
        "If heavy rain is selected, warn them that the Jangwani valley overflows, stopping DART services, so they should take Mandela or Bagamoyo road daladalas. " +
        "Be brief, energetic, and extremely practical.";

      // Include contextual active route choice if the user had calculated a route
      let routeContext = '';
      if (routeDetails) {
        routeContext = `The user is currently planning a route from "${routeDetails.start}" to "${routeDetails.end}" under scenario "${routeDetails.scenario}". ` +
          `Calculated plan total duration is ${routeDetails.duration} mins, cost is ${routeDetails.cost} TZS, over ${routeDetails.distance} km. ` +
          `Segments: ${JSON.stringify(routeDetails.legs)}. `;
      }

      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }

      // Add actual user query with context
      contents.push({
        role: 'user',
        parts: [{ text: `${routeContext ? `[\nTransit Context: ${routeContext}\n]\n` : ''}${message}` }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error('Error in AI Assistant handler:', err);
      return res.status(500).json({ error: 'Error communicating with AI Assistant' });
    }
  });

  // Serve static assets in production, hook Vite dev middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DarTransit] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start DarTransit backend server:', error);
});
