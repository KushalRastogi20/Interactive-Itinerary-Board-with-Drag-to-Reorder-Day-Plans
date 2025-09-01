import api from "@/utils/axios";

export async function checkAuth() {
  try {
    const res = await api.get("/auth/verify", { withCredentials: true });
    return { loggedIn: true, user: res.data.user };
  } catch (err) {
    return { loggedIn: false };
  }
}
