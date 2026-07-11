"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAvatar } from "@/app/actions/profile";
import { AVATARS } from "@/utils/gamification";

interface AvatarPickerModalProps {
  currentAvatarUrl: string;
  onClose: () => void;
  onSuccess: (url: string) => void;
}

export function AvatarPickerModal({ currentAvatarUrl, onClose, onSuccess }: AvatarPickerModalProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarSelect = async (url: string) => {
    setIsUpdating(true);
    try {
      const result = await updateAvatar(url) as any;
      if (result.success) {
        // Persist avatar selection in localStorage since the DB column doesn't exist
        if (typeof window !== "undefined") {
          localStorage.setItem("curiosity_avatar_url", url);
        }
        onSuccess(url);
        onClose();
        router.refresh();
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err: any) {
      console.error("Failed to update avatar:", err);
      alert(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#143867]">Choose your Legend</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              disabled={isUpdating}
              onClick={() => handleAvatarSelect(avatar.url)}
              className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all cursor-pointer disabled:cursor-wait disabled:opacity-50 ${
                currentAvatarUrl === avatar.url
                  ? "bg-[#ffe16d] ring-2 ring-yellow-400 shadow-md"
                  : "hover:bg-gray-50 active:scale-95"
              }`}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-bold text-[#143867] text-center">{avatar.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
