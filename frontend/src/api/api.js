import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attaches JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/**
 * Bulk generate all sections for a project.
 */
export async function generateProjectSections(projectId) {
  return api.post(`/generate/project/${projectId}/generate`, {});
}

/**
 * Individual outline generation
 */
export async function generateOutline(projectId) {
  return api.post("/generate/outline", { project_id: projectId });
}

/**
 * Individual section content generation
 */
export async function generateSectionContent(sectionId) {
  return api.post("/generate/content", { section_id: sectionId });
}

/**
 * Section content refinement
 */
export async function refineSectionContent(sectionId, prompt, feedback = null, comment = null) {
  return api.post("/generate/refine", {
    section_id: sectionId,
    prompt,
    feedback,
    comment,
  });
}

export default api;
