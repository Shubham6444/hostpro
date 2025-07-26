// src/services/gateway/vm.js
import axios from "axios";

const BASE_URL = "http://localhost:3002/api/stats/container-usage";

export const fetchUsage = async () => {
  const res = await axios.get(BASE_URL, {
    withCredentials: true,
  });
  return res.data;
};
