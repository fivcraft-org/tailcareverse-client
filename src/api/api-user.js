import axios from "./axios";

export const updateProfile = async (data) => {
  const res = await axios.put("/users/profile", data);
  return res.data;
};

export const updateAvatar = async (formData) => {
  const res = await axios.put("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateCoverImage = async (formData) => {
  const res = await axios.put("/users/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadDocs = async (formData) => {
  const res = await axios.post("/users/upload-docs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const removeAvatar = async () => {
  const res = await axios.delete("/users/avatar");
  return res.data;
};

export const removeCoverImage = async () => {
  const res = await axios.delete("/users/cover");
  return res.data;
};

export const getUserProfile = async (id) => {
  const res = await axios.get(`/users/${id}`);
  return res.data;
};

export const getUserRoles = async () => {
  const res = await axios.get("/users/roles");
  return res.data;
};

export const searchUsers = async (query) => {
  const res = await axios.get("/users/search", { params: { query } });
  console.log("Search API result:", res.data);
  return res.data;
};

export const getFollowers = async (id) => {
  const res = await axios.get(`/users/${id}/followers`);
  return res.data;
};

export const getFollowing = async (id) => {
  const res = await axios.get(`/users/${id}/following`);
  return res.data;
};

export const createEditRequest = async (data) => {
  const res = await axios.post("/users/edit-request", data);
  return res.data;
};

export const getEditRequestStatus = async () => {
  const res = await axios.get("/users/edit-request/status");
  return res.data;
};

export const blockUser = async (userId) => {
  const res = await axios.post(`/users/${userId}/block`);
  return res.data;
};

export const unblockUser = async (userId) => {
  const res = await axios.post(`/users/${userId}/unblock`);
  return res.data;
};
