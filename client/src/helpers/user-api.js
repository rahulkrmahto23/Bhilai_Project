import axios from "axios";

// Use environment variable or fallback to deployed backend URL
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://bhilai-project.vercel.app/api/v1/user",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // allows cookies to be sent/received
});

// Helper function to handle API responses consistently
const handleResponse = (response) => {
  return {
    success: response.data.success || true,
    message: response.data.message || "Operation successful",
    data: response.data.data || response.data,
  };
};

// Helper function to handle errors consistently
const handleError = (error) => {
  console.error("API Error:", error.response?.data || error.message);
  
  const errorMessage = error.response?.data?.message || 
                      error.message || 
                      "An unexpected error occurred";
  
  const errorDetails = {
    success: false,
    message: errorMessage,
    error: error.response?.data?.error || error.message,
    status: error.response?.status,
  };
  
  throw errorDetails; // Throw the error object to be caught by the caller
};

// Auth API Methods

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post("/login", { email, password });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const signupUser = async (name, email, password, role = "CLIENT") => {
  try {
    const response = await apiClient.post("/signup", {
      name,
      email,
      password,
      role,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.get("/logout");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Permit API Methods

export const createPermit = async (permitData) => {
  try {
    const response = await apiClient.post("/add-permit", permitData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getAllPermits = async () => {
  try {
    const response = await apiClient.get("/permits");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getPermitById = async (id) => {
  try {
    const response = await apiClient.get(`/permits/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updatePermit = async (id, updatedData) => {
  try {
    const response = await apiClient.put(`/edit-permit/${id}`, updatedData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const deletePermit = async (id) => {
  try {
    const response = await apiClient.delete(`/delete-permit/${id}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const searchPermits = async (queryParams) => {
  try {
    // Convert dates to ISO strings if they exist
    const processedParams = { ...queryParams };
    
    if (queryParams.startDate) {
      processedParams.startDate = queryParams.startDate.toISOString();
    }
    if (queryParams.endDate) {
      processedParams.endDate = queryParams.endDate.toISOString();
    }

    const response = await apiClient.get("/search-permits", { 
      params: processedParams 
    });
    
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getPermitStats = async () => {
  try {
    const response = await apiClient.get("/permits/stats");
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Utility function to set auth token if needed
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};