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
import DonorProfile from "../pages/DonorProfile";

import PatientNearbyDonors from "../pages/PatientNearbyDonors";
import BloodBankDashboard from "../pages/Bloodbank";
import BloodBankInventory from "../pages/BloodBankInventory";
import BloodBankRequests from "../pages/BloodBankRequests";
import AdminDashboard from "../pages/AdminDashboard";
import AdminBloodBanks from "../pages/AdminBloodBanks";
import AdminContactMessages from "../pages/AdminContactMessages";
import AdminRequests from "../pages/AdminRequests";
import AdminDonations from "../pages/AdminDonations";
import AdminUsers from "../pages/AdminUsers";
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

const unifiedSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { label: "Emergency Requests", icon: "emergency", to: "/requests" },
  { label: "Camps", icon: "calendar_month", to: "/camps" },
  { label: "Blood Banks", icon: "location_on", to: "/blood-banks" },
  { label: "History", icon: "history", to: "/history" },
  { label: "Find Donor", icon: "group", to: "/donors" },
  mapItem,
  { label: "Settings", icon: "settings", to: "/settings" },
];

const bankSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/bloodbank" },
  { label: "Inventory", icon: "bloodtype", to: "/bloodbank/inventory" },
  { label: "Emergency", icon: "emergency", to: "/bloodbank/emergency" },
  { label: "Requests", icon: "notification_important", to: "/bloodbank/requests" },
  { label: "Camps", icon: "calendar_month", to: "/bloodbank/camps", action: { label: "Set Up Camp", to: "/bloodbank?newCamp=1" } },
  { label: "History", icon: "history", to: "/history" },
  mapItem,
  { label: "Settings", icon: "settings", to: "/bloodbank/settings" },
];

const adminSidebar = [
  { label: "Dashboard", icon: "dashboard", to: "/admin" },
  { label: "Users", icon: "manage_accounts", to: "/admin/users" },
  { label: "Blood Banks", icon: "location_city", to: "/admin/blood-banks" },
  { label: "Requests", icon: "bloodtype", to: "/admin/requests" },
  { label: "Donations", icon: "volunteer_activism", to: "/admin/donations" },
  { label: "Messages", icon: "mail", to: "/admin/messages" },
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
  const isBank = hasRole("bloodbank") || hasRole("blood_bank");
  const isAdmin = hasRole("admin");
  if (isAdmin) return adminSidebar;
  if (isBank) return bankSidebar;
  return unifiedSidebar;
}

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<PublicPage><Landing /></PublicPage>} />
      <Route path="/about" element={<PublicPage><About /></PublicPage>} />
      <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
      <Route path="/education" element={<PublicPage><Education /></PublicPage>} />
      <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
      <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
      <Route path="/bloodbank-register" element={<BloodBankRegister />} />
      <Route path="/unauthorized" element={<PublicPage><Unauthorized /></PublicPage>} />

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
          <RoleBasedRoute allowedRoles={["donor", "patient", "bloodbank"]}>
            <DashboardPage sidebarItems={useSidebar()} title="History" subtitle="Donation & Request History">
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
        path="/camps"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient"]}>
            <DashboardPage sidebarItems={unifiedSidebar} title="Camps" subtitle="Blood Donation Camps">
              <Camps />
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
            <DashboardPage sidebarItems={useSidebar()} title="Settings" subtitle="Account Settings">
              <Settings />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient", "bloodbank", "admin"]}>
            <DashboardPage sidebarItems={useSidebar()} title="Notifications" subtitle="Updates">
              <Notifications />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <RoleBasedRoute allowedRoles={["donor", "patient", "bloodbank", "admin"]}>
            <DashboardPage sidebarItems={useSidebar()} title="Map" subtitle="Explore Nearby">
              <MapPage />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />

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
        path="/admin/users"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Users">
              <AdminUsers />
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
        path="/admin/messages"
        element={
          <RoleBasedRoute allowedRoles={["admin"]}>
            <DashboardPage sidebarItems={adminSidebar} title="Admin" subtitle="Contact Messages">
              <AdminContactMessages />
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
      <DashboardPage
        sidebarItems={adminSidebar}
        title="Admin"
        subtitle="Notifications"
      >
        <Notifications />
      </DashboardPage>
    </RoleBasedRoute>
  }
/>

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
      <Route
        path="/bloodbank/camps"
        element={
          <RoleBasedRoute allowedRoles={["bloodbank"]}>
            <DashboardPage sidebarItems={bankSidebar} title="Blood Bank" subtitle="Camps">
              <Camps />
            </DashboardPage>
          </RoleBasedRoute>
        }
      />

      <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />
    </Routes>
  );
}
