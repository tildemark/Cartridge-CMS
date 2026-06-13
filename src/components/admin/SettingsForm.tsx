"use client";

import { useState } from "react";
import { Save, Globe, Type, Palette, Loader2 } from "lucide-react";

interface SettingsFormProps {
  initial: {
    site_name: string;
    site_description: string;
    site_url: string;
    posts_per_page: string;
    active_theme: string;
  };
}

export default function SettingsForm({ initial }: SettingsFormProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure your website</p>
        </div>
        <button id="settings-save" type="submit" disabled={saving} className="btn-primary btn-sm flex items-center gap-1.5">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-2">
          ✓ Settings saved successfully
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          ⚠ {error}
        </div>
      )}

      {/* General */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Globe className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">General</h2>
        </div>

        <Field label="Site Name" htmlFor="setting-site-name">
          <input
            id="setting-site-name"
            type="text"
            value={form.site_name}
            onChange={(e) => update("site_name", e.target.value)}
            className="input-admin"
          />
        </Field>

        <Field label="Site Description" htmlFor="setting-site-description">
          <textarea
            id="setting-site-description"
            rows={2}
            value={form.site_description}
            onChange={(e) => update("site_description", e.target.value)}
            className="input-admin resize-none"
          />
        </Field>

        <Field label="Site URL" htmlFor="setting-site-url">
          <input
            id="setting-site-url"
            type="url"
            value={form.site_url}
            onChange={(e) => update("site_url", e.target.value)}
            className="input-admin"
          />
        </Field>
      </div>

      {/* Reading */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Type className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">Reading</h2>
        </div>

        <Field label="Posts Per Page" htmlFor="setting-posts-per-page">
          <input
            id="setting-posts-per-page"
            type="number"
            min={1}
            max={100}
            value={form.posts_per_page}
            onChange={(e) => update("posts_per_page", e.target.value)}
            className="input-admin w-32"
          />
        </Field>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 pt-2">
        {label}
      </label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}
