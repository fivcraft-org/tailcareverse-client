import API from "./axios";

export const submitReview = async (reviewData) => {
  const { data } = await API.post("/reviews", reviewData);
  return data;
};

export const getTargetReviews = async (targetId) => {
  const { data } = await API.get(`/reviews/${targetId}`);
  return data;
};
