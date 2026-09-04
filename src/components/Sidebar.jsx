import React, { useState } from "react";

function Sidebar({ list }) {
  const [sidebar, setSidebar] = useState("saved"); // saved | history

  return (
    <aside className="rc-sidebar">
      <div className="rc-sidebar-header">
        <div className="rc-sidebar-title">Dunkk</div>
        <div className="rc-sidebar-sub">API client</div>
      </div>

      <div className="rc-seg rc-seg-sidebar">
        <button
          className={"rc-seg-btn" + (sidebar === "saved" ? " active" : "")}
          onClick={() => setSidebar("saved")}
        >
          Saved
        </button>
        <button
          className={"rc-seg-btn" + (sidebar === "history" ? " active" : "")}
          onClick={() => setSidebar("history")}
        >
          History
        </button>
      </div>

      <div className="rc-list">
        {list.map((item) => (
          <div
            className="rc-list-row"
            key={item.id}
            onClick={() => loadItem(item)}
          >
            <span
              className="rc-badge"
              style={{ color: methodColor(item.method) }}
            >
              {item.method}
            </span>
            <span className="rc-list-label">{pathOf(item.url)}</span>
            <span
              className="rc-list-meta"
              style={{
                color:
                  item.status >= 200 && item.status < 300
                    ? "#17796A"
                    : "#B4503A",
              }}
            >
              {sidebar === "history" ? String(item.status || "—") : ""}
            </span>
          </div>
        ))}
        {list.length === 0 && (
          <div className="rc-empty">
            {sidebar === "saved"
              ? "No saved requests yet. Hit Save to keep one here."
              : "No calls yet."}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
