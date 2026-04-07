"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore, type User } from "@/store/auth-store";
import { fetchUsers } from "@/lib/db/sync";
import { useT, useI18n } from "@/lib/i18n";

const AVATAR_OPTIONS = ["💪", "🏋️", "🧘", "🏃", "⭐", "🌟", "🔥", "🌸", "🦋", "🐱", "🌊", "🎯"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const activeUserId = useAuthStore((s) => s.activeUserId);
  const login = useAuthStore((s) => s.login);
  const t = useT();
  const locale = useI18n((s) => s.locale);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newEmoji, setNewEmoji] = useState("💪");
  const [creating, setCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchUsers();
      if (data && data.length > 0) {
        setUsers(data);

        // Auto-login if only one user with no PIN
        if (data.length === 1 && !data[0].hasPin) {
          login(data[0]);
        }
      }
    } catch {
      // DB unavailable — check if we have a cached user
    }
    setLoading(false);
  }, [login]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // If user is already logged in, show the app
  if (activeUserId) {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">💪</div>
      </div>
    );
  }

  // No users exist yet — show create form directly
  if (users.length === 0 && !showCreateForm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="font-heading text-2xl font-extrabold mb-2">{t("auth.welcome")}</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
          {t("auth.createProfile")}
        </p>
        <CreateUserForm
          newName={newName}
          setNewName={setNewName}
          newPin={newPin}
          setNewPin={setNewPin}
          newEmoji={newEmoji}
          setNewEmoji={setNewEmoji}
          creating={creating}
          onSubmit={async () => {
            if (!newName.trim()) return;
            setCreating(true);
            try {
              const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "create",
                  name: newName.trim(),
                  avatarEmoji: newEmoji,
                  pinHash: newPin || null,
                }),
              });
              if (res.ok) {
                const user = await res.json();
                login({ id: user.id, name: user.name, avatarEmoji: user.avatarEmoji, hasPin: !!newPin });
              }
            } catch { /* DB unavailable */ }
            // Offline fallback: create user with local ID
            const localId = crypto.randomUUID();
            login({ id: localId, name: newName.trim(), avatarEmoji: newEmoji, hasPin: !!newPin });
            setCreating(false);
          }}
          t={t}
        />
      </div>
    );
  }

  // PIN entry for selected user
  if (selectedUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">{selectedUser.avatarEmoji}</div>
        <h2 className="font-heading text-xl font-bold mb-1">{selectedUser.name}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t("auth.enterPin")}</p>

        <div className="flex gap-2 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pinInput.length ? "bg-sage border-sage" : "border-border"
              }`}
            />
          ))}
        </div>

        {pinError && (
          <p className="text-xs text-red-400 mb-3">{t("auth.wrongPin")}</p>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2 w-[240px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((key, i) => {
            if (key === null) return <div key={i} />;
            return (
              <button
                key={i}
                onClick={async () => {
                  if (key === "del") {
                    setPinInput((p) => p.slice(0, -1));
                    setPinError(false);
                    return;
                  }
                  const next = pinInput + String(key);
                  setPinInput(next);
                  setPinError(false);

                  if (next.length === 4) {
                    try {
                      const res = await fetch("/api/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "verify-pin",
                          userId: selectedUser.id,
                          pin: next,
                        }),
                      });
                      const data = await res.json();
                      if (data.verified) {
                        login(selectedUser);
                      } else {
                        setPinError(true);
                        setPinInput("");
                      }
                    } catch {
                      setPinError(true);
                      setPinInput("");
                    }
                  }
                }}
                className="h-14 rounded-xl bg-surface2 border border-border font-heading text-lg font-bold transition-colors hover:bg-surface3 active:bg-sage/20"
              >
                {key === "del" ? "⌫" : key}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setSelectedUser(null);
            setPinInput("");
            setPinError(false);
          }}
          className="mt-6 text-sm text-muted-foreground"
        >
          ← {t("auth.cancel")}
        </button>
      </div>
    );
  }

  // User picker
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">🏋️</div>
      <h1 className="font-heading text-xl font-bold mb-1">{t("auth.selectUser")}</h1>
      <p className="text-xs text-muted-foreground mb-8">
        {t("auth.selectProfile")}
      </p>

      <div className="w-full max-w-[320px] space-y-3 mb-6">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => {
              if (user.hasPin) {
                setSelectedUser(user);
              } else {
                login(user);
              }
            }}
            className="w-full flex items-center gap-4 rounded-[16px] border border-border bg-card p-4 transition-colors hover:bg-surface2"
          >
            <span className="text-3xl">{user.avatarEmoji}</span>
            <div className="flex-1 text-left">
              <p className="font-heading font-bold">{user.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {user.hasPin ? "🔒 PIN" : t("auth.noPin")}
              </p>
            </div>
            <span className="text-muted-foreground">→</span>
          </button>
        ))}
      </div>

      {/* Add user button */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="text-sm text-sage font-semibold"
        >
          + {t("auth.addUser")}
        </button>
      ) : (
        <div className="w-full max-w-[320px]">
          <CreateUserForm
            newName={newName}
            setNewName={setNewName}
            newPin={newPin}
            setNewPin={setNewPin}
            newEmoji={newEmoji}
            setNewEmoji={setNewEmoji}
            creating={creating}
            onSubmit={async () => {
              if (!newName.trim()) return;
              setCreating(true);
              try {
                const res = await fetch("/api/users", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "create",
                    name: newName.trim(),
                    avatarEmoji: newEmoji,
                    pinHash: newPin || null,
                  }),
                });
                if (res.ok) {
                  setShowCreateForm(false);
                  setNewName("");
                  setNewPin("");
                  setNewEmoji("💪");
                  await loadUsers();
                }
              } catch { /* offline */ }
              setCreating(false);
            }}
            onCancel={() => setShowCreateForm(false)}
            t={t}
          />
        </div>
      )}
    </div>
  );
}

function CreateUserForm({
  newName,
  setNewName,
  newPin,
  setNewPin,
  newEmoji,
  setNewEmoji,
  creating,
  onSubmit,
  onCancel,
  t,
}: {
  newName: string;
  setNewName: (v: string) => void;
  newPin: string;
  setNewPin: (v: string) => void;
  newEmoji: string;
  setNewEmoji: (v: string) => void;
  creating: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="w-full max-w-[320px] rounded-[16px] border border-border bg-card p-5 text-left">
      {/* Emoji picker */}
      <label className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-2 block">
        {t("auth.newUserEmoji")}
      </label>
      <div className="flex flex-wrap gap-2 mb-4">
        {AVATAR_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setNewEmoji(emoji)}
            className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-colors ${
              newEmoji === emoji
                ? "bg-sage-bg border-sage-dim"
                : "bg-surface2 border-border"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Name */}
      <label className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-1.5 block">
        {t("auth.newUserName")}
      </label>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm mb-3"
        placeholder="Daniela"
        autoFocus
      />

      {/* PIN */}
      <label className="text-[11px] font-semibold tracking-[1.5px] uppercase text-muted-foreground font-mono mb-1.5 block">
        {t("auth.newUserPin")}
      </label>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={newPin}
        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
        className="w-full rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm font-mono tracking-[8px] text-center mb-4"
        placeholder="····"
      />

      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 rounded-[12px] border border-border bg-surface2 py-2.5 text-sm font-semibold transition-colors hover:bg-surface3"
          >
            {t("auth.cancel")}
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={!newName.trim() || creating}
          className="flex-1 rounded-[12px] bg-sage py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50 transition-all"
        >
          {creating ? "..." : t("auth.create")}
        </button>
      </div>
    </div>
  );
}
