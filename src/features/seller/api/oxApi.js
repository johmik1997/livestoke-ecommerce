import ApiService from "@/service/ApiService";

const api = new ApiService();
const BASE_URL = "/api/oxen";

// Get a single ox by ID
export const getOx = async (id) => {
  const response = await api.addAuthenticationHeader().get(`${BASE_URL}/${id}`);
  return response;
};

// Create new ox
export const createOx = (formData) => {
  return api.addAuthenticationHeader().post(`${BASE_URL}`, formData);
  // Do NOT set Content-Type manually, ApiService will handle FormData
};

// Update existing ox
export const updateOx = (id, formData) => {
  return api.addAuthenticationHeader().put(`${BASE_URL}/${id}`, formData);
  // Again, let ApiService handle headers
};

// Delete ox
export const deleteOx = (id) => {
  return api.addAuthenticationHeader().delete(`${BASE_URL}/${id}`);
};

// Search oxen
export const searchOx = (oxName, sellerName) => {
  const params = {};
  if (oxName) params.oxName = oxName;
  if (sellerName) params.sellerName = sellerName;

  return api.addAuthenticationHeader().get(`${BASE_URL}/search`, { params });
};
