import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8000/api";

// Define the type for profile data
interface ProfileData {
  username?: string;
  email?: string;
  profile_picture?: string;
  [key: string]: string | number | undefined; // Allow only string or number values
}

// Helper function to handle HTTP errors
const handleResponse = async (response: Response) => {
  // console.log("Handling response with status:", response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || "An error occurred";

    if (response.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    throw new Error(errorMessage);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    // console.log("204 No Content response received");
    return null; // Return null for no content
  }

  return response.json(); // Parse JSON for other statuses
};

// Handle API request with authorization
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    // console.log("Making API request to:", `${API_URL}${endpoint}`);
    // console.log("Request options:", options);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // console.log("Response status:", response.status);

    return await handleResponse(response);
  } catch (error) {
    console.error("API request failed:", error);

    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }

    throw error;
  }
};

// Auth services
export const authService = {
  register: (userData: { username: string; email: string; password: string; confirm_password: string }) => {
    return apiRequest("/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
  
  login: async (credentials: { username: string; password: string }) => {
    const data = await apiRequest("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    
    if (data.access) {
      localStorage.setItem("token", data.access);
    }
    
    return data;
  },
  
  logout: () => {
    localStorage.removeItem("token");
  },
  
  getProfile: () => {
    return apiRequest("/auth/profile/");
  },
  
  updateProfile: (profileData: ProfileData) => {
    return apiRequest("/auth/profile/", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
  
  updateProfilePicture: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/auth/profile/picture/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to upload profile picture");
    }

    // Return the response as JSON if the backend sends a JSON response
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest("/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest("/auth/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (userId: string, token: string, newPassword: string) => {
    return apiRequest(`/auth/reset-password/${userId}/${token}/`, {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword }),
    });
  },
};

// File services
export const fileService = {
  uploadFile: (formData: FormData, onProgress?: (percentage: number) => void) => {
    const token = localStorage.getItem("token");
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Handle progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            onProgress(percentage);
          }
        });
      }
      
      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.detail || "Upload failed"));
          } catch (e) {
            reject(new Error("Upload failed"));
          }
        }
      });
      
      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred"));
      });
      
      xhr.open("POST", `${API_URL}/files/`);
      
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  },
  
  getFiles: () => {
    return apiRequest("/files/");
  },
  
  getFile: (fileId: number) => {
    return apiRequest(`/files/${fileId}/`);
  },
  
  deleteFile: (fileId: number) => {
    return apiRequest(`/files/${fileId}/`, {
      method: "DELETE",
    }).then((response) => {
      // console.log("DELETE response status:", response?.status);

      // Check if the response status is 204 (No Content)
      if (response?.status === 204) {
        // console.log("No content returned for DELETE request");
        return; // No content to parse
      }

      return response?.json(); // Parse JSON for other statuses
    });
  },
  
  downloadFile: async (fileId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing");
    }

    try {
      console.log(`Starting download for file ID: ${fileId}`);

      const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        console.error("Failed to download file. Response:", response);
        throw new Error("Failed to download file");
      }

      // Log the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      console.log("Content-Disposition header:", contentDisposition);

      let filename = "downloaded_file";
      if (contentDisposition) {
        // Extract the filename from the Content-Disposition header
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].replace(/"/g, "").trim());
        }
      }

      console.log("Extracted filename:", filename);

      // Create a blob from the response
      const blob = await response.blob();
      console.log("Blob created successfully:", blob);

      const url = window.URL.createObjectURL(blob);
      console.log("Object URL created:", url);

      // Create a temporary link to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Use the extracted filename
      document.body.appendChild(link);
      console.log("Temporary link created. Triggering download...");
      link.click();
      link.remove();

      // Revoke the object URL after download
      window.URL.revokeObjectURL(url);
      console.log("Object URL revoked. Download complete.");
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },
  
  getDashboardStats: () => {
    return apiRequest("/files/dashboard/");
  },
};
