import axios from "./axios";

export const createReport = async (data) => {
  const res = await axios.post("/reports", data);
  return res.data;
};

export const getUserReports = async () => {
  const res = await axios.get("/reports/my-reports");
  return res.data;
};
