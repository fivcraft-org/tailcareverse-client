import API from "./axios";

export const fetchPets = () => API.get("/pets");
export const getPetDetails = (id) => API.get(`/pets/${id}`);
export const registerPet = (petData) => API.post("/pets", petData);
export const updatePet = (id, petData) => API.patch(`/pets/${id}`, petData);
export const deletePet = (id) => API.delete(`/pets/${id}`);
