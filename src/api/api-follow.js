import API from "./axios";

export const followUser = (id) => API.post(`/follow/${id}`);
export const unfollowUser = (id) => API.delete(`/follow/${id}`);
export const getFollowStatus = (id) => API.get(`/follow/${id}/status`);
export const getSuggestions = () => API.get("/follow/suggestions");
