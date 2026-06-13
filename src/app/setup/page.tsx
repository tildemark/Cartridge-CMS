"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ChevronRight, Globe, Lock, Palette, User, Zap } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  activeTheme: string;
  seedSample: boolean;
}

const THEMES = [
  {
    id: "clarity",
    name: "Clarity",
    description: "Clean, professional layout for small businesses",
    preview: "bg-gradient-to-br from-slate-100 to-slate-200",
    accent: "bg-blue-600",
  },
  {
    id: "prose",
    name: "Prose",
    description: "Typographic, content-first design for bloggers",
    preview: "bg-gradient-to-br from-amber-50 to-orange-100",
    accent: "bg-amber-600",
  },
];

// ─── Step indicators ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Welcome", icon: Zap },
  { id: 2, label: "Your Site", icon: Globe },
  { id: 3, label: "Admin Account", icon: User },
  { id: 4, label: "Choose Theme", icon: Palette },
  { id: 5, label: "Finish", icon: CheckCircle },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    siteName: "",
    siteDescription: "",
    siteUrl: "http://localhost:3000",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    activeTheme: "clarity",
    seedSample: true,
  });

  function update(field: keyof FormData, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function validateStep(): string | null {
    if (step === 2) {
      if (!form.siteName.trim()) return "Site name is required";
      try { new URL(form.siteUrl); } catch { return "Site URL must be valid (e.g. https://example.com)"; }
    }
    if (step === 3) {
      if (!form.adminName.trim()) return "Your name is required";
      if (!form.adminEmail.includes("@")) return "Enter a valid email address";
      if (form.adminPassword.length < 8) return "Password must be at least 8 characters";
    }
    return null;
  }

  function nextStep() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setStep((s) => Math.min(s + 1, 5));
    setError(null);
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Setup failed");
      setStep(5);
      setTimeout(() => router.push("/admin"), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Cartridge CMS</span>
          </div>
          <p className="text-slate-400 text-sm">Setup Wizard</p>
        </div>

        {/* Step progress */}
        {step < 5 && (
          <div className="flex items-center justify-center mb-8 gap-1">
            {STEPS.slice(0, 4).map((s, i) => (
              <div key={s.id} className="flex items-center gap-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                  ${step === s.id ? "bg-indigo-500 text-white ring-4 ring-indigo-500/30" :
                    step > s.id ? "bg-indigo-500/30 text-indigo-300" :
                    "bg-slate-800 text-slate-500"}
                `}>
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                {i < 3 && <div className={`w-8 h-0.5 ${step > s.id ? "bg-indigo-500/50" : "bg-slate-800"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

          {/* ── Step 1: Welcome ── */}
          {step === 1 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Welcome to Cartridge CMS</h1>
              <p className="text-slate-400 mb-2 leading-relaxed">
                You&apos;re just a few steps away from launching your website.
                This wizard will help you set up your site name, admin account, and choose a theme.
              </p>
              <p className="text-slate-500 text-sm mb-8">
                This setup will only run once.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Globe, label: "Site settings" },
                  { icon: Lock, label: "Admin account" },
                  { icon: Palette, label: "Pick a theme" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-slate-800/60 rounded-xl p-4 flex flex-col items-center gap-2">
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
              <button onClick={nextStep} className="btn-primary w-full">
                Get Started <ChevronRight className="w-4 h-4 ml-1 inline" />
              </button>
            </div>
          )}

          {/* ── Step 2: Site Info ── */}
          {step === 2 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Your Site</h2>
                  <p className="text-slate-400 text-sm">Basic information about your website</p>
                </div>
              </div>
              <div className="space-y-4">
                <Field label="Site Name" required>
                  <input
                    id="site-name"
                    type="text"
                    placeholder="My Awesome Business"
                    value={form.siteName}
                    onChange={(e) => update("siteName", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Site Description">
                  <input
                    id="site-description"
                    type="text"
                    placeholder="A short tagline or description"
                    value={form.siteDescription}
                    onChange={(e) => update("siteDescription", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Site URL" required>
                  <input
                    id="site-url"
                    type="url"
                    placeholder="https://example.com"
                    value={form.siteUrl}
                    onChange={(e) => update("siteUrl", e.target.value)}
                    className="input"
                  />
                </Field>
              </div>
              {error && <ErrorMsg message={error} />}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button onClick={nextStep} className="btn-primary flex-1">Continue <ChevronRight className="w-4 h-4 ml-1 inline" /></button>
              </div>
            </div>
          )}

          {/* ── Step 3: Admin Account ── */}
          {step === 3 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Admin Account</h2>
                  <p className="text-slate-400 text-sm">Create your administrator login</p>
                </div>
              </div>
              <div className="space-y-4">
                <Field label="Your Name" required>
                  <input
                    id="admin-name"
                    type="text"
                    placeholder="Jane Smith"
                    value={form.adminName}
                    onChange={(e) => update("adminName", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={form.adminEmail}
                    onChange={(e) => update("adminEmail", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Password" required>
                  <input
                    id="admin-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.adminPassword}
                    onChange={(e) => update("adminPassword", e.target.value)}
                    className="input"
                  />
                  {form.adminPassword && (
                    <PasswordStrength password={form.adminPassword} />
                  )}
                </Field>
              </div>
              {error && <ErrorMsg message={error} />}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1">Back</button>
                <button onClick={nextStep} className="btn-primary flex-1">Continue <ChevronRight className="w-4 h-4 ml-1 inline" /></button>
              </div>
            </div>
          )}

          {/* ── Step 4: Theme ── */}
          {step === 4 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Choose a Theme</h2>
                  <p className="text-slate-400 text-sm">You can always change this later</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    id={`theme-${theme.id}`}
                    onClick={() => update("activeTheme", theme.id)}
                    className={`
                      group relative rounded-xl border-2 overflow-hidden text-left transition-all
                      ${form.activeTheme === theme.id
                        ? "border-indigo-500 ring-4 ring-indigo-500/20"
                        : "border-slate-700 hover:border-slate-600"}
                    `}
                  >
                    {/* Preview */}
                    <div className={`h-28 ${theme.preview} flex items-end p-3`}>
                      <div className="space-y-1 w-full">
                        <div className={`${theme.accent} h-1.5 rounded w-8`} />
                        <div className="bg-black/20 h-2 rounded w-24" />
                        <div className="bg-black/10 h-1.5 rounded w-16" />
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">{theme.name}</span>
                        {form.activeTheme === theme.id && (
                          <CheckCircle className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">{theme.description}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mb-6 flex items-start gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <input
                  id="seed-sample"
                  type="checkbox"
                  checked={form.seedSample}
                  onChange={(e) => update("seedSample", e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-indigo-500 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="seed-sample" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                  Install sample content (recommended)
                  <span className="block text-xs text-slate-500 font-normal mt-0.5">
                    Will seed dummy posts, pages, and menus to showcase the theme.
                  </span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-ghost flex-1">Back</button>
                <button onClick={handleFinish} disabled={loading} className="btn-primary flex-1">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Installing…
                    </span>
                  ) : (
                    <>Install Cartridge CMS <ChevronRight className="w-4 h-4 ml-1 inline" /></>
                  )}
                </button>
              </div>
              {error && <ErrorMsg message={error} />}
            </div>
          )}

          {/* ── Step 5: Done ── */}
          {step === 5 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">You&apos;re all set!</h2>
              <p className="text-slate-400 mb-6">
                Cartridge CMS has been installed successfully.
                Redirecting you to the admin dashboard…
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-[grow_2s_ease-in-out_forwards]" />
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Cartridge CMS · Open Source
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-indigo-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="mt-4 flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
      <span className="mt-0.5">⚠</span>
      <span>{message}</span>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const color = score <= 1 ? "bg-red-500" : score <= 2 ? "bg-amber-500" : score <= 3 ? "bg-yellow-400" : "bg-emerald-500";

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? color : "bg-slate-700"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs ${c.pass ? "text-emerald-400" : "text-slate-500"}`}>
            {c.pass ? "✓" : "·"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
