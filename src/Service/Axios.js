import axios from "axios";
import { getCookie } from "../Utilities/Cookie";
import { baseURL } from "../Utilities/Constants";

const instance = axios.create({
  baseURL: baseURL,
});

instance.interceptors.request.use(async (request) => {
  let token = await getCookie("cookiedata");
  if (token) {
    request.headers["Authorization"] = `bearer ${
      JSON.parse(token)?.access_token
    }`;
  }
  return request;
});

export default instance;
