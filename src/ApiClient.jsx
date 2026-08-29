import { useMemo, useState } from "react";
import "./ApiClient.css";
import Sidebar from "./components/sidebar";
import ResponseBody from "./components/ResponseBody";
import RequestPanel from "./components/RequestPanel";

/**
 * Relay — API client UI
 * ----------------------------------------------------------------
 * This component is UI ONLY. It owns the state needed to make the
 * screen interactive (fields, tabs, rows, saved/history lists) but
 * it does not talk to the network itself. Wire up real behavior by
 * passing the props below from the parent that uses this component:
 *
 *   <ApiClient onSend={(request) => Promise<ResponseShape>} />
 *
 *   onSend(request) — request is { method, url, headers, body }.
 *     Return (or resolve to) a response object shaped like:
 *       { status, statusText, headers: [[key, value], ...], text, ms, bytes }
 *     This is the ONLY thing you need to implement to make Send work.
 *     Leaving it unset renders a console warning and does nothing.
 *
 * Everything else (adding/removing param & header rows, switching
 * tabs, saving a request to the sidebar, loading a saved/history
 * item back into the form, formatting the JSON body) is handled
 * locally by this component since it's pure UI state, not "backend"
 * functionality — swap it out for your own logic if you need to.
 */

const METHOD_COLORS = {
  GET: "#17796A",
  POST: "#3B6EF5",
  PUT: "#B4763A",
  PATCH: "#8A6BC7",
  DELETE: "#B4503A",
};

function methodColor(m) {
  return METHOD_COLORS[m] || "#6E6C66";
}

function pathOf(u) {
  try {
    const p = new URL(u);
    return p.pathname + (p.search || "");
  } catch (e) {
    return u || "/";
  }
}

function buildUrlWithParams(url, params) {
  const qs = params.filter((p) => p.key.trim());
  if (!qs.length) return url;
  const sep = url.includes("?") ? "&" : "?";
  return (
    url +
    sep +
    qs
      .map((p) => encodeURIComponent(p.key) + "=" + encodeURIComponent(p.value))
      .join("&")
  );
}

export default function ApiClient({ accent = "#17796A", onSend }) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [params, setParams] = useState([{ key: "", value: "" }]);
  const [headers, setHeaders] = useState([
    { key: "Accept", value: "application/json" },
  ]);
  const [body, setBody] = useState("");

  const [tab, setTab] = useState("params"); // params | headers | body
  const [sidebar, setSidebar] = useState("saved"); // saved | history
  // pretty | raw | headers

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);

  const rowsKind = tab === "params" ? "params" : "headers";
  const rowsState = rowsKind === "params" ? params : headers;
  const setRowsState = rowsKind === "params" ? setParams : setHeaders;

  function setRow(i, field, value) {
    setRowsState((rows) =>
      rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)),
    );
  }

  function addRow() {
    setRowsState((rows) => [...rows, { key: "", value: "" }]);
  }

  function removeRow(i) {
    setRowsState((rows) => rows.filter((_, j) => j !== i));
  }

  function formatBody() {
    try {
      setBody(JSON.stringify(JSON.parse(body), null, 2));
    } catch (e) {
      // leave as-is if it isn't valid JSON
    }
  }

  const bodyHint = useMemo(() => {
    if (!body.trim()) return { text: "", ok: true };
    try {
      JSON.parse(body);
      return { text: "valid JSON", ok: true };
    } catch (e) {
      return { text: "invalid JSON", ok: false };
    }
  }, [body]);

  function save() {
    setSaved((s) => [
      ...s,
      { method, url, params, headers, body, id: Date.now() },
    ]);
    setSidebar("saved");
  }

  function loadItem(item) {
    setMethod(item.method);
    setUrl(item.url);
    setParams(item.params);
    setHeaders(item.headers);
    setBody(item.body);
    setResp(null);
  }

  async function handleSend() {
    if (loading || !url.trim()) return;
    if (!onSend) {
      // TODO: pass an `onSend` prop to actually issue the request.
      console.warn("ApiClient: no onSend prop provided — nothing was sent.");
      return;
    }
    setLoading(true);
    const t0 = performance.now();
    const request = {
      method,
      url: buildUrlWithParams(url, params),
      headers: headers.reduce((acc, h) => {
        if (h.key.trim()) acc[h.key.trim()] = h.value;
        return acc;
      }, {}),
      body: !["GET", "HEAD"].includes(method) ? body : undefined,
    };
    try {
      const result = await onSend(request);
      setResp(result);
      setHistory((h) =>
        [
          {
            method,
            url,
            params,
            headers,
            body,
            status: result?.status,
            ms: result?.ms ?? Math.round(performance.now() - t0),
            id: Date.now(),
          },
          ...h,
        ].slice(0, 40),
      );
    } finally {
      setLoading(false);
    }
  }

  const list = sidebar === "saved" ? saved : history;

  let responseText = "";
  if (resp) {
    if (view === "headers") {
      responseText =
        (resp.headers || []).map((h) => h[0] + ": " + h[1]).join("\n") ||
        "(no headers)";
    } else if (view === "raw") {
      responseText = resp.text;
    } else {
      try {
        responseText = JSON.stringify(JSON.parse(resp.text), null, 2);
      } catch (e) {
        responseText = resp.text;
      }
    }
  }

  const statusOk = resp && resp.status >= 200 && resp.status < 300;

  return (
    <div className="rc-app" style={{ "--accent": accent }}>
      <Sidebar list={list} />
      <main className="rc-main">
        <RequestPanel save={save} />
        <div className="rc-tabs">
          {[
            {
              key: "params",
              label: "Params",
              count: params.filter((p) => p.key.trim()).length,
            },
            {
              key: "headers",
              label: "Headers",
              count: headers.filter((h) => h.key.trim()).length,
            },
            { key: "body", label: "Body", count: 0 },
          ].map((t) => (
            <button
              key={t.key}
              className={"rc-tab" + (tab === t.key ? " active" : "")}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count > 0 && <span className="rc-tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="rc-panel">
          {tab !== "body" && (
            <div className="rc-table">
              <div className="rc-table-head">
                <span>Key</span>
                <span>Value</span>
                <span></span>
              </div>
              {rowsState.map((row, i) => (
                <div className="rc-row" key={i}>
                  <input
                    className="rc-input"
                    value={row.key}
                    onChange={(e) => setRow(i, "key", e.target.value)}
                    placeholder="name"
                    spellCheck={false}
                  />
                  <input
                    className="rc-input"
                    value={row.value}
                    onChange={(e) => setRow(i, "value", e.target.value)}
                    placeholder="value"
                    spellCheck={false}
                  />
                  <button
                    className="rc-row-remove"
                    onClick={() => removeRow(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button className="rc-add-row" onClick={addRow}>
                + Add row
              </button>
            </div>
          )}

          {tab === "body" && (
            <div className="rc-body-panel">
              <div className="rc-body-head">
                <span className="rc-panel-label">JSON body</span>
                <span className={"rc-body-hint" + (bodyHint.ok ? "" : " bad")}>
                  {bodyHint.text}
                </span>
                <button className="rc-format-btn" onClick={formatBody}>
                  Format
                </button>
              </div>
              <textarea
                className="rc-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
                placeholder="{ }"
              />
            </div>
          )}
        </div>
        <ResponseBody resp={resp} />
      </main>
    </div>
  );
}
