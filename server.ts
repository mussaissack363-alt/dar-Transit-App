/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { calculateRouteOptions, FARE_REFERENCE } from './src/utils/dijkstra';
import { ScenarioId, CommuterReport, AutoBulletin, AutoBulletinConfig } from './src/types';

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
  const agoIso = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

  const SEED_REPORTS: CommuterReport[] = [
    {
      id: 'rep-1',
      type: 'price',
      targetType: 'Route',
      targetId: 'tegeta_mwenge-mikocheni',
      title: 'Tegeta-Mwenge conductors hiking fare',
      details: 'Due to severe supply container delays on Bagamoyo Road, daladala conductors are demanding 700 TZS instead of the standard 400 TZS. Commuters have no choice but to pay.',
      reporterName: 'Juma Omari',
      timestamp: '12 mins ago',
      votes: 14,
      priceValue: 700,
      delayMinutes: 5,
      createdAt: agoIso(12),
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
      delayMinutes: 7,
      createdAt: agoIso(24),
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
      delayMinutes: 18,
      createdAt: agoIso(45),
    },
    {
      id: 'rep-4',
      type: 'condition',
      targetType: 'Stop',
      targetId: 'kivukoni',
      title: 'Harbor swells delayed Kigamboni boarding',
      details: 'Strong winds created choppy water at the bay; cars were boarded at half speed and ferry departures ran late. Winds have since eased.',
      reporterName: 'Captain Ally',
      timestamp: '2 days ago',
      votes: 18,
      severity: 'medium',
      delayMinutes: 12,
      createdAt: agoIso(2 * 24 * 60),
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
      delayMinutes: 25,
      createdAt: agoIso(5),
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

      const options = calculateRouteOptions(
        startStopId,
        endStopId,
        (scenarioId || 'normal') as ScenarioId,
        commuterReports
      );
      if (options.length === 0) {
        return res.status(404).json({ error: 'No reachable transit route found.' });
      }

      const [best, ...rest] = options;
      return res.json({ ...best, alternatives: rest });
    } catch (err: any) {
      console.error('Error calculating route:', err);
      return res.status(500).json({ error: 'Server route calculation error' });
    }
  });

  // 2b. API - Receive active updates on prices, road conditions, and traffic levels.
  // A report stays "active" for a visibility window scaled to its delay impact,
  // then shifts to the reference archive where it stays searchable by day/week.
  const impactHours = (r: CommuterReport): number => {
    const delay = r.delayMinutes ?? (r.severity === 'high' ? 25 : r.severity === 'medium' ? 12 : 4);
    if (delay >= 20) return 72; // major disruption stays visible 3 days
    if (delay >= 8) return 24;  // moderate disruption stays visible 1 day
    return 6;                   // minor blips stay visible 6 hours
  };

  app.get('/api/reports', (req, res) => {
    const scope = req.query.scope === 'archive' ? 'archive' : 'active';
    const days = Math.max(1, Math.min(90, Number(req.query.days) || 7));
    const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

    const filtered = commuterReports.filter((r) => {
      const created = new Date(r.createdAt).getTime();
      if (!Number.isFinite(created)) return scope === 'active';
      const expired = Date.now() - created > impactHours(r) * 3_600_000;
      if (scope === 'archive') return expired && created >= cutoffMs;
      return !expired;
    });

    return res.json(filtered);
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
        severity: severity || undefined,
        delayMinutes: req.body.delayMinutes ? Number(req.body.delayMinutes) : undefined,
        createdAt: new Date().toISOString(),
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

      // Crowdsourced confirmation: enough upvotes escalates the impact rating.
      const SEVERITY_ORDER: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      if (report.votes >= 15) {
        report.severity = 'high';
        report.delayMinutes = Math.max(report.delayMinutes ?? 0, 25);
      } else if (report.votes >= 8) {
        report.severity = 'medium';
        report.delayMinutes = Math.max(report.delayMinutes ?? 0, 12);
      }

      return res.json({ success: true, votes: report.votes, severity: report.severity, delayMinutes: report.delayMinutes });
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

  // 2d. API - Fare reference: posted standards vs typical conductor asks.
  app.get('/api/fares', (req, res) => {
    return res.json(FARE_REFERENCE);
  });

  // 2e. API - Auto-ingested traffic bulletins (public feeds / sample data)
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

  const autoBulletins: AutoBulletin[] = [
    {
      id: 'auto-1',
      source: 'transit_authority',
      originId: 'dart-ops',
      title: 'DART M1 trunk running at reduced frequency',
      summary: 'Kariakoo–Morocco segment operating with 4 fewer buses this afternoon. Expect longer waits at Morocco and Gerezani terminals.',
      affectedStopId: 'morocco',
      affectedRouteId: 'DART M1',
      severity: 'medium',
      issuedAt: minutesAgo(35),
      ingestedAt: minutesAgo(33),
    },
    {
      id: 'auto-2',
      source: 'social_signal',
      originId: 'commuter-x',
      title: 'Heavy congestion on Bagamoyo Road near Tegeta',
      summary: 'Multiple commuter posts report standstill traffic around Tegeta-Mwenge. Daladala fares trending above standard on this corridor.',
      affectedStopId: 'tegeta_mwenge',
      affectedRouteId: null,
      severity: 'high',
      issuedAt: minutesAgo(80),
      ingestedAt: minutesAgo(75),
    },
    {
      id: 'auto-3',
      source: 'rss_json',
      originId: 'tanroads-feed',
      title: 'Ferry channel normal after morning swells',
      summary: 'Kigamboni channel crossings have resumed normal schedule. Morning wind delays have cleared.',
      affectedStopId: 'kivukoni',
      affectedRouteId: null,
      severity: 'low',
      issuedAt: minutesAgo(140),
      ingestedAt: minutesAgo(138),
    },
  ];

  const SAMPLE_BULLETINS: Array<Omit<AutoBulletin, 'id' | 'issuedAt' | 'ingestedAt'>> = [
    {
      source: 'social_signal',
      originId: 'commuter-x',
      title: 'Daladala queue long at Ubungo Interchange',
      summary: 'Commuters report 15+ minute waits for Mwenge-bound daladalas at Ubungo terminal.',
      affectedStopId: 'ubungo',
      affectedRouteId: null,
      severity: 'medium',
    },
    {
      source: 'transit_authority',
      originId: 'dart-ops',
      title: 'DART M2 detour via Morogoro Road',
      summary: 'Mzizima-bound BRT buses diverting around a stalled truck. Minor delays expected for one hour.',
      affectedStopId: 'mzizima',
      affectedRouteId: 'DART M2',
      severity: 'low',
    },
    {
      source: 'gemini_detected',
      originId: 'feed-scan',
      title: 'Flooding watch: Jangwani valley water level rising',
      summary: 'Reports suggest Morogoro Road at Jangwani may close if rains continue. Consider Mandela Road alternatives.',
      affectedStopId: null,
      affectedRouteId: null,
      severity: 'high',
    },
  ];
  let sampleCursor = 0;

  app.get('/api/traffic/auto-bulletins/latest', (req, res) => {
    const count = Math.max(1, Math.min(50, Number(req.query.count) || 20));
    return res.json(autoBulletins.slice(0, count));
  });

  app.get('/api/traffic/auto-ingest/status', (req, res) => {
    const config: AutoBulletinConfig = {
      sourceUrl: null,
      pollSeconds: 300,
      enabled: false,
    };
    return res.json(config);
  });

  app.post('/api/traffic/auto-ingest/seed-sample', (req, res) => {
    try {
      const sample = SAMPLE_BULLETINS[sampleCursor % SAMPLE_BULLETINS.length];
      sampleCursor += 1;
      const bulletin: AutoBulletin = {
        ...sample,
        id: `auto-${Date.now()}`,
        issuedAt: new Date().toISOString(),
        ingestedAt: new Date().toISOString(),
      };
      autoBulletins.unshift(bulletin);
      return res.json({ success: true, bulletin });
    } catch (err) {
      console.error('Error seeding sample bulletin:', err);
      return res.status(500).json({ error: 'Failed to seed sample bulletin' });
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
