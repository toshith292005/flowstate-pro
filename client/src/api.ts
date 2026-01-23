import axios from "axios";

// This checks if the app is running live or on your computer
const isLocal = window.location.hostname === "localhost";

const api = axios.create({
  baseURL: isLocal 
    ? "http://localhost:5000/api" 
    : "https://flowstate-pro.onrender.com/api"
});

export default api;