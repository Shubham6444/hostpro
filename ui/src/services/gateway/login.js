
// src/services/gateway/login.js
import axios from "axios"
import { API_ENDPOINTS } from "../../utils/endpoints"

export const loginUser = async ({ username, password }) => {
  try {
    const response = await axios.post(API_ENDPOINTS.LOGIN, {
      username,
      password,
    })

    return response.data // { token }
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Login failed"
    throw new Error(message)
  }
}
