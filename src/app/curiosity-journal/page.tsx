"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProfileStats } from "@/app/actions/profile";

interface JournalEntry {
  id: string;
  question: string;
  hypothesis: string;
  category: string;
  timestamp: string;
  likes: number;
  author: string;
  isUser?: boolean;
}

const INITIAL_PEER_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    question: "Why does a metal coin sink in water, but a giant steel ship floats on the ocean?",
    hypothesis: "I think it is because the shape of the ship traps air inside, making its overall density lower than water!",
    category: "Physics & Buoyancy",
    timestamp: "2 hours ago",
    likes: 24,
    author: "Ananya R. • Kuppam Campus"
  },
  {
    id: "2",
    question: "Why do leaves change color from green to yellow and red when the seasons change?",
    hypothesis: "Maybe the green chlorophyll fades away when there is less sunlight, revealing the hidden yellow colors!",
    category: "Botany & Nature",
    timestamp: "5 hours ago",
    likes: 18,
    author: "Rahul V. • Bangalore Lab"
  },
  {
    id: "3",
    question: "Why do we hear thunder only AFTER we see the lightning flash in the sky?",
    hypothesis: "Because light travels much faster than sound waves through air!",
    category: "Atmosphere & Light",
    timestamp: "1 day ago",
    likes: 31,
    author: "Meera K. • Hubli Science Center"
  }
];

const DIY_EXPERIMENTS = [
  {
    id: "balloon-car",
    title: "Balloon-Powered Bottle Car",
    requiredItems: ["bottle", "balloon", "straw"],
    description: "Use air pressure and Newton's Third Law to propel a plastic bottle across the floor!",
    steps: [
      "Poke a hole through the bottle cap and slide a straw through.",
      "Attach a balloon tightly to the inner end of the straw using a rubber band.",
      "Blow through the straw to inflate the balloon, plug the opening with your thumb, set it on smooth floor, and release!"
    ],
    sciencePrinciple: "Newton's Third Law — For every action (air rushing backward), there is an equal and opposite reaction (car zooming forward)!"
  },
  {
    id: "cartesian-diver",
    title: "The Cartesian Diver",
    requiredItems: ["bottle", "straw"],
    description: "Make a 'magical' diver rise and sink inside a sealed water bottle with just a squeeze!",
    steps: [
      "Cut a straw to about 2 inches, fold it in half, and attach small clay or paperclips so it barely floats.",
      "Drop the folded straw into a bottle filled to the brim with water and screw the cap on tightly.",
      "Squeeze the sides of the bottle hard—watch your diver sink! Release to make it float back up."
    ],
    sciencePrinciple: "Archimedes' Principle & Boyle's Law — Squeezing compresses air inside the straw, increasing density so it sinks!"
  },
  {
    id: "leaf-chromatography",
    title: "Hidden Leaf Pigment Rainbow",
    requiredItems: ["leaf", "water"],
    description: "Separate the hidden yellow and orange pigments inside a green garden leaf!",
    steps: [
      "Crush a fresh green leaf at the bottom of a small glass with a spoonful of warm water or rubbing alcohol.",
      "Dip a strip of paper towel so only the tip touches the liquid.",
      "Wait 20 minutes as the liquid climbs up the paper, separating green chlorophyll from yellow carotenoids!"
    ],
    sciencePrinciple: "Chromatography — Different color molecules move at different speeds across filter paper!"
  }
];

