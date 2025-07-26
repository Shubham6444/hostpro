// src/services/gateway/vm.js
import axios from "axios"
import { API_ENDPOINTS } from "../../utils/endpoints"

// const BASE_URL = "http://localhost:3002/api"

export const getVMStatus = async () => {
  const res = await axios.get(`${API_ENDPOINTS.vm_status}`, {
    withCredentials: true,
  })
  return res.data
}

export const performVMAction = async (action) => {
  const res = await axios.post(
    `${API_ENDPOINTS.vm_action}`,
    { action },
    { withCredentials: true }
  )
  return res.data
}

export const createVM = async ({ vmPassword, customDomain, plan }) => {
  const res = await axios.post(
    `${API_ENDPOINTS.create_vm}`,
    { vmPassword, customDomain, plan },
    { withCredentials: true }
  )
  return res.data
}

export const updateVMPassword = async (newPassword) => {
  const res = await axios.post(
    `${API_ENDPOINTS.fix_vm_password}`,
    { newPassword },
    { withCredentials: true }
  )
  return res.data
}
