import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  KeyRound,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase.js";

const ROLE_OPTIONS = ["admin", "student", "facilitator", "partner", "suspended"];

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getShortId(id) {
  if (!id) return "—";
  return id.slice(0, 8);
}

function getRoleBadge(role) {
  const normalizedRole = (role || "student").toLowerCase();

  const styles = {
    admin: "border-emerald-100 bg-emerald-50 text-emerald-700",
    student: "border-blue-100 bg-blue-50 text-blue-700",
    facilitator: "border-violet-100 bg-violet-50 text-violet-700",
    partner: "border-amber-100 bg-amber-50 text-amber-700",
    suspended: "border-rose-100 bg-rose-50 text-rose-700",
  };

  return styles[normalizedRole] || "border-slate-200 bg-slate-50 text-slate-700";
}

function formatRole(role) {
  if (!role) return "Student";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roleModalUser, setRoleModalUser] = useState(null);
  const [nextRole, setNextRole] = useState("student");
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [roleError, setRoleError] = useState("");

  const [resetModalUser, setResetModalUser] = useState(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const menuRef = useRef(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      if (!supabase) {
        setUsers([
          {
            id: "demo-1",
            full_name: "Sam Example",
            email: "sam@example.com",
            role: "admin",
            created_at: new Date().toISOString(),
          },
          {
            id: "demo-2",
            full_name: "Ada Student",
            email: "ada@example.com",
            role: "student",
            created_at: new Date().toISOString(),
          },
        ]);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
        setSelectedUser(null);
        closeRoleModal();
        closeResetPasswordModal();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      const name = user.full_name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      const role = user.role?.toLowerCase() ?? "";
      const id = user.id?.toLowerCase() ?? "";

      return (
        name.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        id.includes(term)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => (user.role || "").toLowerCase() === "admin").length;
  const visibleResults = filteredUsers.length;

  function handleViewProfile(user) {
    setOpenMenuId(null);
    setSelectedUser(user);
  }

  function openRoleModal(user) {
    setOpenMenuId(null);
    setSelectedUser(null);
    setRoleModalUser(user);
    setNextRole(user.role || "student");
    setRoleError("");
  }

  function closeRoleModal() {
    setRoleModalUser(null);
    setNextRole("student");
    setIsSavingRole(false);
    setRoleError("");
  }

  async function handleConfirmRoleChange() {
    if (!roleModalUser) return;

    if (nextRole === (roleModalUser.role || "student")) {
      closeRoleModal();
      return;
    }

    try {
      setIsSavingRole(true);
      setRoleError("");

      if (!supabase) {
        setUsers((current) =>
          current.map((user) =>
            user.id === roleModalUser.id ? { ...user, role: nextRole } : user
          )
        );

        if (selectedUser?.id === roleModalUser.id) {
          setSelectedUser((current) => (current ? { ...current, role: nextRole } : current));
        }

        closeRoleModal();
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ role: nextRole })
        .eq("id", roleModalUser.id)
        .select("id, full_name, email, role, created_at")
        .single();

      if (error) throw error;

      setUsers((current) =>
        current.map((user) => (user.id === roleModalUser.id ? data : user))
      );

      if (selectedUser?.id === roleModalUser.id) {
        setSelectedUser(data);
      }

      closeRoleModal();
    } catch (err) {
      setRoleError(err?.message || "Failed to update role.");
      setIsSavingRole(false);
    }
  }

  function openResetPasswordModal(user) {
    setOpenMenuId(null);
    setResetModalUser(user);
    setResetError("");
  }

  function closeResetPasswordModal() {
    setResetModalUser(null);
    setIsSendingReset(false);
    setResetError("");
  }

  async function handleConfirmResetPassword() {
    if (!resetModalUser?.email) {
      setResetError("This user does not have an email address.");
      return;
    }

    try {
      setIsSendingReset(true);
      setResetError("");

      if (!supabase) {
        setResetSuccess(`Password reset email queued for ${resetModalUser.email} in demo mode.`);
        closeResetPasswordModal();
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetModalUser.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setResetSuccess(`Password reset email sent to ${resetModalUser.email}.`);
      closeResetPasswordModal();
    } catch (err) {
      setResetError(err?.message || "Failed to send password reset email.");
      setIsSendingReset(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Users
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            User management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Search, review, and manage user records from one workspace.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by name, email, role, or id"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 sm:w-80"
            />
          </label>

          <button
            type="button"
            onClick={loadUsers}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </section>

      {resetSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {resetSuccess}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total users</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {totalUsers}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Admins</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {totalAdmins}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Visible results</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {visibleResults}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Failed to load users: {error}
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-900">No users found</p>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or confirm the profiles table has records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    User
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Role
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Joined
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isOpen = openMenuId === user.id;

                  return (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                            {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user.full_name || "Unnamed user"}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {getShortId(user.id)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.email || "No email"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role || "student"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="relative flex justify-end" ref={isOpen ? menuRef : null}>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((current) => (current === user.id ? null : user.id))
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                            aria-label={`More actions for ${user.full_name || user.email || "user"}`}
                            aria-expanded={isOpen}
                            aria-haspopup="menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {isOpen && (
                            <div
                              className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.22)]"
                              role="menu"
                            >
                              <button
                                type="button"
                                onClick={() => handleViewProfile(user)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                role="menuitem"
                              >
                                <Eye className="h-4 w-4 text-slate-400" />
                                View profile
                              </button>

                              <button
                                type="button"
                                onClick={() => openRoleModal(user)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                role="menuitem"
                              >
                                <UserCog className="h-4 w-4 text-slate-400" />
                                Change role
                              </button>

                              <button
                                type="button"
                                onClick={() => openResetPasswordModal(user)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                role="menuitem"
                              >
                                <KeyRound className="h-4 w-4 text-slate-400" />
                                Reset password
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedUser && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close profile drawer"
            onClick={() => setSelectedUser(null)}
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Profile
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {selectedUser.full_name || "Unnamed user"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{selectedUser.email || "No email"}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Role
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 capitalize">
                    {selectedUser.role || "student"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Joined
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    User ID
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                    {selectedUser.id || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Short ID
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {getShortId(selectedUser.id)}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openRoleModal(selectedUser)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserCog className="h-4 w-4" />
                    Change role
                  </button>

                  <button
                    type="button"
                    onClick={() => openResetPasswordModal(selectedUser)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <KeyRound className="h-4 w-4" />
                    Reset password
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <h3 className="text-base font-semibold text-slate-900">Activity summary</h3>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">Joined account</p>
                      <p className="text-slate-500">{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">Profile loaded</p>
                      <p className="text-slate-500">
                        You can add login history, certificates, and course progress later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {roleModalUser && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Close role modal"
            onClick={closeRoleModal}
          />

          <div className="absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Role management
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                  Change user role
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Update access level for{" "}
                  <span className="font-medium text-slate-700">
                    {roleModalUser.full_name || roleModalUser.email || "this user"}
                  </span>.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRoleModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Current role
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getRoleBadge(
                    roleModalUser.role
                  )}`}
                >
                  {roleModalUser.role || "student"}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="role-select"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                New role
              </label>

              <select
                id="role-select"
                value={nextRole}
                onChange={(event) => setNextRole(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </select>
            </div>

            {roleError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {roleError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRoleModal}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={isSavingRole}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingRole ? "Saving..." : "Save role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetModalUser && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Close password reset modal"
            onClick={closeResetPasswordModal}
          />

          <div className="absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Password reset
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                  Send reset email
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Send a password recovery email to{" "}
                  <span className="font-medium text-slate-700">
                    {resetModalUser.email || "this user"}
                  </span>.
                </p>
              </div>

              <button
                type="button"
                onClick={closeResetPasswordModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Recipient
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {resetModalUser.full_name || "Unnamed user"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {resetModalUser.email || "No email"}
              </p>
            </div>

            {resetError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {resetError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeResetPasswordModal}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmResetPassword}
                disabled={isSendingReset}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingReset ? "Sending..." : "Send reset email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}