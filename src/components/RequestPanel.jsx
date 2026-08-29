import React from "react";

function RequestPanel({ save }) {
  const [method, setMethod] = "GET";
  const [url, setUrl] = "";

  let handleSend = () => {};
  return (
    <div className="rc-toolbar">
      <select
        className="rc-method-select"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="PATCH">PATCH</option>
        <option value="DELETE">DELETE</option>
      </select>
      <input
        className="rc-url-input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        placeholder="https://api.example.com/v1/resource"
        spellCheck={false}
      />
      <button
        className="rc-send-btn"
        onClick={handleSend}
        disabled={false}
        style={{ background: false ? "#8FB5AE" : "var(--accent)" }}
      >
        {false ? "Sending…" : "Send"}
      </button>
      <button className="rc-save-btn" onClick={save}>
        Save
      </button>
    </div>
  );
}

export default RequestPanel;
