"use client";

import React, { useState } from "react";

export interface CQAxis {
  id: string;
  label: string;
  score: number; // 0 to 100
  icon: string;
  description: string;
  superpowerText: string;
}

interface CuriosityQuotientCardProps {
  xp?: number;
  username?: string;
  telemetryLogs?: any[];
}

export function CuriosityQuotientCard({ xp = 450, username = "Explorer", telemetryLogs = [] }: CuriosityQuotientCardProps) {
  // Deterministic calculation based on XP so CQ scores grow realistically as student earns XP
  const baseScore = Math.min(95, Math.max(65, 68 + Math.floor(xp / 300)));

  // Real calculation from telemetry if available
  const hasData = telemetryLogs && telemetryLogs.length > 0;
  
  let spatialScore = baseScore + 4;
  let patternScore = baseScore + 8;
  let epistemicScore = baseScore + 2;
  let deductiveScore = baseScore + 6;
  let inquiryScore = baseScore + 5;

  if (hasData) {
    const avgStates = telemetryLogs.reduce((acc, log) => acc + (log.distinct_states_reached || 0), 0) / telemetryLogs.length;
    const avgTier = telemetryLogs.reduce((acc, log) => acc + (log.tier || 0), 0) / telemetryLogs.length;
    const avgSubmits = telemetryLogs.reduce((acc, log) => acc + (log.submit_attempts || 1), 0) / telemetryLogs.length;
    const avgMLScore = telemetryLogs.reduce((acc, log) => acc + (log.ml_score || 0), 0) / telemetryLogs.length;
    
    spatialScore = Math.min(99, 50 + (avgStates * 10)); // proxy for positioning accuracy
    patternScore = Math.min(99, 60 + (telemetryLogs.filter(l => l.comparison_pattern_detected).length * 15));
    epistemicScore = Math.min(99, 90 - (avgSubmits * 5) + (avgMLScore * 5)); // low submits + good free text
    deductiveScore = Math.min(99, 65 + (avgMLScore * 10)); 
    inquiryScore = Math.min(99, 40 + (avgTier * 20)); // Exploration tier reached
  }
  
  const axes: CQAxis[] = [
    {
      id: "spatial",
      label: "Shape Smarts",
      score: Math.round(Math.min(98, spatialScore)),
      icon: "view_in_ar",
      description: "Seeing how shapes fit together and moving them in your mind.",
      superpowerText: "You are great at picturing how objects move and fit together!"
    },
    {
      id: "pattern",
      label: "Finding Patterns",
      score: Math.round(Math.min(99, patternScore)),
      icon: "pattern",
      description: "Spotting things that repeat and guessing what comes next.",
      superpowerText: "You are very fast at seeing how things are connected!"
    },
    {
      id: "epistemic",
      label: "Careful Thinking",
      score: Math.round(Math.min(96, epistemicScore)),
      icon: "fact_check",
      description: "Asking good questions and checking if things are really true.",
      superpowerText: "You think like a real scientist by always checking the facts!"
    },
    {
      id: "deductive",
      label: "Solving Puzzles",
      score: Math.round(Math.min(97, deductiveScore)),
      icon: "psychology",
      description: "Using clues to figure out the right answer.",
      superpowerText: "You are great at connecting clues to solve mysteries!"
    },
    {
      id: "inquiry",
      label: "Testing Ideas",
      score: Math.round(Math.min(98, inquiryScore)),
      icon: "science",
      description: "Trying out new things to see how they work.",
      superpowerText: "You love learning by doing experiments yourself!"
    }
  ];

  // Calculate overall Curiosity Score
  const avgScore = Math.round(axes.reduce((sum, a) => sum + a.score, 0) / axes.length);
  const overallCQ = 100 + Math.round((avgScore - 60) * 0.85);

  // Find brain superpower (highest score) and weakness (lowest score)
  const superpower = axes.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), axes[0]);
  const weakness = axes.reduce((prev, curr) => (curr.score < prev.score ? curr : prev), axes[0]);

  const [selectedAxis, setSelectedAxis] = useState<CQAxis>(superpower);

  // Determine specific feedback based on the lowest pillar
  let weaknessFeedback = "";
  switch(weakness.id) {
    case "spatial": weaknessFeedback = "You're doing great, but try paying more attention to where objects are placed!"; break;
    case "pattern": weaknessFeedback = "Try to move things back and forth to see the differences clearly!"; break;
    case "epistemic": weaknessFeedback = "Try to explain your reasoning more deeply and guess less often!"; break;
    case "deductive": weaknessFeedback = "Take your time connecting the clues together before submitting an answer!"; break;
    case "inquiry": weaknessFeedback = "You solved the tasks correctly, but rarely explored the 'what if' options — try clicking those next time!"; break;
  }

  // SVG Radar Chart geometry (5 vertices)
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const numAxes = axes.length;

  // Calculate (x, y) coordinates for angle and radius
  const getCoordinates = (index: number, rValue: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const x = center + rValue * Math.cos(angle);
    const y = center + rValue * Math.sin(angle);
    return { x, y };
  };

  // Generate grid polygon string for a given percentage (0.2 to 1.0)
  const getGridPolygon = (pct: number) => {
    return axes
      .map((_, i) => {
        const { x, y } = getCoordinates(i, radius * pct);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Generate student's data polygon string
  const getDataPolygon = () => {
    return axes
      .map((axis, i) => {
        const { x, y } = getCoordinates(i, (radius * axis.score) / 100);
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <section className="mb-8 bg-gradient-to-br from-[#ffffff] via-[#fffaf4] to-[#fff5ec] rounded-3xl p-6 sm:p-8 border-2 border-[#f37021] shadow-xl relative overflow-hidden">
      {/* Background Decorative Emblem */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-[#ffe16d]/20 pointer-events-none blur-2xl"></div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f37021] text-white text-[11px] font-black uppercase tracking-wider shadow-xs mb-2">
            <span className="material-symbols-outlined text-sm">radar</span>
            <span>My Brain Profile</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#143867] tracking-tight">
            Curiosity Score Board
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            How {username} thinks — based on games and tests.
          </p>
        </div>

        {/* CQ Badge */}
        <div className="flex items-center gap-3 bg-[#143867] text-white px-4 py-3 rounded-2xl border-2 border-[#ffe16d] shadow-md shrink-0">
          <span className="material-symbols-outlined text-3xl text-[#ffe16d]">psychology</span>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#ffe16d] tracking-widest">
              Total Score
            </div>
            <div className="text-2xl font-black italic tracking-tight flex items-baseline gap-1">
              CQ {overallCQ}
              <span className="text-xs font-bold text-emerald-400 not-italic">
                {overallCQ >= 125 ? "• Super Smart" : overallCQ >= 115 ? "• Great Thinker" : "• Good Learner"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Radar & Axis Interactive Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Side: Pure SVG Radar Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center py-2 bg-white/70 rounded-3xl border border-orange-100 p-4 shadow-sm">
          <div className="relative">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="overflow-visible"
            >
              <defs>
                <linearGradient id="cqPolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f37021" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ffe16d" stopOpacity="0.65" />
                </linearGradient>
              </defs>

              {/* Concentric Polygonal Grids (20%, 40%, 60%, 80%, 100%) */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((pct, idx) => (
                <polygon
                  key={idx}
                  points={getGridPolygon(pct)}
                  fill="none"
                  stroke={pct === 1.0 ? "#cbd5e1" : "#e2e8f0"}
                  strokeWidth={pct === 1.0 ? "2" : "1"}
                  strokeDasharray={pct === 1.0 ? "none" : "3,3"}
                />
              ))}

              {/* Radial Axis Lines */}
              {axes.map((_, i) => {
                const { x, y } = getCoordinates(i, radius);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Student Brain Footprint Polygon */}
              <polygon
                points={getDataPolygon()}
                fill="url(#cqPolygonGrad)"
                stroke="#ea580c"
                strokeWidth="2.5"
                className="transition-all duration-700 ease-out"
              />

              {/* Interactive Vertex Dots & Labels */}
              {axes.map((axis, i) => {
                const { x, y } = getCoordinates(i, (radius * axis.score) / 100);
                const labelPos = getCoordinates(i, radius + 22);
                const isSelected = selectedAxis.id === axis.id;

                return (
                  <g key={axis.id} className="cursor-pointer" onClick={() => setSelectedAxis(axis)}>
                    {/* Glowing outer circle on selected */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={12}
                        fill="#f37021"
                        fillOpacity={0.2}
                        className="animate-ping"
                      />
                    )}

                    {/* Vertex point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4.5}
                      fill={isSelected ? "#ea580c" : "#143867"}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-300"
                    />

                    {/* Axis Label Text */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[10px] font-black tracking-tight transition-colors ${
                        isSelected ? "fill-[#ea580c] font-extrabold" : "fill-[#143867]"
                      }`}
                    >
                      {axis.label} ({axis.score})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
            Click any point below to look closer
          </p>
        </div>

        {/* Right Side: Interactive Skill Axes Breakdown */}
        <div className="lg:col-span-6 space-y-3">
          {/* Improvement Feedback Area */}
          <div className="w-full mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-orange-600 mt-0.5">tips_and_updates</span>
            <div>
              <h5 className="font-bold text-orange-900 text-sm mb-1">Growth Area</h5>
              <p className="text-sm text-orange-800 leading-relaxed">
                {weaknessFeedback}
              </p>
            </div>
          </div>

          {axes.map((axis) => {
            const isSelected = selectedAxis.id === axis.id;
            return (
              <div
                key={axis.id}
                onClick={() => setSelectedAxis(axis)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#f37021] shadow-md scale-[1.01]"
                    : "bg-white/60 border-gray-100 hover:bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-lg ${isSelected ? "text-[#f37021]" : "text-[#143867]"}`}>
                      {axis.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#143867]">
                      {axis.label}
                    </span>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-[#f37021] text-white" : "bg-gray-100 text-[#143867]"
                  }`}>
                    {axis.score}/100
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected ? "bg-gradient-to-r from-[#f37021] to-[#ffe16d]" : "bg-[#143867]"
                    }`}
                    style={{ width: `${axis.score}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {axis.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brain Superpower Highlight Banner */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#143867] to-[#1e4a85] rounded-2xl text-white flex items-center gap-3.5 shadow-md relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[#f37021] text-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase text-[#ffe16d] tracking-wider">
            Brain Superpower: {superpower.label}
          </div>
          <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
            &ldquo;{superpower.superpowerText}&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
