import React, { useEffect, useState } from "react";

function RequestPanel({
  save,
  method,
  onChange,
  handleSend,
  onChangeUrl,
  urlError,
  shakeTrigger,
  onCompleteTyping,
}) {
  const [url, setUrl] = "";
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!shakeTrigger) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, [shakeTrigger]);

  return (
    <div className="rc-toolbar">
      <select
        className="rc-method-select"
        value={method}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="PATCH">PATCH</option>
        <option value="DELETE">DELETE</option>
      </select>
      <input
        className={
          "rc-url-input" +
          (urlError ? " rc-input-error" : "") +
          (shaking ? " rc-shake" : "")
        }
        value={url}
        onChange={(e) => onChangeUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        placeholder="https://api.example.com/v1/resource"
        spellCheck={false}
        onBlur={onCompleteTyping}
      />
      <button
        className="rc-send-btn"
        onClick={() => handleSend()}
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
