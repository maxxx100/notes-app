'use client';

import { useState, useEffect, useRef } from 'react';

type Note = {
  id: number;
  title: string;
  body: string;
  color: string;
  created_at: string;
};

const CARD_COLORS: Record<string, string> = {
  sand: 'bg-[#EDE4CF]',
  rust: 'bg-[#DDB99A]',
  sage: 'bg-[#B8CCAF]',
  rose: 'bg-[#E0BFB8]',
  clay: 'bg-[#CEB89A]',
};

const SWATCH_COLORS: Record<string, string> = {
  sand: '#D4C4A0',
  rust: '#C49070',
  sage: '#8CAA7F',
  rose: '#C89088',
  clay: '#AA9470',
};

const COLORS = ['sand', 'rust', 'sage', 'rose', 'clay'] as const;
type Color = (typeof COLORS)[number];

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function LockClosedIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <rect x="4" y="11" width="16" height="11" rx="2" />
    </svg>
  );
}

function LockOpenIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11V7a4 4 0 0 1 8 0" />
      <rect x="4" y="11" width="16" height="11" rx="2" />
    </svg>
  );
}

export default function NotesGrid() {
  const [notes, setNotes] = useState<Note[]>([]);

  // ── Auth state ──────────────────────────────────────────────────────────
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authPending, setAuthPending] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  // ── Create state ────────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newColor, setNewColor] = useState<Color>('sand');
  const [saving, setSaving] = useState(false);
  const newTitleRef = useRef<HTMLInputElement>(null);

  // ── Edit state ──────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editColor, setEditColor] = useState<Color>('sand');

  // Hydrate notes and session status
  useEffect(() => {
    fetch('/api/notes').then((r) => r.json()).then(setNotes);
    fetch('/api/auth').then((r) => r.json()).then(({ ok }) => {
      if (ok) setIsUnlocked(true);
    });
  }, []);

  useEffect(() => {
    if (creating) newTitleRef.current?.focus();
  }, [creating]);

  useEffect(() => {
    if (showPasswordModal) passwordRef.current?.focus();
  }, [showPasswordModal]);

  // ── Auth ────────────────────────────────────────────────────────────────

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setAuthPending(true);
    setAuthError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput }),
    });
    setAuthPending(false);
    if (res.ok) {
      setIsUnlocked(true);
      setShowPasswordModal(false);
      setPasswordInput('');
    } else {
      setAuthError('Incorrect password.');
      passwordRef.current?.select();
    }
  }

  async function handleLock() {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsUnlocked(false);
    setEditingId(null);
    setCreating(false);
  }

  // ── Create ──────────────────────────────────────────────────────────────

  function openCreate() {
    setNewTitle('');
    setNewBody('');
    setNewColor('sand');
    setCreating(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() && !newBody.trim()) return;
    setSaving(true);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), body: newBody.trim(), color: newColor }),
    });
    const note = await res.json();
    setNotes((prev) => [note, ...prev]);
    setSaving(false);
    setCreating(false);
  }

  // ── Edit ────────────────────────────────────────────────────────────────

  function openEdit(note: Note) {
    if (!isUnlocked) return;
    setCreating(false);
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditColor((note.color as Color) ?? 'sand');
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, body: editBody, color: editColor }),
    });
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    setEditingId((current) => (current === id ? null : current));
  }

  function handleCardBlur(e: React.FocusEvent<HTMLDivElement>, id: number) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      saveEdit(id);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    setEditingId(null);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  }

  // ───────────────────────────────────────────────────────────────────────

  return (
    <>
      <header className="mb-16 flex items-center justify-between">
        <h1 className="font-serif text-5xl font-normal tracking-[0.08em] text-[#2C2825]">
          Notes
        </h1>
        <div className="flex items-center gap-6">
          {isUnlocked && (
            <button
              onClick={openCreate}
              className="text-[10px] uppercase tracking-[0.14em] text-[#8A7E76] hover:text-[#2C2825] transition-colors"
            >
              New note
            </button>
          )}
          <button
            onClick={isUnlocked ? handleLock : () => setShowPasswordModal(true)}
            aria-label={isUnlocked ? 'Lock' : 'Unlock to edit'}
            className="text-[#8A7E76] hover:text-[#2C2825] transition-colors"
          >
            {isUnlocked ? <LockOpenIcon /> : <LockClosedIcon />}
          </button>
        </div>
      </header>

      {notes.length === 0 ? (
        <p className="text-[#8A7E76] text-sm tracking-wide">No notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {notes.map((note) =>
            editingId === note.id ? (
              // ── Edit card ────────────────────────────────────────────────
              <div
                key={note.id}
                onBlur={(e) => handleCardBlur(e, note.id)}
                onKeyDown={(e) => { if (e.key === 'Escape') setEditingId(null); }}
                className={`${CARD_COLORS[editColor] ?? CARD_COLORS.sand} rounded-sm p-9 shadow-[0_2px_10px_rgba(44,40,37,0.11)] flex flex-col gap-4`}
              >
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="font-serif text-xl font-semibold tracking-[0.02em] text-[#2C2825] bg-transparent outline-none border-b border-[#2C2825]/10 pb-1.5 w-full"
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={6}
                  className="text-sm text-[#4A433D] bg-transparent outline-none resize-none leading-loose w-full"
                />
                <div className="flex items-center gap-2.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onMouseDown={(e) => { e.preventDefault(); setEditColor(c); }}
                      style={{ backgroundColor: SWATCH_COLORS[c] }}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        editColor === c
                          ? 'ring-2 ring-offset-1 ring-[#2C2825]/25 scale-110'
                          : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#2C2825]/[0.07]">
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleDelete(note.id); }}
                    className="text-[10px] uppercase tracking-[0.12em] text-[#8A7E76] hover:text-[#A0432A] transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); saveEdit(note.id); }}
                    className="text-[10px] uppercase tracking-[0.12em] text-[#2C2825] hover:text-[#4A433D] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // ── Read card ────────────────────────────────────────────────
              <article
                key={note.id}
                onClick={() => openEdit(note)}
                className={`${CARD_COLORS[note.color] ?? CARD_COLORS.sand} rounded-sm p-9 shadow-[0_1px_4px_rgba(44,40,37,0.07)] flex flex-col transition-shadow duration-200 ${
                  isUnlocked ? 'cursor-pointer hover:shadow-[0_2px_10px_rgba(44,40,37,0.11)]' : 'cursor-default'
                }`}
              >
                <h2 className="font-serif text-xl font-semibold tracking-[0.02em] text-[#2C2825] mb-3 leading-snug">
                  {note.title}
                </h2>
                <p className="text-sm text-[#4A433D] leading-loose whitespace-pre-wrap flex-1">
                  {note.body}
                </p>
                <div className="mt-7 pt-5 border-t border-[#2C2825]/[0.07] flex items-center justify-between">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SWATCH_COLORS[note.color] ?? SWATCH_COLORS.sand }}
                  />
                  <time className="text-[11px] tracking-wide text-[#8A7E76]">
                    {formatDate(note.created_at)}
                  </time>
                </div>
              </article>
            )
          )}
        </div>
      )}

      {/* ── Create modal ─────────────────────────────────────────────────── */}
      {creating && (
        <div
          className="fixed inset-0 bg-[#2C2825]/25 flex items-center justify-center z-50 px-6"
          onClick={(e) => { if (e.target === e.currentTarget) setCreating(false); }}
        >
          <form
            onSubmit={handleCreate}
            className="bg-[#F5F0E8] w-full max-w-lg rounded-sm p-10 shadow-[0_8px_32px_rgba(44,40,37,0.18)] flex flex-col gap-6"
          >
            <input
              ref={newTitleRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="font-serif text-2xl font-semibold tracking-[0.02em] text-[#2C2825] bg-transparent outline-none placeholder:text-[#C0B8B0] border-b border-[#2C2825]/10 pb-2"
            />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Write something…"
              rows={6}
              className="text-sm text-[#4A433D] bg-transparent outline-none resize-none leading-loose placeholder:text-[#C0B8B0]"
            />
            <div className="flex items-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => setNewColor(c)}
                  style={{ backgroundColor: SWATCH_COLORS[c] }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    newColor === c
                      ? 'ring-2 ring-offset-2 ring-[#2C2825]/25 scale-110'
                      : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-8 pt-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="text-[10px] uppercase tracking-[0.14em] text-[#8A7E76] hover:text-[#2C2825] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || (!newTitle.trim() && !newBody.trim())}
                className="text-[10px] uppercase tracking-[0.14em] text-[#2C2825] hover:text-[#4A433D] transition-colors disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Password modal ───────────────────────────────────────────────── */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-[#2C2825]/25 flex items-center justify-center z-50 px-6"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPasswordModal(false); setAuthError(''); setPasswordInput(''); } }}
        >
          <form
            onSubmit={handleUnlock}
            className="bg-[#F5F0E8] w-full max-w-xs rounded-sm p-8 shadow-[0_8px_32px_rgba(44,40,37,0.18)] flex flex-col gap-5"
          >
            <input
              ref={passwordRef}
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setAuthError(''); }}
              placeholder="Password"
              className="text-sm text-[#2C2825] bg-transparent outline-none border-b border-[#2C2825]/10 pb-2 placeholder:text-[#C0B8B0]"
            />
            {authError && (
              <p className="text-[11px] text-[#A0432A] tracking-wide -mt-2">{authError}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={authPending || !passwordInput}
                className="text-[10px] uppercase tracking-[0.14em] text-[#2C2825] hover:text-[#4A433D] transition-colors disabled:opacity-40"
              >
                {authPending ? 'Checking…' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
