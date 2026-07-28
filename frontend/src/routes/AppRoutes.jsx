import { Route, Routes } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import useAuth from "../context/useAuth";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Camps from "../pages/Camps";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import BloodBankRegister from "../pages/BloodBankRegister";
import DonorDashboard from "../pages/DonorDashboard";
import DonorProfile from "../pages/DonorProfile";
import PatientDashboard from "../pages/PatientDashboard";
import PatientBloodRequests from "../pages/PatientBloodRequests";
import PatientNearbyDonors from "../pages/PatientNearbyDonors";
import BloodBankDashboard from "../pages/Bloodbank";
import BloodBankInventory from "../pages/BloodBankInventory";
import BloodBankRequests from "../pages/BloodBankRequests";
import AdminDashboard from "../pages/AdminDashboard";
import AdminBloodBanks from "../pages/AdminBloodBanks";
import AdminRequests from "../pages/AdminRequests";
import AdminDonations from "../pages/AdminDonations";
import EmergencyRequest from "../pages/EmergencyRequest";
import Settings from "../pages/Settings";
import DonorDonationHistory from "../pages/DonorDonationHistory";
import MapPage from "../pages/MapPage";
import Notifications from "../pages/Notifications";
import PublicBloodBanks from "../pages/PublicBloodBanks";
import Education from "../pages/Education";
import UnifiedDashboard from "../pages/UnifiedDashboard";
import RoleBasedRoute from "./RoleBasedRoute";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Education", to: "/education" },
  { label: "Contact", to: "/contact" },
];

const mapItem = { label: "Map", icon: "map", to: "/map" };

const donorSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { label: "Emergency Requests", icon: "emergency", to: "/requests" },
  { label: "Blood Banks", icon: "location_on", to: "/blood-banks" },
  { label: "Donation History", icon: "history", to: "/history" },
  mapItem,
  { label: "Settings", icon: "settings", to: "/settings" },
];

const patientSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { label: "Blood Requests", icon: "bloodtype", to: "/requests" },
  { label: "Nearby Donors", icon: "group", to: "/donors" },
  { label: "Blood Banks", icon: "location_on", to: "/blood-banks" },
  mapItem,
  { label: "Settings", icon: "settings", to: "/settings" },
];

const unifiedSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { label: "Emergency Requests", icon: "emergency", to: "/requests" },
  { label: "Blood Banks", icon: "location_on", to: "/blood-banks" },
  { label: "Donation History", icon: "history", to: "/history" },
  { label: "Nearby Donors", icon: "group", to: "/donors" },
  mapItem,
  { label: "Settings", icon: "settings", to: "/settings" },
];

const bankSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/bloodbank" },
  { label: "Inventory", icon: "bloodtype", to: "/bloodbank/inventory" },
  { label: "Emergency", icon: "emergency", to: "/bloodbank/emergency" },
  { label: "Requests", icon: "notification_important", to: "/bloodbank/requests" },
  mapItem,
  { label: "Settings", icon: "settings", to: "/bloodbank/settings" },
];

const adminSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/admin" },
  { label: "Blood Banks", icon: "location_city", to: "/admin/blood-banks" },
  { label: "Requests", icon: "bloodtype", to: "/admin/requests" },
  { label: "Donations", icon: "volunteer_activism", to: "/admin/donations" },
  mapItem,
  { label: "Settings", icon: "settings", to: "/admin/settings" },
];

function PublicPage({ children }) {
  return (
    <PublicLayout navLinks={publicLinks} footerLinks={publicLinks}>
      {children}
    </PublicLayout>
  );
}

function DashboardPage({ sidebarItems, title, subtitle, children }) {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title={title} subtitle={subtitle}>
      {children}
    </DashboardLayout>
  );
}

function useSidebar() {
  const { hasRole } = useAuth();
  const isDonor = hasRole("donor");
  const isPatient = hasRole("patient");
  const isBank = hasRole("bloodbank") || hasRole("blood_bank");
  const isAdmin = hasRole("admin");

  if (isAdmin) return { items: adminSidebar, title: "Admin", subtitle: "Platform Management" };
  if (isBank) return { items: bankSidebar, title: "Blood Bank", subtitle: "Central Region HQ" };
  if (isDonor && isPatient) return { items: unifiedSidebar, title: "Unified Portal", subtitle: "Donor & Patient" };
  if (isDonor) return { items: donorSidebar, title: "Donor Portal", subtitle: "Welcome, Donor" };
  if (isPatient) return { items: patientSidebar, title: "Patient Portal", subtitle: "Patient Health Hub" };
  return { items: [], title: "", subtitle: "" };
}

