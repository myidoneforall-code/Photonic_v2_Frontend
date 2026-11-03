import setCookie, { getCookie } from "./Cookie";

export const GetSessionStorage = (session_name) => {
  return sessionStorage.getItem(session_name);
};

export const SetSessionStorage = (session_name, item) => {
  return sessionStorage.setItem(session_name, item);
};

export const GetCookieStorage = (cookie_name) => {
  return getCookie(cookie_name);
};

export const SetCookieStorage = (cookie_name, item) => {
  return setCookie(cookie_name, item);
};

export const GetLocalStorage = (storage_name) => {
  return localStorage.getItem(storage_name);
};

export const SetLocalStorage = (storage_name, item) => {
  return localStorage.setItem(storage_name, item);
};
