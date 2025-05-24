import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://bhilai-project.vercel.app/api/v1/user";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to include token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

// Helper function to handle storage
const setAuthStorage = (response, keepLoggedIn) => {
  const storage = keepLoggedIn ? localStorage : sessionStorage;
  if (response.data.token) {
    storage.setItem("token", response.data.token);
  }
  if (response.data.user) {
    storage.setItem("user", JSON.stringify(response.data.user));
  }
};

// Login User
export const loginUser = async (email, password, keepLoggedIn = false) => {
  try {
    const response = await apiClient.post("/login", { email, password });
    setAuthStorage(response, keepLoggedIn);
    return {
      success: true,
      message: response.data.message,
      user: response.data.user || {
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      },
      token: response.data.token,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Unable to login");
  }
};

// Signup User
export const signupUser = async (name, email, password, role = "CLIENT", keepLoggedIn = false) => {
  try {
    const response = await apiClient.post("/signup", { name, email, password, role });
    setAuthStorage(response, keepLoggedIn);
    return {
      success: true,
      message: response.data.message,
      user: response.data.user || {
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      },
      token: response.data.token,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Unable to signup");
  }
};

// Verify Authentication
export const verifyAuth = async () => {
  try {
    const response = await apiClient.get("/verify-auth");
    return {
      isAuthenticated: true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: error.response?.data?.message || "Not authenticated",
    };
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await apiClient.get("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Unable to logout");
  }
};

// ... rest of your API functions remain the same ...

// Add a new permit
export const createPermit = async (permitData) => {
  const res = await apiClient.post("/add-permit", permitData);
  return {
    success: true,
    message: res.data.message,
    permit: res.data.permit,
  };
};

// Get all permits
export const getAllPermits = async () => {
  try {
    const res = await apiClient.get("/permits");
    return {
      success: true,
      message: res.data.message,
      permits: res.data.permits,
    };
  } catch (error) {
    console.error("Get Permits Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Unable to fetch permits");
  }
};

// Edit a permit by ID
export const updatePermit = async (id, updatedData) => {
  try {
    const res = await apiClient.put(`/edit-permit/${id}`, updatedData);
    return {
      success: true,
      message: res.data.message,
      permit: res.data.permit,
    };
  } catch (error) {
    console.error("Edit Permit Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Unable to edit permit");
  }
};

// Delete a permit by ID
export const deletePermit = async (id) => {
  try {
    const res = await apiClient.delete(`/delete-permit/${id}`);
    return {
      success: true,
      message: res.data.message,
      permit: res.data.permit,
    };
  } catch (error) {
    console.error("Delete Permit Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Unable to delete permit");
  }
};

// Search permits by query
export const searchPermits = async (queryParams) => {
  try {
    const params = {};
    
    if (queryParams.poNumber) params.poNumber = queryParams.poNumber;
    if (queryParams.permitNumber) params.permitNumber = queryParams.permitNumber;
    if (queryParams.permitStatus && queryParams.permitStatus !== 'ALL') {
      params.permitStatus = queryParams.permitStatus;
    }
    if (queryParams.startDate) {
      params.startDate = queryParams.startDate.toISOString();
    }
    if (queryParams.endDate) {
      params.endDate = queryParams.endDate.toISOString();
    }

    const response = await apiClient.get("/search-permits", { params });

    if (!response.data) {
      throw new Error("Invalid response from server");
    }

    return {
      success: true,
      message: response.data.message || "Search completed",
      permits: response.data.permits || [],
    };
  } catch (error) {
    console.error("Search Permit Error:", error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "Unable to search permits"
    );
  }
};
