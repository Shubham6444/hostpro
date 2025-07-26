// src/services/utils/endpoint.js
// export const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3000";
export const VPS_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || "http://localhost:30005/app2";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const API_ENDPOINTS = {

  // gateway servies
  LOGIN: `${BASE_URL}/auth/login`,
  SIGNUP: `${BASE_URL}/auth/signup`,
  USER_INFO: `${BASE_URL}/api/user/me`,
  ADMIN_USERS: `${BASE_URL}/api/admin/users`,
  ADMIN_STATS: `${BASE_URL}/api/admin/stats`,


  //vps services
  vm_status: `${VPS_URL}/api/vm-status`,
  vm_action: `${VPS_URL}/api/vm-action`,
  create_vm: `${VPS_URL}/api/create-vm`,
  fix_vm_password: `${VPS_URL}/api/fix-vm-password`,
};
