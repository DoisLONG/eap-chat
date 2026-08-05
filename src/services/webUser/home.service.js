import axios from "axios";

const webUserHomeApi = axios.create({
  baseURL: "/web-user-home-api",
  timeout: 15000,
});

webUserHomeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap(response) {
  const payload = response.data;
  if (payload?.status !== 200) throw new Error(payload?.message || "首页数据读取失败");
  return payload.results;
}

export async function getWebUserHome() {
  return unwrap(await webUserHomeApi.get("/v1/web-user/home"));
}
