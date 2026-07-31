import { useState, useEffect, useCallback } from "react";
import { Search, AlertTriangle, Ban, ShieldCheck } from "lucide-react";
import api from "../services/api";

function roleLabel(roles) {
  if (!roles || roles.length === 0) return "Unknown";
  if (roles.includes("admin")) return "Admin";
  if (roles.includes("blood_bank")) return "Blood Bank";
  return "Donor / Patient";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data?.users || []);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleBlock(user) {
    const reason = window.prompt(`Reason for blocking ${user.first_name} ${user.last_name}:`, "");
    if (!reason || !reason.trim()) return;
    if (!window.confirm(`Block ${user.first_name} ${user.last_name} (${user.email || user.phone})? They will be unable to log in.`)) return;
    setBusyId(user.id);
    try {
      await api.patch(`/admin/users/${user.id}/block`, { reason: reason.trim() });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to block user");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnblock(user) {
    const reason = window.prompt(`Reason for unlocking ${user.first_name} ${user.last_name}:`, "");
    if (!reason || !reason.trim()) return;
    setBusyId(user.id);
    try {
      await api.patch(`/admin/users/${user.id}/unblock`, { reason: reason.trim() });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to unblock user");
    } finally {
      setBusyId(null);
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (!q) return true;
    return (
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q) ||
      `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Manage Users</h2>
        <p className="text-sm text-slate-500 mt-1">View all users and block or unblock their access.</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, phone or name..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
        />
      </div>

      {error && <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl"><AlertTriangle size={16} />{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <p className="text-slate-500">{search ? "No matching users." : "No users registered yet."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">City</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Last Reason</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => {
                const isAdmin = (u.roles || []).includes("admin");
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{u.first_name} {u.last_name}</span>
                      {u.email && <p className="text-xs text-slate-400">{u.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{u.phone}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAdmin ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                        {roleLabel(u.roles)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{u.city || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell max-w-[200px]">
                      {u.last_action ? (
                        <>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mr-1.5 ${u.last_action.action === "block" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600"}`}>
                            {u.last_action.action === "block" ? "Blocked" : "Unlocked"}
                          </span>
                          <span className="text-xs text-slate-500">{u.last_action.reason}</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.is_active ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}>
                        {u.is_active ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleBlock(u)}
                          disabled={isAdmin || !u.is_active || busyId === u.id}
                          title={isAdmin ? "Admin accounts cannot be blocked" : "Block user"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 transition hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <Ban size={13} /> Block
                        </button>
                        <button
                          onClick={() => handleUnblock(u)}
                          disabled={isAdmin || u.is_active || busyId === u.id}
                          title={isAdmin ? "Admin accounts cannot be unblocked" : "Unlock user"}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 transition hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShieldCheck size={13} /> Unlock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
