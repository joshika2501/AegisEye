import { useEffect, useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import OperationsPage from "./pages/Operations/OperationsPage";

export { DEMO_STORAGE_KEY } from "./demoData";

function App() {
  const initialPath = window.location.pathname;
  const hasDemoSession = sessionStorage.getItem("aegissight.demo") === "true";
  const [theme, setTheme] = useState(() => localStorage.getItem("aegissight.theme") || "dark");
  const [demo, setDemo] = useState(hasDemoSession);
  const [page, setPage] = useState(() => initialPath.startsWith("/dashboard") && hasDemoSession ? (initialPath.split("/")[2] || "dashboard") : "login");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aegissight.theme", theme);
  }, [theme]);

  useEffect(() => {
    const handlePop = () => setPage(window.location.pathname.startsWith("/dashboard") && sessionStorage.getItem("aegissight.demo") === "true" ? (window.location.pathname.split("/")[2] || "dashboard") : "login");
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const enterDemo = () => {
    sessionStorage.setItem("aegissight.demo", "true");
    setDemo(true);
    setPage("dashboard");
    window.history.pushState({}, "", "/dashboard?mode=demo");
  };
  const exitDemo = () => {
    sessionStorage.removeItem("aegissight.demo");
    setDemo(false);
    setPage("login");
    window.history.pushState({}, "", "/");
  };
  const navigate = (next) => {
    setPage(next);
    window.history.pushState({}, "", next === "dashboard" ? "/dashboard?mode=demo" : `/dashboard/${next}?mode=demo`);
  };

  if (page === "login" && !demo) return <Login onTryDemo={enterDemo} theme={theme} setTheme={setTheme} />;
  return page === "dashboard"
    ? <Dashboard theme={theme} setTheme={setTheme} demo={demo} onExitDemo={exitDemo} onNavigate={navigate} />
    : <OperationsPage page={page} theme={theme} setTheme={setTheme} demo={demo} onExitDemo={exitDemo} onNavigate={navigate} />;
}

export default App;
