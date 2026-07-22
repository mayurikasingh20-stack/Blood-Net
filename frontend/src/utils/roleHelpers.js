export const uiRoleToBackendRole = (uiRole) => {
  if (uiRole === "bloodbank") return "blood_bank";
  return uiRole;
};

export const backendRoleToUiRole = (backendRole) => {
  if (backendRole === "blood_bank") return "bloodbank";
  return backendRole;
};

export const dashboardPathForRole = (role) => {
  if (role === "blood_bank" || role === "bloodbank") return "/bloodbank";
  if (role === "admin") return "/admin";
  return `/${role}-dashboard`;
};
