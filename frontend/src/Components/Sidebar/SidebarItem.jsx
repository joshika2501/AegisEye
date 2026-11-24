function SidebarItem({ icon, label, active = false, onClick }) {
    return (
        <button type="button" className={`sidebar-item ${active ? "active" : ""}`} onClick={onClick} aria-current={active ? "page" : undefined} title={label}>
            <span className="sidebar-item-icon">{icon}</span>

            <span className="sidebar-item-label">
        {label}
      </span>
        </button>
    );
}

export default SidebarItem;
