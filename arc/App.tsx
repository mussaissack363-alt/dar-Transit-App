/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus, 
  MapPin, 
  AlertTriangle, 
  Search, 
  Settings2, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  RotateCcw,
  Clock,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Anchor,
  User,
  Map as MapIcon,
  ChevronsRight,
  Route as RouteIcon
} from 'lucide-react';
import { STOPS, ROUTES, SCENARIOS, DURATION_MAP } from './data/transitData';
import { Stop, Route, SearchResult, ScenarioId, TrafficScenario, RouteLeg, CommuterReport } from './types';
import { calculateTransitRoute } from './utils/dijkstra';
import { motion, AnimatePresence } from 'motion/react';
import { ReportSystem } from './components/ReportSystem';

const MAP_COORDINATES: Record<string, { x: number; y: number }> = {
  mbezi: { x: 80, y: 190 },
  kimara: { x: 190, y: 210 },
  ubungo: { x: 310, y: 240 },
  mwenge: { x: 340, y: 120 },
  tegeta: { x: 320, y: 35 },
  morocco: { x: 470, y: 150 },
  kariakoo_gerezani: { x: 570, y: 330 },
  kariakoo_msimbazi: { x: 550, y: 300 },
  posta: { x: 650, y: 260 },
  kivukoni: { x: 740, y: 240 },
  tazara: { x: 340, y: 370 },
  mbagala: { x: 510, y: 520 },
};

// Coordinate mapping for SVG paths representation of roads
const MorogoroRoadPoints = "80,190 190,210 310,240 550,300 570,330 650,260 740,240";
const BagamoyoRoadPoints = "320,35 340,120 470,150 650,260";
const NelsonMandelaPoints = "340,120 310,240 340,370 510,520";
const NyerereRoadPoints = "550,300 340,370";

