import API from "./axios";

export const fetchServices = () => API.get("/services");
export const bookService = (serviceData) =>
  API.post("/services/book", serviceData);

// Professional Profiles
export const fetchVets = (params) => API.get("/professional/vet", { params });
export const fetchShops = (params) => API.get("/professional/shop", { params });
export const fetchKennels = (params) =>
  API.get("/professional/kennel", { params });
export const fetchBreeders = (params) =>
  API.get("/professional/breeder", { params });
export const fetchGroomers = (params) =>
  API.get("/professional/groomer", { params });
