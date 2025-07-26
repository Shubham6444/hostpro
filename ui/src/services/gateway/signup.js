// src/services/gateway/signup.js
import axios from "axios"
import { API_ENDPOINTS } from "../../utils/endpoints"

export const signupUser = async ({ name, email, password }) => {
  try {
    const response = await axios.post(API_ENDPOINTS.SIGNUP, {
      name,
      email,
      password,
    })

    return response.data // { token } or { message }
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Signup failed"
    throw new Error(message)
  }
}
