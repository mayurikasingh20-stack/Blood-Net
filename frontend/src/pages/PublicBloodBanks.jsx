import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Search, Loader, Building, ExternalLink, X } from "lucide-react";
import { getRandomPublicBloodBanks, searchPublicBloodBanks } from "../services/dashboardService";

export default function PublicBloodBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const data = await getRandomPublicBloodBanks(10);
      setBanks(data?.blood_banks || []);
    } catch {
      setError("Could not load blood banks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandom();
  }, [fetchRandom]);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      fetchRandom();
      return;
    }
    setSearching(true);
    setError("");
    try {
      const data = await searchPublicBloodBanks(q);
      setBanks(data?.blood_banks || []);
      setSearched(true);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setQuery("");
    fetchRandom();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="animate-spin text-red" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Blood Banks</h1>
        <p className="text-sm text-slate-500 mt-1">
          {searched
            ? `${banks.length} blood bank(s) found`
            : `Showing ${banks.length} random blood bank(s)`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by Blood Bank Name or City"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 px-5 py-2 bg-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
          >
            {searching ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
            Search
          </button>
          {searched && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red bg-red/10 px-4 py-3 rounded-xl flex items-center gap-2">{error}</div>
      )}

      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="initial" whileInView="whileInView" viewport={{ once: true }}
        variants={{ whileInView: { transition: { staggerChildren: 0.05 } } }}
      >
        {banks.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Building size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">
              {searched ? "No blood banks found matching your search." : "No blood banks found"}
            </p>
            {searched && (
              <button
                onClick={handleClear}
                className="mt-3 text-xs font-semibold text-red hover:text-red-700 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          banks.map((bank, i) => (
            <motion.div key={bank.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center mb-3">
                <Building size={22} className="text-red" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{bank.name}</h3>
              {bank.hospital_type && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">{bank.hospital_type}</span>
              )}
              <div className="space-y-1.5 mt-3">
                {bank.address && (
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{bank.address}{bank.city ? `, ${bank.city}` : ""}</span>
                  </div>
                )}
                {bank.phone && (
                  <a href={`tel:${bank.phone}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-red transition">
                    <Phone size={12} /> {bank.phone}
                  </a>
                )}
                {bank.email && (
                  <a href={`mailto:${bank.email}`} className="flex items-center gap-2 text-xs text-slate-500 hover:text-red transition">
                    <Mail size={12} /> {bank.email}
                  </a>
                )}
              </div>
              {bank.latitude && bank.longitude && (
                <a href={`https://www.google.com/maps?q=${bank.latitude},${bank.longitude}`} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red hover:text-red-700 transition"
                >
                  <ExternalLink size={12} /> View on Map
                </a>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
