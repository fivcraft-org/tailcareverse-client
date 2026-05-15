import axios from "./axios";

export const registerUser = async (data) => {
  const res = await axios.post("/auth/register", data);
  return res.data;
};

export const verifyRegisterOTP = async (data) => {
  const res = await axios.post("/auth/verify-otp", data);
  return res.data;
};

export const resendRegisterOTP = async (payload) => {
  const res = await axios.post("/auth/resend-register-otp", payload);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post("/auth/login", data);
  return res.data;
};

export const verifyLoginOTP = async (data) => {
  const res = await axios.post("/auth/verify-login-otp", data);
  return res.data;
};

export const resendLoginOTP = async (payload) => {
  const res = await axios.post("/auth/resend-login-otp", payload);
  return res.data;
};

export const resendOTP = async (data) => {
  const res = await axios.post("/auth/resend-otp", data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await axios.post("/auth/reset-password", data);
  return res.data;
};

export const sendForgotPasswordOTP = async (data) => {
  const res = await axios.post("/auth/forgot-password", data);
  return res.data;
};

export const verifyForgotPasswordOTP = async (data) => {
  const res = await axios.post("/auth/verify-forgot-password-otp", data);
  return res.data;
};

export const resendForgotPasswordOTP = async (payload) => {
  const res = await axios.post("/auth/resend-forgot-password-otp", payload);
  return res.data;
};

export const getProfile = async () => {
  const res = await axios.get("/auth/me");
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.post("/auth/logout");
  return res.data;
};
