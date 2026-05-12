import API from "./axios";

export const fetchPosts = async () => {
  const res = await API.get("/posts/feed");
  return res.data;
};

export const fetchExplorePosts = async (page = 1, limit = 20) => {
  const res = await API.get(`/posts/explore?page=${page}&limit=${limit}`);
  return res.data;
};

export const createPost = async (postData) => {
  const res = await API.post("/posts", postData);
  return res.data;
};

export const likePost = async (id) => {
  const res = await API.post(`/posts/${id}/like`);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await API.delete(`/posts/${id}`);
  return res.data;
};

export const getPostComments = async (postId) => {
  const res = await API.get(`/posts/${postId}/comments`);
  return res.data;
};

export const addComment = async (postId, content) => {
  const res = await API.post(`/posts/${postId}/comments`, { content });
  return res.data;
};

export const getUserPosts = async (userId, page = 1, limit = 20) => {
  const res = await API.get(
    `/posts/user/${userId}?page=${page}&limit=${limit}`,
  );
  return res.data;
};
export const getTaggedPosts = async (userId, page = 1, limit = 20) => {
  const res = await API.get(
    `/posts/user/${userId}/tagged?page=${page}&limit=${limit}`,
  );
  return res.data;
};
