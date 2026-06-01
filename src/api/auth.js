import api from "./axios"; // ✅ Use configured instance — gets timeout + interceptors

const CITIZEN_API_URL = `/api/citizen`;
const ADMIN_API_URL   = `/api/admin`;
const OFFICER_API_URL = `/api/officer`;

// ── Citizen ───────────────────────────────────────────────────────────────
export const citizenSignup         = (formData) => api.post(`${CITIZEN_API_URL}/signup`,          formData);
export const citizenLogin          = (formData) => api.post(`${CITIZEN_API_URL}/login`,           formData);
export const citizenForgotPassword = (formData) => api.post(`${CITIZEN_API_URL}/forgot-password`, formData);
export const citizenResetPassword  = (formData) => api.post(`${CITIZEN_API_URL}/reset-password`,  formData);

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminSignup           = (formData) => api.post(`${ADMIN_API_URL}/signup`,            formData);
export const adminLogin            = (formData) => api.post(`${ADMIN_API_URL}/login`,             formData);
export const adminForgotPassword   = (formData) => api.post(`${ADMIN_API_URL}/forgot-password`,   formData);
export const adminResetPassword    = (formData) => api.post(`${ADMIN_API_URL}/reset-password`,    formData);

// ── Officer ───────────────────────────────────────────────────────────────
export const officerLogin          = (formData) => api.post(`${OFFICER_API_URL}/login`,           formData);