import React, { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X, Save, KeyRound } from "lucide-react";
import { Navbar } from "../components/Navbar";
import {
  fetchPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  verifyAdmin,
} from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import { toast, Toaster } from "sonner";

const EMPTY = {
  name: "",
  style: "Lo-Fi",
  vibe: "",
  use_case: "Portrait",
  platforms: [],
  hotness: 4,
  prompt_text: "",
  reference_image_url: "",
  reference_guidelines: "",
  tags: [],
  aspect_ratio: "9:16",
  duration: "",
  remix_tips: [],
  micro_badges: [],
  signature_color: "",
};

const STYLE_OPTS = ["Lo-Fi", "Cyberpunk", "Y2K", "Cinematic", "Dreamy Pastel", "Anime"];
const PLATFORM_OPTS = ["TikTok", "Instagram", "YouTube", "Pinterest", "LinkedIn", "Twitter", "Twitch", "Spotify"];
const USECASE_OPTS = ["Portrait", "Thumbnail", "Product", "Quote", "Cover Art", "Avatar", "Reel B-roll", "LinkedIn / Headshot"];
const BADGE_OPTS = ["Trending", "Viral", "Quick Remix", "Premium Look"];

const TokenGate = ({ onAuthed }) => {
  const [token, setToken] = useState(localStorage.getItem("pp_admin_token") || "");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyAdmin(token);
      localStorage.setItem("pp_admin_token", token);
      onAuthed(token);
      toast.success("Welcome, curator.");
    } catch {
      toast.error("Invalid admin token");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="bg-white border-2 border-[#121212] rounded-2xl pp-shadow w-full max-w-md p-7"
        data-testid="admin-login-form"
      >
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={20} strokeWidth={2.6} />
          <h2 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>
            Admin access
          </h2>
        </div>
        <p className="text-sm text-[#4A4A4A] mb-5">
          Enter your admin token to curate the library.
        </p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          data-testid="admin-token-input"
          className="w-full border-2 border-[#121212] rounded-full px-4 py-3 mb-4 focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px]"
        />
        <button
          disabled={loading || !token}
          type="submit"
          data-testid="admin-login-button"
          className="w-full bg-[#FF6B35] text-white font-semibold border-2 border-[#121212] rounded-full py-3 pp-shadow-sm pp-press hover:bg-[#E55A2B] disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Unlock library"}
        </button>
        {/*
          NOTE: the original build printed the dev default admin token
          right here in the login form ("Default dev token: ..."). That's
          a real security hole on a public deployment (anyone visiting
          /admin would see the password hint) and has been removed.
          Set a real ADMIN_TOKEN in backend/.env before deploying.
        */}
      </form>
    </div>
  );
};

const TagInput = ({ value = [], onChange, placeholder, testid }) => {
  const [text, setText] = useState("");
  const add = () => {
    const v = text.trim();
    if (!v) return;
    onChange([...value, v]);
    setText("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 border-2 border-[#121212] bg-white rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="hover:text-red-500"
              aria-label="Remove"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          data-testid={testid}
          className="flex-1 border-2 border-[#121212] rounded-full px-3 py-2 text-sm focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="bg-white border-2 border-[#121212] rounded-full px-3 py-2 text-sm font-semibold pp-shadow-sm pp-press"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const ToggleList = ({ options, value = [], onChange, testidPrefix }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const active = value.includes(o);
      return (
        <button
          key={o}
          type="button"
          data-testid={`${testidPrefix}-${o.toLowerCase().replace(/\s+/g, "-")}`}
          onClick={() =>
            onChange(active ? value.filter((v) => v !== o) : [...value, o])
          }
          className={`pp-chip ${active ? "pp-chip-active" : ""}`}
        >
          {o}
        </button>
      );
    })}
  </div>
);

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs uppercase font-bold tracking-wider text-[#4A4A4A]">{label}</span>
    {children}
  </label>
);

const inputCls =
  "border-2 border-[#121212] rounded-xl px-3 py-2 text-sm focus:outline-none bg-white";