function MapPageWrapper() {
  const { items } = useSidebar();
  return (
    <DashboardPage sidebarItems={items} title="Map" subtitle="Explore Nearby">
      <MapPage />
    </DashboardPage>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicPage><Landing /></PublicPage>} />
      <Route path="/about" element={<PublicPage><About /></PublicPage>} />
      <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
      <Route path="/camps" element={<PublicPage><Camps /></PublicPage>} />
      <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
      <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
      <Route path="/bloodbank-register" element={<BloodBankRegister />} />
      <Route path="/unauthorized" element={<PublicPage><Unauthorized /></PublicPage>} />
      <Route path="/education" element={<PublicPage><Education /></PublicPage>} />

      {/* Unified Donor/Patient Routes (new single-portal routes) */}
      <Route
        path="/dashboard"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Dashboard" subtitle="Your Portal">
              <UnifiedDashboard />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Requests" subtitle="Blood Requests">
              <EmergencyRequest />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="History" subtitle="Donation History">
              <DonorDonationHistory />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/donors"
        element={
          <RoleBasedRoute allowedRoles={["patient"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Donors" subtitle="Nearby Donors">
              <PatientNearbyDonors />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/blood-banks"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Blood Banks" subtitle="Find Blood Banks">
              <PublicBloodBanks />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Profile" subtitle="My Profile">
              <DonorProfile />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient", "bloodbank", "admin"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Settings" subtitle="Account Settings">
              <Settings />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient", "bloodbank", "admin"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Notifications" subtitle="Updates">
              <Notifications />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Platform Management">
              <AdminDashboard />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/blood-banks"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Blood Banks">
              <AdminBloodBanks />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Requests">
              <AdminRequests />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/donations"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Donations">
              <AdminDonations />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Settings">
              <Settings />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Notifications">
              <Notifications />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />

      {/* Backward Compatibility: Legacy Donor Routes */}
      <Route
        path="/donor-dashboard"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={donorSidebar} title="Donor Portal" subtitle="Welcome, Donor">
              <DonorDashboard />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/donor/profile"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={donorSidebar} title="Donor Portal" subtitle="My Profile">
              <DonorProfile />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/donor/settings"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={donorSidebar} title="Donor Portal" subtitle="Settings">
              <Settings />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/donor/requests"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={donorSidebar} title="Donor Portal" subtitle="Emergency Requests">
              <EmergencyRequest />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/donor/history"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={donorSidebar} title="Donor Portal" subtitle="Donation History">
              <DonorDonationHistory />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/donor/notifications"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={donorSidebar} title="Donor Portal" subtitle="Notifications">
              <Notifications />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/donor/blood-banks"
        element={
          <RoleBasedRoute allowedRoles={["donor"]}>
            <DashboardPage sidebarItems={donorSidebar} title="Donor Portal" subtitle="Blood Banks">
              <PublicBloodBanks />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />

      {/* Backward Compatibility: Legacy Patient Routes */}
      <Route
        path="/patient-dashboard"
        element={
          <RoleBasedRoute allowedRoles={["patient"]}>
            <DashboardPage sidebarItems={patientSidebar} title="Patient Portal" subtitle="Patient Health Hub">
              <PatientDashboard />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/patient/requests"
        element={
          <RoleBasedRoute allowedRoles={["patient"]}>
            <DashboardPage sidebarItems={patientSidebar} title="Patient Portal" subtitle="Blood Requests">
              <PatientBloodRequests />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/patient/donors"
        element={
          <RoleBasedRoute allowedRoles={["patient"]}>
            <DashboardPage sidebarItems={patientSidebar} title="Patient Portal" subtitle="Nearby Donors">
              <PatientNearbyDonors />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/patient/settings"
        element={
          <RoleBasedRoute allowedRoles={["patient"]}>
            <DashboardPage sidebarItems={patientSidebar} title="Patient Portal" subtitle="Settings">
              <Settings />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/patient/notifications"
        element={
          <RoleBasedRoute allowedRoles={["patient"]}>
            <DashboardPage sidebarItems={patientSidebar} title="Patient Portal" subtitle="Notifications">
              <Notifications />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/patient/blood-banks"
        element={
          <RoleBasedRoute allowedRoles={["patient"]}>
            <DashboardPage sidebarItems={patientSidebar} title="Patient Portal" subtitle="Blood Banks">
              <PublicBloodBanks />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />

      {/* Shared Map Route */}
      <Route
        path="/map"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient", "bloodbank", "admin"]}>
            <MapPageWrapper />
          </RoleBasedRoute>
        }
      />

      {/* Blood Bank Routes */}
      <Route
        path="/bloodbank"
        element={
          <RoleBasedRoute allowedRoles={["bloodbank"]}>
            <DashboardPage sidebarItems={bankSidebar} title="Blood Bank" subtitle="Central Region HQ">
              <BloodBankDashboard />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/bloodbank/emergency"
        element={
          <RoleBasedRoute allowedRoles={["bloodbank"]}>
            <DashboardPage sidebarItems={bankSidebar} title="Blood Bank" subtitle="Emergency">
              <EmergencyRequest />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/bloodbank/settings"
        element={
          <RoleBasedRoute allowedRoles={["bloodbank"]}>
            <DashboardPage sidebarItems={bankSidebar} title="Blood Bank" subtitle="Settings">
              <Settings />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/bloodbank/notifications"
        element={
          <RoleBasedRoute allowedRoles={["bloodbank"]}>
            <DashboardPage sidebarItems={bankSidebar} title="Blood Bank" subtitle="Notifications">
              <Notifications />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/bloodbank/requests"
        element={
          <RoleBasedRoute allowedRoles={["bloodbank"]}>
            <DashboardPage sidebarItems={bankSidebar} title="Blood Bank" subtitle="Blood Requests">
              <BloodBankRequests />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/bloodbank/inventory"
        element={
          <RoleBasedRoute allowedRoles={["bloodbank"]}>
            <DashboardPage sidebarItems={bankSidebar} title="Blood Bank" subtitle="Inventory">
              <BloodBankInventory />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />
    </Routes>
  );
}
