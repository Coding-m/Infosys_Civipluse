import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const CITIZEN_API_URL = `${API_URL}/api/citizen`;
const ADMIN_API_URL   = `${API_URL}/api/admin`;
const OFFICER_API_URL = `${API_URL}/api/officer`;

// ── Citizen ───────────────────────────────────────────────────────────────
export const citizenSignup         = (formData) => axios.post(`${CITIZEN_API_URL}/signup`,          formData);
export const citizenLogin          = (formData) => axios.post(`${CITIZEN_API_URL}/login`,           formData);
export const citizenForgotPassword = (formData) => axios.post(`${CITIZEN_API_URL}/forgot-password`, formData);
export const citizenResetPassword  = (formData) => axios.post(`${CITIZEN_API_URL}/reset-password`,  formData);

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminSignup           = (formData) => axios.post(`${ADMIN_API_URL}/signup`,            formData);
export const adminLogin            = (formData) => axios.post(`${ADMIN_API_URL}/login`,             formData);
export const adminForgotPassword   = (formData) => axios.post(`${ADMIN_API_URL}/forgot-password`,   formData);
export const adminResetPassword    = (formData) => axios.post(`${ADMIN_API_URL}/reset-password`,    formData);

// ── Officer ───────────────────────────────────────────────────────────────
export const officerLogin          = (formData) => axios.post(`${OFFICER_API_URL}/login`,           formData);