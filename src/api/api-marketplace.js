import API from "./axios";

export const fetchMarketplaceItems = (params) =>
  API.get("/marketplace", { params });
export const listMarketplaceItem = (itemData) =>
  API.post("/marketplace", itemData);
export const fetchMarketplaceItemById = (id) => API.get(`/marketplace/${id}`);
export const deleteMarketplaceItem = (id) => API.delete(`/marketplace/${id}`);
export const toggleListingFavorite = (id) =>
  API.post(`/marketplace/${id}/like`);
export const fetchFavoriteListings = () => API.get("/marketplace/favorites");
export const fetchUserListings = (userId) =>
  API.get(`/marketplace/user/${userId}`);
