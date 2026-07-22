import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, LocateFixed, Search, Droplets, Crosshair } from "lucide-react";
import { BLOOD_GROUP_COLORS } from "../../utils/constants";

delete L.Icon.Default.prototype._getIconUrl;

const ICONS = {
  bank: new L.DivIcon({
    className: "",
    html: '<div style="background:#DC2626;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">B</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  }),
  donor: new L.DivIcon({
    className: "",
    html: '<div style="background:#2563EB;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">D</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  }),
  hospital: new L.DivIcon({
    className: "",
    html: '<div style="background:#16A34A;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">H</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  }),
  emergency: new L.DivIcon({
    className: "",
    html: '<div style="background:#EF4444;color:white;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;border:3px solid white;box-shadow:0 2px 12px rgba(239,68,68,0.6);animation:pulse 2s infinite;">!</div>',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  }),
  user: new L.DivIcon({
    className: "",
    html: '<div style="background:#F59E0B;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">U</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  }),
};

const DEFAULT_CENTER = [26.2389, 73.0243];

function LocationButton({ onLocationFound }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 14);
        onLocationFound({ lat: latitude, lng: longitude });
        setLocating(false);
      },
      () => {
        alert("Unable to access your location. Please enable location permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  }, [map, onLocationFound]);

  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      className="absolute top-4 right-4 z-[1000] bg-white rounded-xl shadow-md border border-slate-200 p-2.5 hover:bg-slate-50 transition disabled:opacity-60"
      title="Find my location"
    >
      <LocateFixed size={18} className={locating ? "text-red animate-pulse" : "text-slate-600"} />
    </button>
  );
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function BloodMap({
  showCamps = false,
  showBank = true,
  className = "",
  height = "480px",
}) {
  const [banks, setBanks] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [searchBloodGroup, setSearchBloodGroup] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [inventoryCache, setInventoryCache] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
        if (showBank) {
          const url = searchCity
            ? `${baseUrl}/map/blood-banks?city=${encodeURIComponent(searchCity)}`
            : `${baseUrl}/map/blood-banks`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to load blood banks");
          const data = await res.json();
          if (!cancelled) setBanks(data);
        }
        if (showCamps) {
          const res = await fetch(`${baseUrl}/map/camps`);
          if (!res.ok) throw new Error("Failed to load camps");
          const data = await res.json();
          if (!cancelled) setCamps(data);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load map data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [showBank, showCamps, searchCity]);

  async function loadBankInventory(bankId) {
    if (inventoryCache[bankId]) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
    try {
      const res = await fetch(`${baseUrl}/inventory/blood-bank/${bankId}`);
      if (res.ok) {
        const data = await res.json();
        setInventoryCache((prev) => ({ ...prev, [bankId]: data.inventory || [] }));
      }
    } catch {}
  }

  const handleLocationFound = useCallback((loc) => {
    setUserLocation(loc);
    setMapCenter([loc.lat, loc.lng]);
  }, []);

  const handleSearchBloodGroup = useCallback(() => {
    if (!searchBloodGroup) return;
    const filtered = banks.filter((b) => {
      const bg = (b.blood_groups || b.available_groups || "").toLowerCase();
      return bg.includes(searchBloodGroup.toLowerCase());
    });
    if (filtered.length > 0) {
      const avgLat = filtered.reduce((s, b) => s + b.lat, 0) / filtered.length;
      const avgLng = filtered.reduce((s, b) => s + b.lng, 0) / filtered.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [searchBloodGroup, banks]);

  const getBloodGroupColor = (bg) => {
    return BLOOD_GROUP_COLORS[bg] || "#DC2626";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search by city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
          />
        </div>
        <div className="relative flex-1">
          <Droplets size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchBloodGroup}
            onChange={(e) => setSearchBloodGroup(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchBloodGroup()}
            placeholder="Filter by blood group (e.g. O+)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red/20"
          />
        </div>
        {searchBloodGroup && (
          <button
            onClick={handleSearchBloodGroup}
            className="px-4 py-2 bg-red text-white rounded-xl text-sm font-bold hover:bg-red-700 transition"
          >
            Filter
          </button>
        )}
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
        {loading && (
          <div className="absolute inset-0 z-[1001] bg-white/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading map data...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 z-[1001] bg-white/80 flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crosshair size={22} className="text-red" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Unable to Load Map</p>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-1.5 bg-red text-white rounded-full text-xs font-bold hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationButton onLocationFound={handleLocationFound} />

          {banks.map((bank) => {
            const dist = userLocation
              ? calculateDistance(userLocation.lat, userLocation.lng, bank.lat, bank.lng)
              : null;
            const inv = inventoryCache[bank.id];
            return (
              <Marker key={`bank-${bank.id}`} position={[bank.lat, bank.lng]} icon={ICONS.bank}>
                <Popup>
                  <div className="text-sm min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-red/10 flex items-center justify-center text-red font-bold text-xs">
                        {bank.hospital_type === "Blood Bank" ? "BB" : "H"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{bank.name}</p>
                        <p className="text-[10px] text-slate-500">{bank.hospital_type || "Blood Bank"}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      {bank.phone && (
                        <p className="flex items-center gap-1">
                          <span>&#9742;</span> {bank.phone}
                        </p>
                      )}
                      {bank.email && <p className="text-slate-400 text-[10px]">{bank.email}</p>}
                      {dist !== null && (
                        <p className="flex items-center gap-1">
                          <span>&#128205;</span> Distance: <span className="font-semibold">{formatDistance(dist)}</span>
                        </p>
                      )}
                      {bank.address && (
                        <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{bank.address}</p>
                      )}
                      <div className="border-t border-slate-100 pt-2 mt-2">
                        <p className="font-semibold text-slate-900 mb-1">Available Blood:</p>
                        {!inv ? (
                          <button onClick={() => loadBankInventory(bank.id)} className="text-red font-semibold hover:underline">Load inventory</button>
                        ) : inv.length === 0 ? (
                          <p className="text-slate-400">No inventory listed</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-1">
                            {inv.map((item) => (
                              <div key={item.id} className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded">
                                <span className="font-bold text-red text-[11px]">{item.blood_group}</span>
                                <span className="text-[11px] text-slate-600">{item.units}u</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                    >
                      <Navigation size={12} /> Navigate
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {showCamps &&
            camps.map((camp) => (
              <Marker key={`camp-${camp.id}`} position={[camp.lat, camp.lng]} icon={ICONS.hospital}>
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-bold text-slate-900">{camp.title}</p>
                    {camp.date && <p className="text-xs text-slate-500 mt-1">Date: {camp.date}</p>}
                    {camp.time && <p className="text-xs text-slate-500">Time: {camp.time}</p>}
                    {camp.venue && <p className="text-xs text-slate-500">Venue: {camp.venue}</p>}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${camp.lat},${camp.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                    >
                      <Navigation size={12} /> Navigate
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={ICONS.user}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-slate-900">Your Location</p>
                  <p className="text-xs text-slate-500">You are here</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red" /> Blood Bank
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-600" /> Donor
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green" /> Hospital / Camp
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber" /> Your Location
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
