import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import StepProgress from "./StepProgress";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const labels = ["Facility Info", "License & Address", "Verify Phone"];

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
        map.flyTo([latitude, longitude], 15);
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
      type="button"
      onClick={handleLocate}
      disabled={locating}
      className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md border border-stone-200 p-2 hover:bg-stone-50 transition disabled:opacity-60"
      title="Use my current location"
    >
      <LocateFixed size={16} className={locating ? "text-red animate-pulse" : "text-stone-600"} />
    </button>
  );
}

function ClickMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? (
    <Marker
      draggable={true}
      position={[position.lat, position.lng]}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          onPositionChange({ lat, lng });
        },
      }}
    />
  ) : null;
}

function BloodBankRegister() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    facilityName: "", email: "", phone: "", password: "", confirmPassword: "",
    city: "", address: "", lat: "", lng: "",
  });
  const [licenseFile, setLicenseFile] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp, setMockOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const update = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const isStep1Valid = () => {
    if (!formData.facilityName || !formData.email || !formData.phone) return false;
    if (formData.password.length < 6) return false;
    if (formData.password !== formData.confirmPassword) return false;
    return true;
  };
  const isStep2Valid = () => formData.city && formData.address;

  const canGoNext = () => {
    if (step === 1) return isStep1Valid();
    if (step === 2) return isStep2Valid();
    return true;
  };

  const next = () => {
    if (!canGoNext()) {
      alert("Please fill in all required fields before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const sendOtp = () => {
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setMockOtp(generated);
    setOtpSent(true);
    alert("Demo OTP sent: " + generated);
  };
  const verifyOtp = () => {
    if (otpInput === mockOtp) setOtpVerified(true);
    else alert("Incorrect OTP. Please try again.");
  };

  const handlePositionChange = useCallback((pos) => {
    update("lat", pos.lat);
    update("lng", pos.lng);
  }, []);

  const markerPos = formData.lat && formData.lng
    ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }
    : null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.facilityName,
        last_name: "Blood Bank",
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: "Other",
        dob: "1900-01-01",
        city: formData.city,
        address: formData.address,
        role: "blood_bank",
        lat: formData.lat || undefined,
        lng: formData.lng || undefined,
      };

      await axios.post("http://127.0.0.1:5000/api/auth/register", payload);
      setSubmitted(true);
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full mt-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-neutral-400";
  const labelClass = "text-sm font-medium text-stone-700 block";
  const nextBtnClass = (valid, wide = "w-full") =>
    `${wide} mt-4 font-semibold py-3 rounded-full transition-all ${
      valid
        ? "bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-lg hover:scale-[1.02]"
        : "bg-stone-300 text-stone-500 cursor-not-allowed"
    }`;

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-stone-200 w-full max-w-lg text-center">
        <h2 className="text-xl font-bold text-stone-900">Application Submitted</h2>
        <p className="text-sm text-stone-500 mt-2">
          Your facility is under review. Our team will verify your license document and approve your account within 24-48 hours. You'll be notified by email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-stone-200 w-full max-w-lg">
      <StepProgress step={step} totalSteps={3} labels={labels} />

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Facility / Blood Bank Name</label>
            <input className={inputClass} value={formData.facilityName} onChange={(e) => update("facilityName", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>License ID</label>
            <input className={inputClass} value={formData.licenseId} onChange={(e) => update("licenseId", e.target.value)} placeholder="RB-XXXXX-2024" />
          </div>
          <div>
            <label className={labelClass}>Official Email</label>
            <input type="email" className={inputClass} value={formData.email} onChange={(e) => update("email", e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input className={inputClass} value={formData.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative mt-1">
                <input type={showPassword ? "text" : "password"} className={inputClass + " pr-10"} value={formData.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative mt-1">
                <input type={showConfirmPassword ? "text" : "password"} className={inputClass + " pr-10"} value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-600">Passwords do not match.</p>
          )}
          <button onClick={next} className={nextBtnClass(isStep1Valid())}>Next Step →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={formData.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Full Address</label>
            <input className={inputClass} value={formData.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block">
              Pin Location on Map <span className="text-xs text-stone-400 font-normal">(recommended)</span>
            </label>
            <p className="text-xs text-stone-400 mt-0.5 mb-2">Click on the map to place a marker, drag to adjust, or use the location button.</p>
            <div className="relative rounded-xl overflow-hidden border border-stone-200" style={{ height: "220px" }}>
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickMarker position={markerPos} onPositionChange={handlePositionChange} />
                <LocationButton onLocationFound={handlePositionChange} />
              </MapContainer>
            </div>
            {formData.lat && formData.lng && (
              <p className="text-xs text-stone-500 mt-1">
                Selected: {parseFloat(formData.lat).toFixed(6)}, {parseFloat(formData.lng).toFixed(6)}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Upload License / Registration Document</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setLicenseFile(e.target.files[0])}
              className="w-full mt-1 text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-neutral-100 file:text-neutral-800 file:font-semibold hover:file:bg-neutral-200"
            />
            <p className="text-xs text-stone-500 mt-1">Required for manual verification before your account is approved.</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="w-1/3 border border-stone-300 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition">Back</button>
            <button onClick={next} className={nextBtnClass(isStep2Valid(), "w-2/3")}>Next Step →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            We need to verify your phone number <strong>{formData.phone}</strong> before submitting your application.
          </p>

          <button onClick={sendOtp} className="w-full border border-neutral-900 text-neutral-900 font-semibold py-2.5 rounded-full hover:bg-neutral-100 transition">
            {otpSent ? "Resend OTP" : "Send OTP"}
          </button>

          <div>
            <label className={labelClass}>Enter OTP</label>
            <input
              className={inputClass}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="4-digit code"
              maxLength={4}
              disabled={otpVerified}
            />
          </div>

          <button
            onClick={verifyOtp}
            disabled={!otpSent || otpVerified}
            className="w-full bg-neutral-900 text-white font-semibold py-3 rounded-full hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {otpVerified ? "✓ Verified" : "Verify OTP"}
          </button>

          <div className="flex gap-3 mt-4">
            <button onClick={back} className="w-1/3 border border-stone-300 text-stone-700 font-semibold py-3 rounded-full hover:bg-stone-50 transition">Back</button>
            <button
              onClick={handleSubmit}
              disabled={!otpVerified || submitting}
              className="w-2/3 bg-neutral-900 text-white font-semibold py-3 rounded-full hover:bg-neutral-800 hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloodBankRegister;
