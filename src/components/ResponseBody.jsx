import React, { useState } from "react";

function ResponseBody({ resp }) {
  const [view, setView] = useState("pretty");
  return (
    <div className="rc-response">
      <div className="rc-response-header">
        <span className="rc-panel-label">Response</span>
        <span
          className="rc-status-pill"
          style={{
            background: !resp
              ? "transparent"
              : statusOk
                ? "rgba(23,121,106,0.10)"
                : "rgba(180,80,58,0.10)",
            color: !resp ? "#A8A6A0" : statusOk ? "#17796A" : "#B4503A",
          }}
        >
          {resp
            ? resp.status
              ? resp.status + " " + (resp.statusText || "")
              : "Failed"
            : "—"}
        </span>
        <span className="rc-timing">
          {resp
            ? resp.ms +
              " ms" +
              (resp.bytes != null ? " · " + resp.bytes + " B" : "")
            : ""}
        </span>
        <div className="rc-seg rc-seg-response">
          <button
            className={"rc-seg-btn" + (view === "pretty" ? " active" : "")}
            onClick={() => setView("pretty")}
          >
            Pretty
          </button>
          <button
            className={"rc-seg-btn" + (view === "raw" ? " active" : "")}
            onClick={() => setView("raw")}
          >
            Raw
          </button>
          <button
            className={"rc-seg-btn" + (view === "headers" ? " active" : "")}
            onClick={() => setView("headers")}
          >
            Headers
          </button>
        </div>
      </div>
      <div className="rc-response-body">
        {resp ? (
          <pre className="rc-pre">{responseText}</pre>
        ) : (
          <div className="rc-response-empty">
            send a request to see the response
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponseBody;
