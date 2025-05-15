// services/api.js

import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:7000/api/v1/user",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // allows cookies to be sent/received
});

// Login User
export const loginUser = async (email, password) => {
  try {
    const res = await apiClient.post("/login", { email, password });
    return {
      success: true,
      message: res.data.message,
      user: {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      },
    };
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Unable to login");
  }
};

// Signup User
export const signupUser = async (name, email, password, role = "CLIENT") => {
  try {
    const res = await apiClient.post("/signup", {
      name,
      email,
      password,
      role,
    });
    return {
      success: true,
      message: res.data.message,
      user: {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      },
    };
  } catch (error) {
    console.error("Signup Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Unable to signup");
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const res = await apiClient.get("/logout");
    return {
      success: true,
      message: res.data.message,
    };
  } catch (error) {
    console.error("Logout Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Unable to logout");
  }
};
