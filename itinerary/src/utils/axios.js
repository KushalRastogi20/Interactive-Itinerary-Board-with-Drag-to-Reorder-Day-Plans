// utils/axios.js
import axios from "axios";

// Create the axios instance
const api = axios.create({

  // baseURL: "http://localhost:8080/api/v1",
  baseURL: "https://itinerary-server-472k.onrender.com/api/v1",
//   withCredentials: true, // Replace with your API base URL
  withCredentials: true, // Only needed if you're using cookies with auth
});

export default api;
