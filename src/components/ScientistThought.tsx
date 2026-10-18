"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitInquiryResponse } from "@/app/actions/inquiry";
import { INQUIRY_PROMPTS, choosePromptType } from "@/config/inquiryMatrix";

/**
 * "Quick Scientist's Thought": the open-inquiry prompt from the Agastya
 * curiosity framework (section 5). It sits after the experiment and before
 * the subject questions ("measure first; develop second").
 *
 * The answer is coded on the server with the Question Matrix. The codes are
 * never shown to the learner and every learner gets the same neutral reply,
 * so no one gets individual coaching that could affect their ranking.
 */
export function ScientistThought({
  mockTestId,
  experimentIndex,
  experimentName,
  experimentCount,
  anomalyTriggered,
}: {
  mockTestId: number;
  experimentIndex: number;
  experimentName: string;
  experimentCount: number;
  anomalyTriggered: boolean;
}) {
  const storageKey = `reflection_${mockTestId}_${experimentIndex}`;
  const codesKey = `inquiry_code_${mockTestId}_${experimentIndex}`;
  const promptType = choosePromptType({ anomalyTriggered, experimentIndex, experimentCount });
  const promptText = INQUIRY_PROMPTS[promptType];

  // The page gives this component a key per experiment, so state starts fresh
  // for each one and reads that experiment's saved text.
  const readStored = (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const [text, setText] = useState(() => readStored(storageKey) ?? "");
  const [saving, setSaving] = useState(false);
  const [savedText, setSavedText] = useState<string | null>(() => readStored(`${storageKey}_submitted`));

  const save = async () => {
    const answer = text.trim();
    if (!answer) {
      toast.info("Write your question first. Any language is fine!", { duration: 2000 });
      return;
    }
    setSaving(true);
    try {
      localStorage.setItem(storageKey, answer);
    } catch {}
    try {
      const res = await submitInquiryResponse({
        mockTestId,
        experimentIndex,
        experimentName,
        promptType,
        response: answer,
        anomalyTriggered,
      });
      if (res.codes) {
        try {
          localStorage.setItem(codesKey, JSON.stringify(res.codes));
        } catch {}
      }
      try {
        localStorage.setItem(`${storageKey}_submitted`, answer);
      } catch {}
      setSavedText(answer);
      toast.success("Saved! Thank you for sharing your thought. 🔬", { duration: 2500 });
    } catch (err) {
      console.error("Could not send thought:", err);
      toast.success("Saved on this phone. Thank you! 🔬", { duration: 2500 });
    } finally {
      setSaving(false);
    }
  };

  const isSaved = savedText !== null && savedText === text.trim() && text.trim() !== "";

  return (
    <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="text-2xl shrink-0" aria-hidden>💡</span>
        <div>
          <h4 className="text-sm font-black text-amber-950">Quick Scientist&apos;s Thought</h4>
          <p className="text-sm text-amber-950 mt-1 leading-snug" id="scientist-thought-prompt">
            {promptText}
          </p>
          <p className="text-xs text-amber-800/80 mt-1">You can write in any language. There is no wrong answer.</p>
        </div>
      </div>
      <textarea
        id="scientist-thought-input"
        aria-labelledby="scientist-thought-prompt"
        rows={2}
        maxLength={600}
        value={text}
        onChange={(e) => {
          const val = e.target.value;
          setText(val);
          try {
            localStorage.setItem(storageKey, val);
          } catch {}
        }}
        placeholder="Write here…"
        className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
      />
      <button
        type="button"
        id="save-thought-btn"
        onClick={save}
        disabled={saving || isSaved}
        className="w-full sm:w-auto min-h-[44px] px-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-amber-950 font-black text-sm rounded-xl transition-colors active:scale-95 cursor-pointer"
      >
        {saving ? "Saving…" : isSaved ? "✓ Saved" : "Save my thought"}
      </button>
    </div>
  );
}
