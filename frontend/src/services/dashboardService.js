import api from "./api";

// ============== AUTH ==============
export async function loginUser({ identifier, password, role }) {
  const payload = { password, role: role === "bloodbank" ? "blood_bank" : role };
  if (role === "donor") payload.phone = identifier;
  else payload.email = identifier;
  const res = await api.post("/auth/login", payload);
  return {
    token: res.data.access_token,
    user: {
      ...res.data.user,
      name: res.data.name || `${res.data.user?.first_name || ""} ${res.data.user?.last_name || ""}`.trim(),
    },
  };
}

export async function registerUser(formData) {
  const payload = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    password: formData.password,
    role: formData.role === "bloodbank" ? "blood_bank" : formData.role,
    gender: formData.gender,
    dob: formData.dob,
    city: formData.city,
    address: formData.address || "",
  };
  if (formData.role === "donor") {
    payload.blood_group = formData.bloodGroup;
    payload.weight = Number(formData.weight);
    if (formData.lastDonationDate) payload.last_donation_date = formData.lastDonationDate;
    payload.has_chronic_condition = Boolean(formData.hasChronicCondition);
    payload.on_medication = Boolean(formData.onMedication);
    payload.available = formData.available !== false;
  }
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("/auth/profile");
  return { ...res.data, name: `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim() };
}

// ============== DONOR ==============

export async function getDonorDashboard() {
  const res = await api.get("/donor/dashboard");
  return res.data;
}

export async function getDonorProfile() {
  const res = await api.get("/donor/profile");
  return res.data; // { user: {...}, donor: { blood_group, weight, ... } }
}

export async function updateDonorProfile(data) {
  const res = await api.put("/donor/profile", data);
  return res.data;
}

export async function updateAvailability(data) {
  const res = await api.patch("/donor/availability", data);
  return res.data; // { message, available }
}

export async function getAllDonors() {
  const res = await api.get("/donor/all");
  return res.data; // { count, donors: [...] }
}

export async function searchDonors(bloodGroup) {
  const res = await api.get(`/donor/search?blood_group=${bloodGroup}`);
  return res.data; // { count, donors: [...] }
}

// ============== PATIENT ==============

export async function getPatientDashboard() {
  const res = await api.get("/patient/dashboard");
  return res.data;
}

export async function getPatientProfile() {
  const res = await api.get("/patient/profile");
  return res.data; // { patient: { ... } }
}

export async function updatePatientProfile(formData) {
  const res = await api.put("/patient/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ============== BLOOD BANK ==============

export async function getBloodBankDashboard() {
  const res = await api.get("/blood-bank/dashboard");
  return res.data;
}

export async function getBloodBankProfile() {
  const res = await api.get("/blood-bank/profile");
  return res.data;
}

export async function updateBloodBankProfile(formData) {
  const res = await api.put("/blood-bank/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ============== BLOOD REQUESTS ==============

export async function getMyBloodRequests() {
  const res = await api.get("/blood-request/my-requests");
  return res.data; // { blood_requests: [...] }
}

export async function createBloodRequest(data) {
  const res = await api.post("/blood-request/create", data);
  return res.data; // { message, request_id }
}

export async function updateBloodRequest(id, data) {
  const res = await api.put(`/blood-request/${id}`, data);
  return res.data;
}

export async function cancelBloodRequest(id) {
  const res = await api.patch(`/blood-request/${id}/cancel`);
  return res.data;
}

export async function verifyDonationFulfillment(donationId, donatedUnits) {
  const res = await api.post(`/donations/${donationId}/fulfill`, { donated_units: donatedUnits });
  return res.data;
}

export async function patientUpdateRequestStatus(requestId, action) {
  const res = await api.patch(`/blood-request/${requestId}/patient-update`, { action });
  return res.data;
}

export async function getMatchingDonors(requestId) {
  const res = await api.get(`/blood-request/${requestId}/matching-donors`);
  return res.data; // { matching_donors: [...], total_matches }
}

export async function getOpenRequests() {
  const res = await api.get("/blood-request/open");
  return res.data; // { blood_requests: [...] }
}

// ============== DONATIONS ==============

export async function acceptBloodRequest(requestId) {
  const res = await api.post(`/donations/accept/${requestId}`);
  return res.data; // { message, donation_id }
}

export async function cancelDonation(donationId) {
  const res = await api.patch(`/donations/${donationId}/cancel`);
  return res.data;
}

export async function getMyDonations() {
  const res = await api.get("/donations/my-donations");
  return res.data; // { donations: [...] }
}

// ============== INVENTORY ==============

export async function getInventory() {
  const res = await api.get("/inventory/");
  return res.data; // { inventory: [...] }
}

export async function addInventoryItem(data) {
  const res = await api.post("/inventory/", data);
  return res.data;
}

export async function adjustInventory(data) {
  const res = await api.post("/inventory/adjust", data);
  return res.data;
}

export async function updateInventoryItem(id, data) {
  const res = await api.put(`/inventory/${id}`, data);
  return res.data;
}

export async function deleteInventoryItem(id) {
  const res = await api.delete(`/inventory/${id}`);
  return res.data;
}

export async function searchInventory(bloodGroup) {
  const res = await api.get(`/inventory/search?blood_group=${bloodGroup}`);
  return res.data;
}

// ============== ADMIN ==============

export async function getAdminDashboard() {
  const res = await api.get("/admin/dashboard");
  return res.data;
}

export async function getAllBloodBanks() {
  const res = await api.get("/admin/blood-banks");
  return res.data; // { blood_banks: [...] }
}

export async function approveBloodBank(id) {
  const res = await api.patch(`/admin/blood-banks/${id}/approve`);
  return res.data;
}

export async function rejectBloodBank(id, reason) {
  const res = await api.patch(`/admin/blood-banks/${id}/reject`, { rejection_reason: reason });
  return res.data;
}

export async function getAllBloodRequests() {
  const res = await api.get("/admin/blood-requests");
  return res.data; // { blood_requests: [...] }
}

export async function completeBloodRequest(id) {
  const res = await api.patch(`/admin/blood-requests/${id}/complete`);
  return res.data;
}

export async function getAllDonations() {
  const res = await api.get("/admin/donations");
  return res.data; // { donations: [...] }
}

export async function verifyDonation(id, donatedUnits) {
  const res = await api.patch(`/admin/donations/${id}/verify`, { donated_units: donatedUnits });
  return res.data;
}

export async function rejectDonation(id, reason) {
  const res = await api.patch(`/admin/donations/${id}/reject`, { rejection_reason: reason });
  return res.data;
}

// ============== NOTIFICATIONS ==============

export async function getNotifications() {
  const res = await api.get("/notifications/");
  return res.data; // { notifications: [...] }
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch("/notifications/read-all");
  return res.data;
}

// ============== PUBLIC BLOOD BANKS (No Auth) ==============

export async function getPublicBloodBanks(params = {}) {
  const query = new URLSearchParams();
  if (params.state_code) query.set("state_code", params.state_code);
  if (params.dist_id) query.set("dist_id", params.dist_id);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  const res = await api.get(`/public-blood-banks/${qs ? "?" + qs : ""}`);
  return res.data; // { blood_banks: [...] }
}

// ============== BLOOD BANK PROFILE REGISTRATION ==============

export async function registerBloodBankProfile(data) {
  const res = await api.post("/blood-bank/register", data);
  return res.data;
}

// ============== CAMPS ==============

export async function getMyCamps() {
  const res = await api.get("/camps/my-camps");
  return res.data;
}

export async function createCamp(data) {
  const res = await api.post("/camps/", data);
  return res.data;
}

export async function updateCamp(id, data) {
  const res = await api.put(`/camps/${id}`, data);
  return res.data;
}

export async function deleteCamp(id) {
  const res = await api.delete(`/camps/${id}`);
  return res.data;
}

export async function getUpcomingCamps() {
  const res = await api.get("/camps/upcoming");
  return res.data;
}

export async function getCurrentCamps() {
  const res = await api.get("/camps/current");
  return res.data;
}

// ============== BLOOD BANK FULFILL ==============

export async function fulfillBloodRequest(requestId) {
  const res = await api.post(`/blood-bank/fulfill-request/${requestId}`);
  return res.data;
}

export async function getAdminCamps() {
  const res = await api.get("/admin/camps");
  return res.data;
}
