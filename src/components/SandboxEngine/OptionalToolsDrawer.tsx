"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";

interface OptionalToolsDrawerProps {
  title?: string;
  description?: string;
  triggerLabel?: string;
  icon?: string;
  children: React.ReactNode;
}

export function OptionalToolsDrawer({
  title = "Optional Lab Equipment",
  description = "Explore alternative materials and secondary variables.",
  triggerLabel = "Extra Tools",
  icon = "tune",
  children,
}: OptionalToolsDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[11px] font-bold text-sky-300 bg-gray-800 hover:bg-gray-700/90 active:scale-95 transition-transform px-2.5 py-1 rounded-lg border border-gray-700 shadow-xs cursor-pointer shrink-0"
          aria-label={triggerLabel}
        >
          <span className="material-symbols-outlined text-sm text-sky-400">{icon}</span>
          <span>{triggerLabel}</span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity duration-150" />
        <Drawer.Content className="bg-gray-900 border-t border-gray-700 flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 max-h-[85vh] z-50 p-4 text-white shadow-2xl focus:outline-none">
          <Drawer.Handle className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto mb-3" />
          <div className="max-w-md mx-auto w-full space-y-3 pb-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div>
                <Drawer.Title className="text-sm font-black text-gray-100 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sky-400 text-base">{icon}</span>
                  {title}
                </Drawer.Title>
                <Drawer.Description className="text-[11px] text-gray-400 mt-0.5">
                  {description}
                </Drawer.Description>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="pt-2">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
