import axios from "./axios";

export const getConversations = async () => {
  const res = await axios.get("/chat/conversations");
  return res.data;
};

export const getMessages = async (userId) => {
  const res = await axios.get(`/chat/${userId}`);
  return res.data;
};

export const sendMessage = async (data) => {
  const res = await axios.post("/chat/send", data);
  return res.data;
};
export const getUnreadMessageCount = async () => {
  const res = await axios.get("/chat/unread-count");
  return res.data;
};

export const markMessagesAsRead = async (userId) => {
  const res = await axios.patch(`/chat/${userId}/read`);
  return res.data;
};

export const markAllMessagesAsRead = async () => {
  const res = await axios.patch("/chat/read-all");
  return res.data;
};

export const deleteChat = async (userId) => {
  const res = await axios.delete(`/chat/${userId}`);
  return res.data;
};
