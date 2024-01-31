import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "http://192.168.30.118:8800/api/",
  withCredentials: true,
});
