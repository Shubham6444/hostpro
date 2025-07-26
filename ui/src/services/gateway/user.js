// src/services/gateway/user.js
import axios from "axios"
import Cookies from "js-cookie"
import { API_ENDPOINTS } from "../../utils/endpoints"

export const fetchUserInfo = async () => {
    const token = Cookies.get("token")
    if (!token) return null

    try {
        const res = await axios.get(API_ENDPOINTS.USER_INFO, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return res.data // { username, ... }
    } catch (err) {
        return null
    }
}
