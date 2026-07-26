import { useEffect, useState } from "react";
import api from "./api/axiosInstance";
import "./App.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";

function App() {
  const [healthStatus, setHealthStatus] = useState("Checking backend...");

  useEffect(() => {
    api.get("/api/health")
      .then((response) => {
        setHealthStatus(response.data.status ?? "Backend connected");
      })
      .catch(() => {
        setHealthStatus("Backend connection failed");
      });
  }, []);

  if (window.location.pathname === "/health") {
    return (
      <main>
        <h1>Backend Status</h1>
        <p>{healthStatus}</p>
      </main>
    );
  }

  if (window.location.pathname === "/dashboard") {
    return <Dashboard />;
  }

  return <Login />;
}

export default App;