export default function App() {
  // State variables
  const [startStopId, setStartStopId] = useState<string>('kimara');
  const [endStopId, setEndStopId] = useState<string>('posta');
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('normal');
  const [selectedRouteResult, setSelectedRouteResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'networks' | 'schedule'>('plan');
  
  // Custom states for crowdsourcing & active traffic update systems
  const [commuterReports, setCommuterReports] = useState<CommuterReport[]>([]);
  const [rightSidebarTab, setRightSidebarTab] = useState<'ai' | 'reports'>('reports');
  
  // Dijkstra visual step through state
  const [visualizerActive, setVisualizerActive] = useState<boolean>(false);
  const [visualizerSteps, setVisualizerSteps] = useState<{ stopId: string; parentId: string | null; cost: number }[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [visualizerSettled, setVisualizerSettled] = useState<Set<string>>(new Set());

  // AI Assistant Chatbot States
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; id: string }[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Mambo vipi! Karibu kwenye Dar Transit Assistant. Mimi ni msaidizi wako wa safari jijini. Select a route, turn on rainy weather or rush hour, and ask me for swahili shortcuts and best choices! 🚌✨',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Live vehicles simulation coordinates animated over SVG
  const [simulatedVehicles, setSimulatedVehicles] = useState<{ id: string; routeCode: string; color: string; x: number; y: number }[]>([]);

  // Calculate route changes on change
  useEffect(() => {
    calculateRoute();
  }, [startStopId, endStopId, activeScenarioId, commuterReports]);

  // Handle vehicle simulation ticking
  useEffect(() => {
    const routeSegments: { from: {x:number, y:number}, to: {x:number, y:number}, color: string, code: string }[] = [];
    ROUTES.forEach(r => {
      for (let i = 0; i < r.stops.length - 1; i++) {
        const fromCoord = MAP_COORDINATES[r.stops[i]];
        const toCoord = MAP_COORDINATES[r.stops[i + 1]];
        if (fromCoord && toCoord) {
          routeSegments.push({ from: fromCoord, to: toCoord, color: r.color, code: r.code });
        }
      }
    });

    // Create 6 vehicles distributed along segments
    const initialVehicles = Array.from({ length: 7 }).map((_, i) => {
      const seg = routeSegments[Math.floor(Math.random() * routeSegments.length)];
      const ratio = Math.random();
      return {
        id: `v-${i}`,
        routeCode: seg.code,
        color: seg.color,
        x: seg.from.x + (seg.to.x - seg.from.x) * ratio,
        y: seg.from.y + (seg.to.y - seg.from.y) * ratio,
        segment: seg,
        ratio,
        speed: 0.02 + Math.random() * 0.03,
      };
    });

    let activeVehicles = [...initialVehicles];

    const interval = setInterval(() => {
      activeVehicles = activeVehicles.map(v => {
        let newRatio = v.ratio + v.speed;
        if (newRatio >= 1) {
          newRatio = 0;
          const nextSeg = routeSegments[Math.floor(Math.random() * routeSegments.length)];
          return {
            ...v,
            ratio: 0,
            x: nextSeg.from.x,
            y: nextSeg.from.y,
            segment: nextSeg,
            color: nextSeg.color,
            routeCode: nextSeg.code,
          };
        }
        return {
          ...v,
          ratio: newRatio,
          x: v.segment.from.x + (v.segment.to.x - v.segment.from.x) * newRatio,
          y: v.segment.from.y + (v.segment.to.y - v.segment.from.y) * newRatio,
        };
      });
      setSimulatedVehicles(activeVehicles.map(v => ({ id: v.id, routeCode: v.routeCode, color: v.color, x: v.x, y: v.y })));
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const calculateRoute = () => {
    setIsSearching(true);
    // Calculate via locally exposed routing utility incorporating live updates
    const result = calculateTransitRoute(startStopId, endStopId, activeScenarioId, commuterReports);
    setSelectedRouteResult(result);
    setIsSearching(false);
  };

  const handleApplyPreset = (from: string, to: string) => {
    setStartStopId(from);
    setEndStopId(to);
  };

  // Run visual step-by-step Dijkstra simulation to see node exploration
  const startDijkstraVisualizer = () => {
    setVisualizerActive(true);
    setVisualizerSettled(new Set([startStopId]));
    
    // Simulate Dijkstra exploration steps for Dar stops
    const stopsQueue = STOPS.map(s => s.id).filter(id => id !== startStopId);
    const stepsList: { stopId: string; parentId: string | null; cost: number }[] = [];
    
    // Add start
    stepsList.push({ stopId: startStopId, parentId: null, cost: 0 });
    
    // Approximate BFS/Dijkstra relaxation ordering based on geographic distance for visualization
    let currentId = startStopId;
    let accumulatedTime = 0;
    const visited = new Set<string>([startStopId]);

    while (stopsQueue.length > 0) {
      // Find nearest unvisited physical stop
      let nearestId = '';
      let minDist = Infinity;
      const currentCoord = MAP_COORDINATES[currentId];
      
      for (const unvisitedId of stopsQueue) {
        const c = MAP_COORDINATES[unvisitedId];
        const d = Math.sqrt(Math.pow(c.x - currentCoord.x, 2) + Math.pow(c.y - currentCoord.y, 2));
        if (d < minDist) {
          minDist = d;
          nearestId = unvisitedId;
        }
      }

      if (!nearestId) break;
      
      accumulatedTime += Math.round(minDist / 8) + 4;
      visited.add(nearestId);
      stepsList.push({ 
        stopId: nearestId, 
        parentId: currentId, 
        cost: accumulatedTime 
      });
      
      // Remove from queue
      const idx = stopsQueue.indexOf(nearestId);
      if (idx > -1) stopsQueue.splice(idx, 1);
      
      currentId = nearestId;
      if (nearestId === endStopId) break; // Finished reaching target
    }

    setVisualizerSteps(stepsList);
    setCurrentStepIndex(0);
  };

  const nextVisualizerStep = () => {
    if (currentStepIndex < visualizerSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStop = visualizerSteps[nextIdx].stopId;
      setVisualizerSettled(prev => {
        const nextSet = new Set(prev);
        nextSet.add(nextStop);
        return nextSet;
      });
    } else {
      // Finished visualizer
      setVisualizerActive(false);
    }
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const msgId = Date.now().toString();
    setChatMessages(prev => [...prev, { id: msgId, role: 'user', text: userText }]);
    setChatInput('');
    setIsAssistantLoading(true);

    // Get current leg data in summarized format to inject context
    const simplifiedLegs = selectedRouteResult?.legs.map(l => ({
      from: l.fromStop.name,
      to: l.toStop.name,
      line: l.routeName,
      type: l.type,
      duration: l.durationMins
    }));

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatMessages.slice(-6).map(m => ({ role: m.role, text: m.text })),
          routeDetails: selectedRouteResult ? {
            start: STOPS.find(s => s.id === startStopId)?.name,
            end: STOPS.find(s => s.id === endStopId)?.name,
            scenario: SCENARIOS.find(s => s.id === activeScenarioId)?.name,
            duration: selectedRouteResult.totalDurationMins,
            cost: selectedRouteResult.totalCostTZS,
            distance: selectedRouteResult.totalDistanceKm,
            legs: simplifiedLegs,
          } : null,
        }),
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'Nilipata dhoruba kidogo ya mtandao! Please try again in a moment.'
      }]);
    } catch (err) {
      console.error('Error sending chat message:', err);
      setChatMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: 'Ndugu mteja, kuna hitilafu ya mtandao kufikia msaidizi wa AI kwa sasa. Hapa kuna dokezo fupi la haraka la asili ya Kiswahili: kumbuka kusafiri na kadi yako ya mwendokasi yenye salio la kutosha!'
      }]);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const handleAskAIAboutRoute = () => {
    const fromName = STOPS.find(s => s.id === startStopId)?.name;
    const toName = STOPS.find(s => s.id === endStopId)?.name;
    const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId);
    
    let aiPrompt = `Can you analyze my transit options from ${fromName} to ${toName}? I noticed there is ${activeScenario?.name} in place. Please use Swahili with some English transit vocabulary and tell me if this route is safe, tips, and transfers.`;
    setChatInput(aiPrompt);
    // Triggers layout focus and submits
    setTimeout(() => {
      const submitBtn = document.getElementById('btn-send-chat');
      if (submitBtn) submitBtn.click();
    }, 100);
  };

  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/10 flex items-center justify-center">
            <Bus className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">Dar Transit Router</h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                Dijkstra v3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive transit path planner & simulate scheduler for DART (BRT) and Daladalas
            </p>
          </div>
        </div>

        {/* Top presets navigation */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">Presets:</span>
          <div className="flex gap-2.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => handleApplyPreset('kimara', 'posta')}
              className={`text-xs px-2.5 py-1 rounded-md transition-all ${startStopId === 'kimara' && endStopId === 'posta' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              id="btn-preset-1"
            >
              Kimara → Posta
            </button>
            <button 
              onClick={() => handleApplyPreset('tegeta', 'kariakoo_gerezani')}
              className={`text-xs px-2.5 py-1 rounded-md transition-all ${startStopId === 'tegeta' && endStopId === 'kariakoo_gerezani' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              id="btn-preset-2"
            >
              Tegeta → Kariakoo
            </button>
            <button 
              onClick={() => handleApplyPreset('mwenge', 'mbagala')}
              className={`text-xs px-2.5 py-1 rounded-md transition-all ${startStopId === 'mwenge' && endStopId === 'mbagala' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              id="btn-preset-3"
            >
              Mwenge → Mbagala
            </button>
          </div>
        </div>
      </header>

      {/* Primary Panels Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Control Panel: Route Options & Scenario Selection (cols: 3) */}
        <section className="lg:col-span-3 border-r border-slate-800 bg-slate-950/80 p-5 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Usanidi wa Safari</h2>
            </div>
            <button 
              onClick={() => {
                setStartStopId('kimara');
                setEndStopId('posta');
                setActiveScenarioId('normal');
              }}
              className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
              title="Reset configuration"
              id="btn-reset-form"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Form Routing */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                Kituo cha Kuanzia (Origin Stop)
              </label>
              <div className="relative">
                <select
                  value={startStopId}
                  onChange={(e) => setStartStopId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  id="select-origin"
                >
                  {STOPS.map((stop) => (
                    <option key={stop.id} value={stop.id} className="font-mono bg-slate-950">
                      [{stop.type}] {stop.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                Kituo cha Mwisho (DestinationStop)
              </label>
              <div className="relative">
                <select
                  value={endStopId}
                  onChange={(e) => setEndStopId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  id="select-destination"
                >
                  {STOPS.map((stop) => (
                    <option key={stop.id} value={stop.id} className="font-mono bg-slate-950">
                      [{stop.type}] {stop.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Simulation Scenarios Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              Chagua Mazingira ya Saa/Simu
            </h3>
            
            <div className="space-y-2">
              {SCENARIOS.map((scen) => {
                const isActive = scen.id === activeScenarioId;
                return (
                  <button
                    key={scen.id}
                    onClick={() => setActiveScenarioId(scen.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 ${
                      isActive 
                        ? 'bg-indigo-950/40 border-indigo-500 text-slate-100 shadow-md shadow-indigo-500/5' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    id={`btn-scenario-${scen.id}`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className={`${isActive ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                        {scen.name}
                      </span>
                      {scen.id !== 'normal' && (
                        <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle className="h-2 w-2" /> Delay
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] leading-relaxed line-clamp-2">
                      {scen.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

     
