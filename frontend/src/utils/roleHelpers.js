export const uiRoleToBackendRole = (uiRole) => {
  if (uiRole === "bloodbank") return "blood_bank";
  return uiRole;
};

export const backendRoleToUiRole = (backendRole) => {
  if (backendRole === "blood_bank") return "bloodbank";
  return backendRole;
};

export const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

export const hasAnyRole = (user, roles) => {
  if (!user || !user.roles) return false;
  return roles.some(r => user.roles.includes(r));
};

export const dashboardPathForRole = (role) => {
  if (role === "blood_bank" || role === "bloodbank") return "/bloodbank";
  if (role === "admin") return "/admin";
  if (role?.includes("donor") || role?.includes("patient")) return "/dashboard";
  return `/${role}-dashboard`;
};
