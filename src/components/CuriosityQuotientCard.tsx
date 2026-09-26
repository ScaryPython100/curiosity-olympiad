"use client";

import React, { useState, useEffect, useMemo } from "react";
import { calculateCQProfile, CQProfileResult, RawTelemetryLog } from "@/utils/cqScoring";
import { getUserTelemetry } from "@/app/actions/profile";

export type { CQAxis } from "@/utils/cqScoring";

interface CuriosityQuotientCardProps {
  xp?: number;
  username?: string;
  telemetryLogs?: RawTelemetryLog[];
}

export function CuriosityQuotientCard({ username = "Explorer", telemetryLogs = [], xp = 0 }: CuriosityQuotientCardProps) {
  // Initial calculation using provided props
  const [profileResult, setProfileResult] = useState<CQProfileResult>(() => {
    return calculateCQProfile({ telemetryLogs, xp });
  });

  // Client-side hydration and telemetry aggregation across local and server sources
  useEffect(() => {
    let active = true;

    async function loadTelemetrySources() {
      let combinedLogs: RawTelemetryLog[] = [...(telemetryLogs || [])];
      let completedTests: Record<string, any> = {};
      let gatheredReflections: Record<string, string> = {};

      if (typeof window !== "undefined") {
        try {
          // 1. Read mock test completions
          const storedResults = localStorage.getItem("curiosity_mock_tests_results");
          if (storedResults) {
            completedTests = JSON.parse(storedResults);
          }

          // 2. Read explicit telemetry history
          const storedHistory = localStorage.getItem("curiosity_telemetry_history");
          if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory);
            if (Array.isArray(parsedHistory)) {
              combinedLogs = [...combinedLogs, ...parsedHistory];
            }
          }

          // 3. Read any per-experiment telemetry keys and written reflections
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("curiosity_exp_telemetry_")) {
              try {
                const item = JSON.parse(localStorage.getItem(key) || "{}");
                combinedLogs.push(item);
              } catch (e) {}
            }
            if (key && key.startsWith("reflection_")) {
              const val = localStorage.getItem(key);
              if (val) gatheredReflections[key] = val;
            }
          }
        } catch (e) {
          console.warn("Error reading local telemetry:", e);
        }
      }

      // 4. Fetch server submissions
      try {
        const serverRes = await getUserTelemetry();
        if (serverRes.success && Array.isArray(serverRes.data)) {
          serverRes.data.forEach((sub: any) => {
            if (Array.isArray(sub.telemetry_data)) {
              combinedLogs.push(...sub.telemetry_data);
            } else if (sub.telemetry_data && typeof sub.telemetry_data === "object") {
              combinedLogs.push(sub.telemetry_data);
            }
          });
        }
      } catch (err) {
        console.warn("Error fetching server telemetry:", err);
      }

      if (!active) return;

      if (typeof window !== "undefined" && (window as any).__MOCK_CQ_PROFILE__) {
        setProfileResult((window as any).__MOCK_CQ_PROFILE__);
        return;
      }

      const result = calculateCQProfile({
        telemetryLogs: combinedLogs,
        completedMockTests: completedTests,
        reflections: gatheredReflections,
        xp
      });

      setProfileResult(result);
    }

    loadTelemetrySources();

    return () => {
      active = false;
    };
  }, [telemetryLogs, xp]);

  const { axes, superpower, growthArea, isTiedOrTooClose } = profileResult;
  const [selectedAxisId, setSelectedAxisId] = useState<string | null>(null);

  const selectedAxis = useMemo(() => {
    return (
      axes.find(a => a.id === selectedAxisId) || 
      axes.find(a => a.id === superpower.id) || 
      axes[0]
    );
  }, [axes, selectedAxisId, superpower.id]);

  // SVG Radar Chart geometry (5 vertices)
  const svgWidth = 420;
  const svgHeight = 310;
  const centerX = svgWidth / 2; // 210
  const centerY = 145;
  const radius = 75;
  const numAxes = axes.length;

  const getCoordinates = (index: number, rValue: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const x = centerX + rValue * Math.cos(angle);
    const y = centerY + rValue * Math.sin(angle);
    return { x, y };
  };

  // Specific label coordinates and text-anchors locked to the outer spoke boundary
  // Labels NEVER move with data points, guaranteeing zero collision regardless of score values
  const getAxisLabelConfig = (index: number) => {
    const vertex = getCoordinates(index, radius);
    switch (index) {
      case 0: // Top (Voluntary Seeking)
        return {
          x: centerX,
          y: vertex.y - 18,
          anchor: "middle" as const,
        };
      case 1: // Top-Right (Uncertainty Response) - flows outward right
        return {
          x: vertex.x + 14,
          y: vertex.y - 2,
          anchor: "start" as const,
        };
      case 2: // Bottom-Right (Directed Inquiry) - flows outward right (min 112px away from bottom-left)
        return {
          x: vertex.x + 14,
          y: vertex.y + 16,
          anchor: "start" as const,
        };
      case 3: // Bottom-Left (Generative Inquiry) - flows outward left (min 112px away from bottom-right)
        return {
          x: vertex.x - 14,
          y: vertex.y + 16,
          anchor: "end" as const,
        };
      case 4: // Top-Left (Exploration Range) - flows outward left
        return {
          x: vertex.x - 14,
          y: vertex.y - 2,
          anchor: "end" as const,
        };
      default:
        return {
          x: vertex.x,
          y: vertex.y,
          anchor: "middle" as const,
        };
    }
  };

  const getGridPolygon = (pct: number) => {
    return axes
      .map((_, i) => {
        const { x, y } = getCoordinates(i, radius * pct);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const getDataPolygon = () => {
    return axes
      .map((axis, i) => {
        const { x, y } = getCoordinates(i, (radius * axis.score) / 100);
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143867] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-2xs mb-2">
            <span className="material-symbols-outlined text-sm">radar</span>
            <span>Curiosity Profile</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#143867] tracking-tight">
            How {username} Explores
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Based on your unprompted actions and hypothesis tests during practice lab sessions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart Display */}
        <div id="radar-chart-container" className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-[#f8fafc] rounded-2xl border border-gray-200 shadow-2xs">
          <div className="relative w-full max-w-[420px] flex items-center justify-center">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="overflow-visible select-none w-full max-w-[420px] h-auto"
            >
              <defs>
                <linearGradient id="cqPolygonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#143867" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e4a85" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Grid Concentric Polygons */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((pct, idx) => (
                <polygon
                  key={idx}
                  points={getGridPolygon(pct)}
                  fill="none"
                  stroke={pct === 1.0 ? "#94a3b8" : "#cbd5e1"}
                  strokeWidth={pct === 1.0 ? "1.5" : "1"}
                  strokeDasharray={pct === 1.0 ? "none" : "3,3"}
                />
              ))}

              {/* Axis Spoke Lines */}
              {axes.map((_, i) => {
                const { x, y } = getCoordinates(i, radius);
                return <line key={i} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1.2" />;
              })}

              {/* User Telemetry Profile Polygon */}
              <polygon
                points={getDataPolygon()}
                fill="url(#cqPolygonGrad)"
                stroke="#143867"
                strokeWidth="2.5"
                className="transition-all duration-500 ease-out"
              />

              {/* Interactive Axis Points with 44px Touch Targets */}
              {axes.map((axis, i) => {
                const { x, y } = getCoordinates(i, (radius * axis.score) / 100);
                const labelConfig = getAxisLabelConfig(i);
                const isSelected = selectedAxis.id === axis.id;

                return (
                  <g
                    key={axis.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedAxisId(axis.id)}
                    role="button"
                    aria-label={`${axis.label}: score ${axis.score}`}
                  >
                    {/* Invisible 44px Touch Target for Budget Touchscreens */}
                    <circle cx={x} cy={y} r="22" fill="transparent" />
                    
                    {isSelected && (
                      <circle cx={x} cy={y} r="10" fill="#143867" fillOpacity="0.18" />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4.5}
                      fill={isSelected ? "#ea580c" : "#143867"}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-transform duration-100 ease-out"
                    />
                    <text
                      x={labelConfig.x}
                      y={labelConfig.y}
                      textAnchor={labelConfig.anchor}
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                      className={`tracking-tight select-none transition-colors ${
                        isSelected ? "fill-[#ea580c]" : "fill-[#143867]"
                      }`}
                    >
                      <tspan x={labelConfig.x} dy="0">
                        {axis.label}
                      </tspan>
                      <tspan
                        x={labelConfig.x}
                        dy="13"
                        fontSize="10"
                        fontWeight="800"
                        className={`font-black ${
                          isSelected ? "fill-[#ea580c]" : "fill-gray-500"
                        }`}
                      >
                        ({axis.score})
                      </tspan>
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3 text-center">
            Tap any dimension point or card to inspect
          </p>
        </div>

        {/* Axis Breakdown & Growth Area Cards */}
        <div className="lg:col-span-6 space-y-3">
          {/* Pedagogical Growth Area / Next Discovery Step */}
          <div className="w-full bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <span className="material-symbols-outlined text-[#0284c7] mt-0.5 text-xl shrink-0">
              tips_and_updates
            </span>
            <div className="min-w-0">
              <h5 className="font-black text-[#0369a1] text-xs sm:text-sm uppercase tracking-wider mb-1">
                {isTiedOrTooClose ? "Next Discovery Step" : `Growth Opportunity: ${growthArea.label}`}
              </h5>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {growthArea.growthFeedback}
              </p>
            </div>
          </div>

          {/* 5 CQ Dimensions Cards with Emil Tactile Feedback */}
          {axes.map((axis) => {
            const isSelected = selectedAxis.id === axis.id;
            return (
              <div
                key={axis.id}
                onClick={() => setSelectedAxisId(axis.id)}
                className={`min-h-[44px] p-3.5 rounded-2xl border transition-transform duration-100 ease-out active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? "bg-[#eef2f7] border-[#143867] shadow-2xs"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isSelected ? "text-[#ea580c]" : "text-gray-500"
                      }`}
                    >
                      {axis.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#143867]">
                      {axis.label}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[#143867] text-white"
                        : "bg-gray-100 text-[#143867]"
                    }`}
                  >
                    {axis.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected ? "bg-[#143867]" : "bg-gray-400"
                    }`}
                    style={{ width: `${axis.score}%` }}
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  {axis.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Superpower Highlight Card */}
      <div className="mt-6 p-4 bg-[#143867] rounded-2xl text-white flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
            {isTiedOrTooClose ? "Inquiry Archetype: Balanced Explorer" : `Superpower: ${superpower.label}`}
          </div>
          <p className="text-xs sm:text-sm font-bold text-blue-50 leading-relaxed">
            &ldquo;{superpower.superpowerText}&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
