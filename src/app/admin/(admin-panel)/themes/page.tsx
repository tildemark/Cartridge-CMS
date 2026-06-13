"use client";

import { useState, useEffect } from "react";
import { Palette, CheckCircle, Loader2 } from "lucide-react";

interface ThemeMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<ThemeMeta[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("clarity");
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      // Fetch themes list
      const themesRes = await fetch("/api/themes");
      const themesData = await themesRes.json();

      // Fetch active theme from settings
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();

      if (Array.isArray(themesData)) setThemes(themesData);
      if (settingsData.active_theme) setActiveTheme(settingsData.active_theme);
    } catch (e: any) {
      setError("Failed to load themes data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActivate = async (themeId: string) => {
    setSwitching(themeId);
    setError(null);
    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to activate theme");
      }

      setActiveTheme(themeId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSwitching(null);
    }
  };

  const previewColor: Record<string, string> = {
    clarity: "from-blue-50 to-indigo-100 border-indigo-200",
    prose: "from-amber-50 to-orange-100 border-orange-200",
  };

  const accentColor: Record<string, string> = {
    clarity: "bg-indigo-600",
    prose: "bg-orange-600",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Themes</h1>
        <p className="text-slate-500 text-sm mt-0.5">Customize your public website visual theme styling.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isActive = activeTheme === theme.id;
            const isActivating = switching === theme.id;

            return (
              <div
                key={theme.id}
                className={`
                  bg-white rounded-xl border-2 overflow-hidden flex flex-col transition-all duration-200
                  ${isActive ? "border-indigo-500 shadow-md ring-4 ring-indigo-500/10" : "border-slate-200 hover:border-slate-300"}
                `}
              >
                {/* Visual Preview Banner */}
                <div className={`h-40 bg-gradient-to-br ${previewColor[theme.id] ?? "from-slate-50 to-slate-100"} border-b p-5 flex flex-col justify-end relative`}>
                  <div className="space-y-2">
                    <div className={`h-2 w-10 rounded ${accentColor[theme.id] ?? "bg-slate-400"}`} />
                    <div className="h-3 w-32 rounded bg-black/15" />
                    <div className="h-2 w-20 rounded bg-black/10" />
                  </div>
                  {isActive && (
                    <span className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active Theme
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h2 className="font-bold text-slate-800 text-lg">{theme.name}</h2>
                      <span className="text-slate-400 text-xs font-mono">v{theme.version}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{theme.description}</p>
                    <div className="text-xs text-slate-400 pt-1">
                      By <span className="font-medium text-slate-600">{theme.author}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6">
                    {isActive ? (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-400 font-semibold text-sm py-2 rounded-lg cursor-default border border-slate-200"
                      >
                        Currently Active
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(theme.id)}
                        disabled={switching !== null}
                        className="w-full btn-primary font-semibold text-sm py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        {isActivating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isActivating ? "Activating..." : "Activate Theme"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
