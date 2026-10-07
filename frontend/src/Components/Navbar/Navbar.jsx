function Navbar({ onRefresh }) {
  const logout = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("displayName");
    window.location.assign("/");
  };

  return <nav className="navbar"><div className="navbar-search"><span className="navbar-search-icon">◉</span><span className="navbar-search-input">AegisSight Operations</span></div><div className="navbar-actions"><button className="api-nav-button" onClick={onRefresh}>Refresh data</button><div className="navbar-profile"><div className="navbar-avatar">👤</div><div className="navbar-profile-text"><span className="navbar-profile-name">{localStorage.getItem("displayName") || "Operator"}</span><span className="navbar-profile-role">Control Center</span></div></div><button className="api-nav-button" onClick={logout}>Sign out</button></div></nav>;
}

export default Navbar;
