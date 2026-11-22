'use client';

import { useState } from 'react';
import {
  MODULE_ACCESS_MATRIX,
  MODULE_KEYS,
  MODULE_LABELS,
  ROLE_KEYS,
  ROLE_LABELS,
  SSO_PROVIDER_LABELS,
  type PublicAccount,
  type RoleKey,
} from '@humanis/backend';

export function RbacManager({
  initialAccounts,
  currentUserId,
}: {
  initialAccounts: readonly PublicAccount[];
  currentUserId: string;
}) {
  const [accounts, setAccounts] = useState<readonly PublicAccount[]>(initialAccounts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Tambah User
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIdentifierKind, setNewIdentifierKind] = useState<'NIP' | 'NISN'>('NIP');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newRole, setNewRole] = useState<RoleKey>('GURU');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/v1/admin/accounts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: newName,
          identifierKind: newIdentifierKind,
          identifier: newIdentifier,
          roles: [newIdentifierKind === 'NISN' ? 'SISWA' : newRole],
          password: newPassword,
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        data?: PublicAccount;
        error?: { message?: string };
      } | null;

      if (!response.ok || !body?.data) {
        setFeedback({ tone: 'error', message: body?.error?.message ?? 'Gagal menambah akun baru.' });
        return;
      }

      setAccounts((prev) => [...prev, body.data!]);
      setNewName('');
      setNewIdentifier('');
      setNewPassword('');
      setShowCreateForm(false);
      setFeedback({
        tone: 'ok',
        message: `Akun ${body.data.displayName} berhasil ditambahkan dengan SSO internal.`,
      });
    } finally {
      setCreating(false);
    }
  }

  const visibleAccounts = accounts.filter((account) => {
    if (roleFilter !== 'ALL' && !account.roles.includes(roleFilter as RoleKey)) {
      return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      account.displayName.toLowerCase().includes(q) ||
      account.identifier.toLowerCase().includes(q)
    );
  });

  async function toggleRole(account: PublicAccount, role: RoleKey) {
    const hasRole = account.roles.includes(role);
    const nextRoles = hasRole
      ? account.roles.filter((r) => r !== role)
      : role === 'SISWA'
        ? (['SISWA'] as const)
        : [...account.roles.filter((r) => r !== 'SISWA'), role];

    if (nextRoles.length === 0) {
      setFeedback({ tone: 'error', message: 'Setiap akun wajib memiliki minimal satu role.' });
      return;
    }

    setBusyId(account.id);
    setFeedback(null);
    try {
      const response = await fetch(`/api/v1/admin/accounts/${account.id}/roles`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ roles: nextRoles }),
      });

      const body = (await response.json().catch(() => null)) as {
        data?: PublicAccount;
        error?: { message?: string };
      } | null;

      if (!response.ok || !body?.data) {
        setFeedback({
          tone: 'error',
          message: body?.error?.message ?? 'Gagal memperbarui role akun.',
        });
        return;
      }

      setAccounts((prev) => prev.map((item) => (item.id === account.id ? body.data! : item)));
      setFeedback({
        tone: 'ok',
        message: `Role untuk ${account.displayName} diperbarui dan dicatat di audit log.`,
      });
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(account: PublicAccount) {
    setBusyId(account.id);
    setFeedback(null);
    try {
      const response = await fetch(`/api/v1/admin/accounts/${account.id}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isActive: !account.isActive }),
      });

      const body = (await response.json().catch(() => null)) as {
        data?: PublicAccount;
        error?: { message?: string };
      } | null;

      if (!response.ok || !body?.data) {
        setFeedback({
          tone: 'error',
          message: body?.error?.message ?? 'Gagal memperbarui status akun.',
        });
        return;
      }

      setAccounts((prev) => prev.map((item) => (item.id === account.id ? body.data! : item)));
      setFeedback({
        tone: 'ok',
        message: `Status akun ${account.displayName} diubah menjadi ${body.data.isActive ? 'Aktif' : 'Nonaktif'}.`,
      });
    } catch {
      setFeedback({ tone: 'error', message: 'Tidak dapat menghubungi server.' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div
        role="status"
        aria-live="polite"
        className={`min-h-6 text-sm font-medium ${
          feedback?.tone === 'error' ? 'text-orange' : 'text-navy'
        }`}
      >
        {feedback?.message ?? ''}
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-navy">Daftar Akun dan Penugasan SSO</h2>
            <p className="mt-1 text-sm text-muted">
              Setiap akun terhubung ke penyedia SSO internal dan role yang diverifikasi di server.
              Perubahan role berlaku pada sesi login berikutnya.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-yellow px-2.5 py-0.5 text-xs font-medium text-ink">
              Data Demo
            </span>
            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-cream hover:bg-navy/90"
            >
              {showCreateForm ? 'Tutup Form' : '+ Tambah User'}
            </button>
          </div>
        </div>

        {showCreateForm ? (
          <form
            onSubmit={handleCreateUser}
            className="mt-4 grid gap-3 rounded-lg border border-line bg-cream p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama lengkap"
              aria-label="Nama lengkap akun baru"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
            <select
              aria-label="Jenis identitas SSO"
              value={newIdentifierKind}
              onChange={(e) => {
                const kind = e.target.value as 'NIP' | 'NISN';
                setNewIdentifierKind(kind);
                setNewRole(kind === 'NISN' ? 'SISWA' : 'GURU');
              }}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
            >
              <option value="NIP">NIP (Pegawai)</option>
              <option value="NISN">NISN (Siswa)</option>
            </select>
            <input
              type="text"
              required
              value={newIdentifier}
              onChange={(e) => setNewIdentifier(e.target.value)}
              placeholder={newIdentifierKind === 'NIP' ? 'Nomor NIP' : 'Nomor NISN'}
              aria-label="Nomor NIP atau NISN"
              className="tabular rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
            <select
              aria-label="Role awal"
              disabled={newIdentifierKind === 'NISN'}
              value={newIdentifierKind === 'NISN' ? 'SISWA' : newRole}
              onChange={(e) => setNewRole(e.target.value as RoleKey)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink disabled:opacity-60"
            >
              {ROLE_KEYS.filter((r) => (newIdentifierKind === 'NISN' ? r === 'SISWA' : r !== 'SISWA')).map(
                (r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ),
              )}
            </select>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Kata sandi awal (min. 8)"
              aria-label="Kata sandi awal"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
            <div className="sm:col-span-2 lg:col-span-5">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
              >
                {creating ? 'Menyimpan...' : 'Simpan User Baru'}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <select
            aria-label="Filter role akun"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
          >
            <option value="ALL">Semua Role</option>
            {ROLE_KEYS.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NIP/NISN..."
            aria-label="Cari akun pengguna"
            className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs text-ink"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2.5 pr-4 font-semibold">Pengguna</th>
                <th className="py-2.5 pr-4 font-semibold">Identitas SSO</th>
                <th className="py-2.5 pr-4 font-semibold">Penugasan Role</th>
                <th className="py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibleAccounts.map((account) => {
                const isSelf = account.id === currentUserId;
                const isStudentAccount = account.identifierKind === 'NISN';
                const disabled = busyId === account.id;

                return (
                  <tr key={account.id} className="align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink">{account.displayName}</p>
                      <p className="text-xs text-muted">
                        {isSelf ? 'Akun Anda saat ini' : account.ssoSubject}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="tabular font-medium text-ink">
                        {account.identifierKind}: {account.identifier}
                      </p>
                      <p className="text-xs text-muted">
                        {SSO_PROVIDER_LABELS[account.ssoProvider]}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {ROLE_KEYS.map((role) => {
                          const active = account.roles.includes(role);
                          const lockStudent = isStudentAccount && role !== 'SISWA';
                          const lockStaffStudent = !isStudentAccount && role === 'SISWA';
                          const lockSelfAdmin = isSelf && role === 'ADMIN';
                          const btnDisabled =
                            disabled || lockStudent || lockStaffStudent || lockSelfAdmin;

                          return (
                            <button
                              key={role}
                              type="button"
                              disabled={btnDisabled}
                              onClick={() => void toggleRole(account, role)}
                              aria-pressed={active}
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                                active
                                  ? 'border-navy bg-navy text-cream'
                                  : 'border-line bg-cream text-muted hover:border-navy hover:text-ink'
                              }`}
                            >
                              {ROLE_LABELS[role]}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        disabled={disabled || isSelf}
                        onClick={() => void toggleActive(account)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          account.isActive
                            ? 'border-line bg-green text-ink hover:bg-green/80'
                            : 'border-line bg-orange text-ink hover:bg-orange/80'
                        }`}
                      >
                        {account.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="text-base font-semibold text-navy">Matriks Akses Modul per Role</h2>
        <p className="mt-1 text-sm text-muted">
          Acuan otorisasi server untuk setiap kombinasi role dan modul sekolah. Role Siswa hanya
          memiliki akses ke beranda siswa miliknya sendiri.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-3 font-semibold">Role</th>
                {MODULE_KEYS.map((moduleKey) => (
                  <th key={moduleKey} className="px-2 py-2 text-center font-semibold">
                    {MODULE_LABELS[moduleKey]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ROLE_KEYS.map((role) => (
                <tr key={role}>
                  <td className="py-2.5 pr-3 font-medium text-ink">{ROLE_LABELS[role]}</td>
                  {MODULE_KEYS.map((moduleKey) => {
                    const allowed = MODULE_ACCESS_MATRIX[role].includes(moduleKey);
                    return (
                      <td key={moduleKey} className="px-2 py-2.5 text-center">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 font-medium ${
                            allowed
                              ? 'border-line bg-green text-ink'
                              : 'border-line bg-cream text-muted'
                          }`}
                        >
                          {allowed ? 'Diizinkan' : 'Ditolak'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
