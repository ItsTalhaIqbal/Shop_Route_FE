import cookie from "js-cookie";
import axios from "axios";
import { baseURL } from "./baseURL";


const TOKEN_KEY = "token";
const USER_KEY = "user";


export const setCookie = (key:string, value:string) => {
  cookie.set(key, value); 
};

export const removeCookie = (key:string) => {
  cookie.remove(key);
};

export const getCookie = (key:string) => {
  return cookie.get(key);
};

export const setAuthentication = (token:string) => {
  setCookie(TOKEN_KEY, token);
};

export const logOut = () => {
  removeCookie(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLogin = async () => {
  const token = getCookie(TOKEN_KEY);

  if (token) {
    try {
      const res = await axios.post(`${baseURL}/api/auth/auth`, { token });

      if (res.data && res.data.data) {
        const { data } = res.data;
        localStorage.setItem(USER_KEY, JSON.stringify({ name: data.username, email: data.email,Id:data.userId }));

        return data;
      }
    } catch (error) {
      return  window.location.href =`/login`;
    }
  }
  return null;
};
