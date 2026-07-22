import api from "./api";
import { backendRoleToUiRole, uiRoleToBackendRole } from "../utils/roleHelpers";

// Sends login data exactly as the Flask backend expects.
export async function loginUser({ identifier, password, role }) {
  const payload = {
    password,
    role: uiRoleToBackendRole(role),
  };

  if (role === "donor") {
    payload.phone = identifier;
  } else {
    payload.email = identifier;
  }

  const response = await api.post("/auth/login", payload);
  const backendUser = response.data.user || {};

  return {
    token: response.data.access_token,
    user: {
      ...backendUser,
      role: backendRoleToUiRole(backendUser.role),
      name: response.data.name || `${backendUser.first_name || ""} ${backendUser.last_name || ""}`.trim(),
    },
  };
}

// Registers a user. Confirm password and terms are checked in the form,
// so they are not sent because the backend does not support those fields.
export async function registerUser(formData) {
  const payload = {
    first_name: formData.firstName.trim(),
    last_name: formData.lastName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    password: formData.password,
    role: uiRoleToBackendRole(formData.role),
    gender: formData.gender,
    dob: formData.dob,
    city: formData.city.trim(),
  };

  if (formData.address?.trim()) {
    payload.address = formData.address.trim();
  }

  if (formData.role === "donor") {
    payload.blood_group = formData.bloodGroup;
    payload.weight = Number(formData.weight);

    if (formData.lastDonationDate) {
      payload.last_donation_date = formData.lastDonationDate;
    }

    payload.has_chronic_condition = Boolean(formData.hasChronicCondition);
    payload.on_medication = Boolean(formData.onMedication);
    payload.available = formData.available !== false;
  }

  const response = await api.post("/auth/register", payload);
  return response.data;
}

// Checks whether the stored JWT is still valid and gets the latest user details.
export async function getCurrentUser() {
  const response = await api.get("/auth/profile");
  const user = response.data;

  return {
    ...user,
    role: backendRoleToUiRole(user.role),
    name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
  };
}

// Makes backend and network errors safe to show in the interface.
export function getAuthErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.handledMessage) {
    return error.handledMessage;
  }

  return "Something went wrong. Please try again.";
}
