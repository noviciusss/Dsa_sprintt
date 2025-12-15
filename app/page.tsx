"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// --- Types matching the new JSON Schema ---
interface Block {
  name: string;
  minutes: number;
  objective: string;
}

interface PracticeItem {
  platform: string;
  problem_title: string;
  difficulty: string;
  why_this: string;
}

interface PlanResponse {
  title: string;
  total_minutes: number;
  blocks: Block[];
  practice: PracticeItem[];
  quick_revision: string[];
  common_mistakes: string[];
}

export default function Home() {
  const [minutes, setMinutes] = useState(60);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [error, setError] = useState("");

  const generatePlan = async () => {
    if (!topic) return;
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      // Call the Next.js API route
      const res = await axios.post("/api/generate", {
        minutes_available: minutes,
        topic,
        level,
      });
      setPlan(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  // Demo helper
  const loadDemo = (m: number, t: string, l: string) => {
    setMinutes(m);
    setTopic(t);
    setLevel(l);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-purple-300 uppercase bg-purple-900/30 rounded-full border border-purple-800/50">
            DSA Day Planner
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent mb-4">
            Win Your Day.
          </h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto">
            Get a fierce, logic-driven study sprint generated instantly by Gemini 2.5.
          </p>
        </motion.div>

        {/* Input Section */}
        <div className="w-full max-w-xl mb-16">
          <div className="p-1 rounded-2xl bg-gradient-to-b from-gray-700/50 to-gray-900/50">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl p-8 border border-gray-800 shadow-2xl">
              <div className="space-y-6">

                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Focus Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Graphs, Dynamic Programming"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                  />
                </div>

                {/* Controls Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Time (Mins)</label>
                    <select
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={30}>30 Min</option>
                      <option value={45}>45 Min</option>
                      <option value={60}>60 Min</option>
                      <option value={90}>90 Min</option>
                      <option value={120}>2 Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option>beginner</option>
                      <option>intermediate</option>
                      <option>advanced</option>
                    </select>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={generatePlan}
                  disabled={loading || !topic}
                  className={`w-full py-4 rounded-lg font-bold text-lg tracking-wide transition-all
                                ${loading
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : "GENERATE SPRINT"}
                </button>

                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">
                    {error}
                  </div>
                )}

                {/* Quick Picks */}
                <div className="flex gap-2 justify-center text-xs text-gray-500">
                  <span>Try:</span>
                  <button onClick={() => loadDemo(60, "Trees", "intermediate")} className="hover:text-white underline decoration-gray-700">Trees 60m</button>
                  <span>|</span>
                  <button onClick={() => loadDemo(45, "Arrays", "beginner")} className="hover:text-white underline decoration-gray-700">Arrays 45m</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <AnimatePresence>
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-8"
            >
              {/* Title */}
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {plan.title}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest text-sm mb-4">Timeline ({plan.total_minutes}m)</h3>
                  {plan.blocks.map((block, idx) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex gap-4 items-center hover:border-gray-700 transition-colors">
                      <div className="bg-gray-800 text-gray-300 font-mono text-sm px-3 py-1 rounded">
                        {block.minutes}m
                      </div>
                      <div>
                        <div className="font-bold text-white">{block.name}</div>
                        <div className="text-sm text-gray-500">{block.objective}</div>
                      </div>
                    </div>
                  ))}

                  {/* Revision */}
                  <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg mt-6">
                    <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-wider">Quick Revision</h4>
                    <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm">
                      {plan.quick_revision.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Problems */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest text-sm mb-4">Practice</h3>
                  {plan.practice.map((prob, idx) => (
                    <div key={idx} className="group relative bg-gray-900/50 border border-gray-800 p-5 rounded-lg hover:border-gray-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-blue-400 group-hover:text-blue-300">{prob.problem_title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded border ${prob.difficulty.toLowerCase() === 'beginner' || prob.difficulty.toLowerCase() === 'easy' ? 'border-green-800 text-green-400 bg-green-900/20' :
                            prob.difficulty.toLowerCase() === 'intermediate' || prob.difficulty.toLowerCase() === 'medium' ? 'border-yellow-800 text-yellow-400 bg-yellow-900/20' :
                              'border-red-800 text-red-400 bg-red-900/20'
                          }`}>{prob.difficulty}</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-3">{prob.platform}</div>
                      <div className="text-sm text-gray-400 bg-gray-950/50 p-3 rounded border border-gray-800/50 italic">
                        "{prob.why_this}"
                      </div>
                    </div>
                  ))}

                  {/* Mistakes */}
                  <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg mt-6">
                    <h4 className="text-red-400 font-bold mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                      Common Mistakes
                    </h4>
                    <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm">
                      {plan.common_mistakes.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
