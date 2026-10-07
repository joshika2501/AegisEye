import { useState } from "react";
import api from "../../api/axiosInstance";
import "./Login.css";

function MailIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
}

function LockIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></svg>;
}

function EyeIcon({ hidden }) {
    return hidden ? (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5.3 0 8.8 5.1 9.5 7- .3.8-1.1 2.2-2.5 3.5M6.5 6.5C4.4 8 3.2 10.4 2.5 12c.7 1.9 4.2 7 9.5 7 1 0 2-.2 2.9-.5" /></svg>
    ) : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6.2 5 12 5s9.5 7 9.5 7-3.7 7-9.5 7S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            const { data } = await api.post("/api/auth/login", { username, password });
            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("accessToken");
            (rememberMe ? localStorage : sessionStorage).setItem("accessToken", data.accessToken);
            localStorage.setItem("displayName", data.user?.displayName || data.user?.username || username);
            window.location.assign("/dashboard");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Login failed. Check your username, password, and backend connection.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-frame">
                <section className="login-brand" aria-label="AegisEye Security Solutions">
                    <img src="/logo.jpeg" alt="AegisEye — Watch. Analyze. Protect." />
                </section>

                <section className="login-card" aria-labelledby="login-title">
                    <header className="login-card-heading">
                        <h1 id="login-title">Welcome Back</h1>
                        <p>Secure Access Portal</p>
                    </header>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <label className="login-field">
                            <span>Username</span>
                            <span className="login-input-wrap">
                <MailIcon />
                <input type="text" name="username" placeholder="Enter your username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
              </span>
                        </label>

                        <label className="login-field">
                            <span>Password</span>
                            <span className="login-input-wrap">
                <LockIcon />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeIcon hidden={showPassword} />
                </button>
              </span>
                        </label>

                        <div className="login-options">
                            <label className="remember-control">
                                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                                <span>Remember Me</span>
                            </label>
                            <span className="login-no-reset">Use your project operator account</span>
                        </div>

                        {error && <p className="login-error" role="alert">{error}</p>}
                        <button className="login-submit" type="submit" disabled={busy}><LockIcon /> {busy ? "SIGNING IN…" : "LOGIN"}</button>

                    </form>
                </section>
            </div>
            <footer className="login-footer">© 2026 <span>AEGISEYE</span> Security Solutions. All rights reserved.</footer>
        </main>
    );
}

export default Login;
