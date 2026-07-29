import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Trash2, ChevronDown, ChevronUp, Phone, User, Clock, Search } from "lucide-react";
import api from "../services/api";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, unread_count: 0 });

  async function loadMessages() {
    try {
      const res = await api.get("/contact/messages?unread_first=true");
      setMessages(res.data.messages);
      setStats({ total: res.data.total, unread_count: res.data.unread_count });
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMessages(); }, []);

  async function markRead(id) {
    try {
      await api.patch(`/contact/messages/${id}/read`);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    } catch {}
  }

  async function deleteMsg(id) {
    if (!window.confirm("Delete this message?")) return;
    try {
      await api.delete(`/contact/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setStats((prev) => ({ ...prev, total: prev.total - 1, unread_count: prev.unread_count - (messages.find(m => m.id === id)?.is_read ? 0 : 1) }));
    } catch {}
  }

  const filtered = messages.filter((m) =>
    !searchTerm || m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red mb-1 block">Admin</span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Contact Messages</h1>
          <p className="text-sm text-slate-500 mt-1">Manage messages from users</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 font-semibold">
            {stats.total} Total
          </div>
          {stats.unread_count > 0 && (
            <div className="px-3 py-1.5 bg-red/10 text-red rounded-full font-bold">
              {stats.unread_count} Unread
            </div>
          )}
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search messages..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red/30 border-t-red rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail size={20} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border overflow-hidden transition ${
                !msg.is_read ? "border-red/20 shadow-sm" : "border-slate-100"
              }`}
            >
              <div
                onClick={() => {
                  setExpandedId(expandedId === msg.id ? null : msg.id);
                  if (!msg.is_read) markRead(msg.id);
                }}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !msg.is_read ? "bg-red/10 text-red" : "bg-slate-100 text-slate-400"
                }`}>
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${!msg.is_read ? "font-bold text-slate-900" : "text-slate-700"}`}>
                      {msg.subject}
                    </p>
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-red flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {msg.name} &middot; {new Date(msg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMsg(msg.id); }}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red transition flex-shrink-0"
                >
                  <Trash2 size={15} />
                </button>
                {expandedId === msg.id ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
              </div>
              {expandedId === msg.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4 pt-0 border-t border-slate-100"
                >
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User size={12} /> {msg.name}</span>
                    <span className="flex items-center gap-1"><Mail size={12} /> {msg.email}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {msg.phone}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(msg.created_at).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
