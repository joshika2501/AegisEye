import { useEffect, useState } from "react";
import api from "./api/axiosInstance";
import "./App.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [health, setHealth] = useState("Checking backend…");
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    if (path === "/health") {
      api.get("/api/health").then(({ data }) => setHealth(data.status)).catch(() => setHealth("Backend unavailable"));
    }
    return () => window.removeEventListener("popstate", onPopState);
  }, [path]);

  if (path === "/health") return <main className="health-page"><h1>Backend status</h1><p>{health}</p></main>;
  if (path === "/dashboard") return token ? <Dashboard /> : <Login />;
  if (path !== "/" && path !== "/login") window.history.replaceState({}, "", "/");
  return token ? <Dashboard /> : <Login />;
}

export default App;