export default function CuriosityJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_PEER_ENTRIES);
  const [newQuestion, setNewQuestion] = useState("");
  const [newHypothesis, setNewHypothesis] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Physics & Mechanics");
  const [activeTab, setActiveTab] = useState<"journal" | "diy">("journal");
  const [selectedItems, setSelectedItems] = useState<string[]>(["bottle", "balloon"]);
  const [userXp, setUserXp] = useState<number>(450);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  useEffect(() => {
    async function loadStats() {
      const stats = await getProfileStats();
      if (stats && "data" in stats && stats.data && typeof stats.data.xp === "number") {
        setUserXp(stats.data.xp);
      }
    }
    loadStats();

    const savedEntries = localStorage.getItem("agastya_curiosity_journal");
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        setEntries(parsed);
      } catch (e) {
        console.error("Error parsing saved journal entries:", e);
      }
    }
  }, []);

  const handleLogHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newHypothesis.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      hypothesis: newHypothesis.trim(),
      category: selectedCategory,
      timestamp: "Just now",
      likes: 1,
      author: "You (Agastya Explorer)",
      isUser: true
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("agastya_curiosity_journal", JSON.stringify(updated));
    setNewQuestion("");
    setNewHypothesis("");
    setHasLoggedToday(true);
  };

  const handleApplaud = (id: string) => {
    const updated = entries.map(ent =>
      ent.id === id ? { ...ent, likes: ent.likes + 1 } : ent
    );
    setEntries(updated);
    localStorage.setItem("agastya_curiosity_journal", JSON.stringify(updated));
  };

  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const filteredDIY = DIY_EXPERIMENTS.filter(exp =>
    exp.requiredItems.some(req => selectedItems.includes(req))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff7eb] to-[#fff3e0] text-[#143867] pb-28">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#f37021]/20 px-4 py-3.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#143867] hover:text-[#f37021] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#f37021] text-white font-black text-xs shadow-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">local_fire_department</span>
              <span>Daily Spark Lab</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        {/* Playful Hero Section */}
        <section className="bg-gradient-to-r from-[#143867] via-[#1b4b8a] to-[#143867] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none text-9xl font-black">
            ?
          </div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe16d] text-[#221b00] text-xs font-black uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              <span>Aah! • Aha! • Ha-ha!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#ffe16d]">
              The Agastya Curiosity Journal
            </h1>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl">
              Real scientists start by asking <strong>&ldquo;Why?&rdquo;</strong> Record your daily hypotheses, applaud questions from fellow scholars across India, or build zero-cost experiments at home!
            </p>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab("journal")}
            className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 ${
              activeTab === "journal"
                ? "bg-[#f37021] text-white scale-105"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>Daily &ldquo;Why?&rdquo; Journal &amp; Peer Wall</span>
          </button>
          <button
            onClick={() => setActiveTab("diy")}
            className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 ${
              activeTab === "diy"
                ? "bg-[#143867] text-[#ffe16d] scale-105"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-base">recycling</span>
            <span>DIY Trash-to-Treasure Home Lab</span>
          </button>
        </div>

        {activeTab === "journal" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Log Your Hypothesis Form */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-lg space-y-5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    📝
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#143867]">
                      Log Today&apos;s Hypothesis
                    </h3>
                    <p className="text-xs text-gray-500">
                      Every question sparks discovery!
                    </p>
                  </div>
                </div>

                {hasLoggedToday ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <span>Amazing! Your hypothesis is recorded in your field notebook.</span>
                  </div>
                ) : null}

                <form onSubmit={handleLogHypothesis} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1">
                      1. What is your &ldquo;Why?&rdquo; Question?
                    </label>
                    <textarea
                      rows={2}
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="e.g., Why do oil and water never mix together?"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f37021] text-xs text-[#143867] font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1">
                      2. What is your Hypothesis? (Why do you think it happens?)
                    </label>
                    <textarea
                      rows={3}
                      value={newHypothesis}
                      onChange={(e) => setNewHypothesis(e.target.value)}
                      placeholder="e.g., I think oil molecules are lighter than water molecules..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f37021] text-xs text-[#143867] font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1">
                      3. Science Branch
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#143867]"
                    >
                      <option value="Physics & Mechanics">Physics &amp; Mechanics</option>
                      <option value="Chemistry & Reactions">Chemistry &amp; Reactions</option>
                      <option value="Botany & Nature">Botany &amp; Nature</option>
                      <option value="Astronomy & Space">Astronomy &amp; Space</option>
                      <option value="Mathematics & Logic">Mathematics &amp; Logic</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#f37021] hover:bg-[#d95e16] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Log Hypothesis to Notebook</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Community Curiosity Wall */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#143867] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f37021]">forum</span>
                  <span>Community Curiosity Wall</span>
                </h3>
                <span className="text-xs text-gray-500 font-bold">
                  {entries.length} Questions Logged
                </span>
              </div>

              <div className="space-y-4">
                {entries.map((ent) => (
                  <div
                    key={ent.id}
                    className={`p-5 rounded-3xl bg-white border transition-all hover:shadow-md ${
                      ent.isUser
                        ? "border-[#f37021] ring-2 ring-[#f37021]/10"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                        {ent.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {ent.timestamp}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-[#143867] leading-snug mb-2">
                      &ldquo;{ent.question}&rdquo;
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-700 font-medium bg-amber-50/60 p-3 rounded-2xl border border-amber-100 mb-3">
                      <span className="font-bold text-[#f37021]">Hypothesis: </span>
                      {ent.hypothesis}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-500">
                        {ent.author}
                      </span>

                      <button
                        onClick={() => handleApplaud(ent.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-[#143867] text-xs font-black transition-all active:scale-90"
                      >
                        <span>👏</span>
                        <span>{ent.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* DIY Trash-to-Treasure Home Lab */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-[#143867] shadow-lg space-y-4">
              <h3 className="text-base sm:text-lg font-black text-[#143867] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f37021]">inventory_2</span>
                <span>1. What materials do you have at home right now?</span>
              </h3>
              <p className="text-xs text-gray-600">
                Check off any items you can find in your home or garden to discover instant zero-cost Agastya experiments!
              </p>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {[
                  { id: "bottle", label: "Plastic Bottle 🍼" },
                  { id: "balloon", label: "Balloon 🎈" },
                  { id: "straw", label: "Straw 🥤" },
                  { id: "leaf", label: "Garden Leaf 🌿" },
                  { id: "water", label: "Water 💧" }
                ].map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border-2 flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? "bg-[#143867] text-[#ffe16d] border-[#143867] shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span>{isSelected ? "✓" : "+"}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black text-[#143867] flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">science</span>
                <span>2. Recommended DIY Zero-Cost Experiments ({filteredDIY.length})</span>
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {filteredDIY.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-base sm:text-lg font-black text-[#143867]">
                        {exp.title}
                      </h4>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-full">
                        Zero-Cost Home Lab
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      {exp.description}
                    </p>

                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        How to Build It:
                      </h5>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-900 font-medium">
                        {exp.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-base">lightbulb</span>
                      <span><strong>Science Secret:</strong> {exp.sciencePrinciple}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        <Link
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
          href="/dashboard"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">home</span>
          </div>
        </Link>
        <Link
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
          href="/leaderboard"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">emoji_events</span>
          </div>
        </Link>
        <Link
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
          href="/discover"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">search</span>
          </div>
        </Link>
        <Link
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
          href="/profile"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
        </Link>
        <Link
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
          href="/settings"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
