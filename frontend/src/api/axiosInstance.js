import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});


// Attach JWT automatically
api.interceptors.request.use(

    (config)=>{

        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");


        if(token){

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },


    (error)=>{

        return Promise.reject(error);

    });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/" && window.location.pathname !== "/login") {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("displayName");
      window.location.assign("/");
    }
    return Promise.reject(error);
  },
);


export default api;
