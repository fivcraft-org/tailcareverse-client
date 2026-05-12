import API from "./axios";

export const fetchMoments = async () => {
  const res = await API.get("/moments/feed");
  return res.data;
};

export const createMoment = async (formData) => {
  const res = await API.post("/moments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const markMomentAsViewed = async (momentId) => {
  const res = await API.post(`/moments/${momentId}/view`);
  return res.data;
};

export const deleteMoment = async (momentId) => {
  const res = await API.delete(`/moments/${momentId}`);
  return res.data;
};

export const fetchAnnouncements = async () => {
  const res = await API.get("/moments/announcements");
  return res.data;
};
