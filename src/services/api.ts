import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8000/api";



// Helper function to handle HTTP errors
const handleResponse = async (response: Response) => {
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
  
  return response.json();
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
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    return await handleResponse(response);
  } catch (error) {
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
  
  updateProfile: (profileData: any) => {
    return apiRequest("/auth/profile/", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
  
  updateProfilePicture: (formData: FormData) => {
    return apiRequest("/auth/profile/picture/", {
      method: "POST",
      headers: {}, // Let browser set correct content type with boundary
      body: formData,
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
    });
  },
  
  downloadFile: async (fileId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing");
    }

    try {
      const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Extract the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "downloaded_file";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].replace(/"/g, "").trim());
        }
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Use the extracted filename
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Revoke the object URL after download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },
  
  getDashboardStats: () => {
    return apiRequest("/files/dashboard/");
  },
};