const PromptForm = ({ initial, onCancel, onSaved, token }) => {
  // Merge with EMPTY so every controlled field always has a defined value,
  // even when editing a card saved before a field existed (fixes the
  // "uncontrolled input becoming controlled" warning from testing).
  const [data, setData] = useState({ ...EMPTY, ...(initial || {}) });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const save = async () => {
    if (!data.name || !data.prompt_text) {
      toast.error("Name and prompt text are required");
      return;
    }

    // Coerce hotness safely — Number("") is NaN, which fails Pydantic's
    // int validation server-side and was the actual cause of the 422
    // found during testing. Clamp to 1-5 and fall back to 4 if invalid.
    const hotnessNum = Number(data.hotness);
    const payload = {
      ...data,
      hotness: Number.isFinite(hotnessNum) ? Math.max(1, Math.min(5, hotnessNum)) : 4,
    };

    setSaving(true);
    try {
      if (initial?.id) {
        await updatePrompt(initial.id, payload, token);
        toast.success("Prompt updated");
      } else {
        await createPrompt(payload, token);
        toast.success("Prompt created");
      }
      onSaved();
    } catch (e) {
      // Previously this rendered e?.response?.data?.detail directly, which
      // is an ARRAY OF OBJECTS on a FastAPI 422 validation error — React
      // crashed trying to render it. getErrorMessage() always returns a
      // plain string now.
      toast.error(getErrorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#121212] rounded-2xl pp-shadow p-6 flex flex-col gap-5" data-testid="prompt-form">
      <h3 className="text-2xl font-black" style={{ fontFamily: "Outfit" }}>
        {initial?.id ? "Edit prompt" : "New prompt"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <input className={inputCls} value={data.name} onChange={(e) => set("name", e.target.value)} data-testid="form-name" />
        </Field>
        <Field label="Vibe (short)">
          <input className={inputCls} value={data.vibe} onChange={(e) => set("vibe", e.target.value)} data-testid="form-vibe" />
        </Field>
        <Field label="Style">
          <select className={inputCls} value={data.style} onChange={(e) => set("style", e.target.value)} data-testid="form-style">
            {STYLE_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Use Case">
          <select className={inputCls} value={data.use_case} onChange={(e) => set("use_case", e.target.value)} data-testid="form-usecase">
            {USECASE_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Aspect Ratio">
          <input className={inputCls} value={data.aspect_ratio} onChange={(e) => set("aspect_ratio", e.target.value)} data-testid="form-aspect" />
        </Field>
        <Field label="Hotness (1–5)">
          <input
            type="number" min="1" max="5"
            className={inputCls}
            value={data.hotness}
            onChange={(e) => {
              const raw = e.target.value;
              // Keep the field editable (allow empty string while typing)
              // but never store NaN in state.
              if (raw === "") { set("hotness", ""); return; }
              const n = Number(raw);
              set("hotness", Number.isFinite(n) ? Math.max(1, Math.min(5, n)) : data.hotness);
            }}
            data-testid="form-hotness"
          />
        </Field>
        <Field label="Duration (optional)">
          <input className={inputCls} value={data.duration ?? ""} onChange={(e) => set("duration", e.target.value)} data-testid="form-duration" />
        </Field>
        <Field label="Reference image URL">
          <input className={inputCls} value={data.reference_image_url} onChange={(e) => set("reference_image_url", e.target.value)} data-testid="form-image-url" />
        </Field>
      </div>

      <Field label="Prompt text (copy-paste)">
        <textarea
          rows={4}
          className={`${inputCls} font-mono`}
          value={data.prompt_text}
          onChange={(e) => set("prompt_text", e.target.value)}
          data-testid="form-prompt-text"
        />
      </Field>

      <Field label="Reference image guidelines">
        <textarea
          rows={2}
          className={inputCls}
          value={data.reference_guidelines}
          onChange={(e) => set("reference_guidelines", e.target.value)}
          data-testid="form-ref-guidelines"
        />
      </Field>

      <Field label="Platforms">
        <ToggleList options={PLATFORM_OPTS} value={data.platforms} onChange={(v) => set("platforms", v)} testidPrefix="form-platform" />
      </Field>

      <Field label="Micro badges">
        <ToggleList options={BADGE_OPTS} value={data.micro_badges} onChange={(v) => set("micro_badges", v)} testidPrefix="form-badge" />
      </Field>

      <Field label="Tags">
        <TagInput value={data.tags} onChange={(v) => set("tags", v)} placeholder="#lofi" testid="form-tag-input" />
      </Field>

      <Field label="Remix tips">
        <TagInput value={data.remix_tips} onChange={(v) => set("remix_tips", v)} placeholder="Add a remix tip and press Enter" testid="form-remix-input" />
      </Field>

      <Field label="Signature color (optional hex, e.g. #FFCBA4)">
        <input className={inputCls} value={data.signature_color ?? ""} onChange={(e) => set("signature_color", e.target.value)} data-testid="form-signature-color" />
      </Field>

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          data-testid="form-save-button"
          className="inline-flex items-center gap-2 bg-[#FF6B35] text-white font-semibold border-2 border-[#121212] rounded-full px-5 py-2 pp-shadow-sm pp-press disabled:opacity-50"
        >
          <Save size={16} strokeWidth={2.6} /> {saving ? "Saving…" : "Save prompt"}
        </button>
        <button
          onClick={onCancel}
          data-testid="form-cancel-button"
          className="bg-white text-[#121212] font-semibold border-2 border-[#121212] rounded-full px-5 py-2 pp-shadow-sm pp-press"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("AdminPage crashed:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto mt-16 bg-white border-2 border-[#121212] rounded-2xl pp-shadow p-8 text-center">
          <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "Outfit" }}>
            Something broke in the admin panel.
          </h2>
          <p className="text-[#4A4A4A] mb-5 text-sm">
            Reload the page to try again. Your library data is safe — this only affects the admin UI.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#FF6B35] text-white font-semibold border-2 border-[#121212] rounded-full px-5 py-2 pp-shadow-sm pp-press"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminPageInner() {
  const [token, setToken] = useState(localStorage.getItem("pp_admin_token") || "");
  const [authed, setAuthed] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [editing, setEditing] = useState(null); // null=closed, {}=new, obj=edit
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    verifyAdmin(token).then(() => setAuthed(true)).catch(() => {
      localStorage.removeItem("pp_admin_token");
      setToken("");
    });
  }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPrompts();
      setPrompts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prompt?")) return;
    try {
      await deletePrompt(id, token);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Delete failed"));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Toaster position="top-right" />
      <Navbar />

      {!authed ? (
        <TokenGate onAuthed={(t) => { setToken(t); setAuthed(true); }} />
      ) : (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
            <div>
              <h1 className="text-4xl font-black" style={{ fontFamily: "Outfit" }}>
                Admin · Curate library
              </h1>
              <p className="text-[#4A4A4A] mt-1 text-sm">{prompts.length} prompts in the library</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing({})}
                data-testid="admin-new-button"
                className="inline-flex items-center gap-2 bg-[#FF6B35] text-white font-semibold border-2 border-[#121212] rounded-full px-5 py-2.5 pp-shadow-sm pp-press"
              >
                <Plus size={16} strokeWidth={2.8} /> New prompt
              </button>
              <button
                onClick={() => { localStorage.removeItem("pp_admin_token"); setAuthed(false); setToken(""); }}
                data-testid="admin-logout-button"
                className="bg-white text-[#121212] font-semibold border-2 border-[#121212] rounded-full px-4 py-2.5 pp-shadow-sm pp-press"
              >
                Sign out
              </button>
            </div>
          </div>

          {editing !== null && (
            <div className="mb-8">
              <PromptForm
                initial={editing}
                token={token}
                onCancel={() => setEditing(null)}
                onSaved={() => { setEditing(null); load(); }}
              />
            </div>
          )}

          <div className="bg-white border-2 border-[#121212] rounded-2xl pp-shadow overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b-2 border-[#121212] bg-[#FFF7E6] text-xs font-bold uppercase tracking-wider">
              <span className="col-span-4">Name</span>
              <span className="col-span-2">Style</span>
              <span className="col-span-2">Use case</span>
              <span className="col-span-1 text-center">Hot</span>
              <span className="col-span-3 text-right">Actions</span>
            </div>
            {loading ? (
              <div className="p-8 text-center text-[#4A4A4A]" data-testid="admin-loading">Loading…</div>
            ) : prompts.length === 0 ? (
              <div className="p-8 text-center text-[#4A4A4A]">No prompts yet.</div>
            ) : (
              prompts.map((p) => (
                <div
                  key={p.id}
                  data-testid={`admin-row-${p.id}`}
                  className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#121212]/10 items-center hover:bg-[#FAFAFA]"
                >
                  <span className="col-span-4 font-semibold truncate">{p.name}</span>
                  <span className="col-span-2 text-sm">{p.style}</span>
                  <span className="col-span-2 text-sm">{p.use_case}</span>
                  <span className="col-span-1 text-center font-bold">{p.hotness}</span>
                  <span className="col-span-3 flex justify-end gap-2">
                    <button
                      onClick={() => setEditing(p)}
                      data-testid={`admin-edit-${p.id}`}
                      className="inline-flex items-center gap-1 bg-white border-2 border-[#121212] rounded-full px-3 py-1.5 text-xs font-semibold pp-shadow-xs pp-press"
                    >
                      <Pencil size={12} strokeWidth={2.8} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      data-testid={`admin-delete-${p.id}`}
                      className="inline-flex items-center gap-1 bg-[#FF3B30] text-white border-2 border-[#121212] rounded-full px-3 py-1.5 text-xs font-semibold pp-shadow-xs pp-press"
                    >
                      <Trash2 size={12} strokeWidth={2.8} /> Delete
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminErrorBoundary>
      <AdminPageInner />
    </AdminErrorBoundary>
  );
}
