import { useMemo, useState } from "react";
import "./ApiClient.css";
import Sidebar from "./components/sidebar";
import ResponseBody from "./components/ResponseBody";
import RequestPanel from "./components/RequestPanel";
import { SEND_REQUEST } from "./api/api";
import { ENDPOINT_REGX } from "./constans";
import toast, { Toaster } from "react-hot-toast";

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

export default function ApiClient({ accent = "#17796A", onSend }) {
  const [requestMethod, setRequestMethod] = useState("GET");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestParams, setRequestParams] = useState([{ key: "", value: "" }]);
  const [requestHeaders, setRequestHeaders] = useState([
    { key: "Accept", value: "application/json" },
  ]);
  const [requestBody, setRequestBody] = useState("");

  const [tab, setTab] = useState("params"); // params | headers | body
  const [sidebar, setSidebar] = useState("saved"); // saved | history

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  const [urlError, setUrlError] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const rowsKind = tab === "params" ? "params" : "headers";
  const rowsState = rowsKind === "params" ? requestParams : requestHeaders;
  const setRowsState =
    rowsKind === "params" ? setRequestParams : setRequestHeaders;

  async function changeHTTPmethod(value) {
    setRequestMethod(value);
  }
  function checkApiRegex() {
    const valid = ENDPOINT_REGX.test(requestUrl);
    setUrlError(!valid);
    return valid;
  }

  function onUrlComplete() {
    // if (requestUrl.includes("?")) {
    //   if (requestParams[0]?.key == "") {
    //     setRequestParams([]);
    //   }
    //   let url_param = requestUrl.split("?")[1];
    //   let all_param = url_param.split("&");
    //   for (let p of all_param) {
    //     let key = p.split("=")[0];
    //     let value = p.split("=")[1];
    //     setRequestParams([...requestParams, { key: key, value: value }]);
    //   }
    // }
  }

  function changeUrl(value) {
    setRequestUrl(value);
    if (urlError) setUrlError(false);

    const queryIndex = value.indexOf("?");
    if (queryIndex === -1) {
      setRequestParams([{ key: "", value: "" }]);
      return;
    }
    const queryString = value.slice(queryIndex + 1);

    if (!queryString) {
      setRequestParams([{ key: "", value: "" }]);
      return;
    }

    const params = queryString.split("&").map((pair) => {
      const [key, value = ""] = pair.split("=");
      return { key, value };
    });

    setRequestParams(params);
  }

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
      setRequestBody(JSON.stringify(JSON.parse(requestBody), null, 2));
    } catch (e) {
      // leave as-is if it isn't valid JSON
    }
  }

  // const bodyHint = useMemo(() => {
  //   if (!requestBody.trim()) return { text: "", ok: true };
  //   try {
  //     JSON.parse(requestBody);
  //     return { text: "valid JSON", ok: true };
  //   } catch (e) {
  //     return { text: "invalid JSON", ok: false };
  //   }
  // }, [requestBody]);

  function save() {
    setSaved((s) => [
      ...s,
      {
        method: requestMethod,
        url: requestUrl,
        params: requestParams,
        headers: requestHeaders,
        body: requestBody,
        id: Date.now(),
      },
    ]);
    setSidebar("saved");
  }

  // function loadItem(item) {
  //   setRequestMethod(item.method);
  //   setRequestUrl(item.url);
  //   setRequestParams(item.params);
  //   setRequestHeaders(item.headers);
  //   setRequestBody(item.body);
  //   setResp(null);
  // }

  async function handleSend() {
    if (true) {
      let request_body = {
        requestMethod: requestMethod,
        requestUrl: requestUrl,
        requestBody: requestBody,
        requestParams: requestParams,
        requestHeaders: requestHeaders,
      };
      const response = await fetch(SEND_REQUEST(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request_body),
      });
      if (response?.ok) console.log(response.json());

      // save();
    } else {
      toast.error("Enter a proper URL");
      setShakeTrigger((n) => n + 1);
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
        <RequestPanel
          save={save}
          method={requestMethod}
          onChange={changeHTTPmethod}
          onChangeUrl={changeUrl}
          handleSend={handleSend}
          urlError={urlError}
          shakeTrigger={shakeTrigger}
          onCompleteTyping={onUrlComplete}
        />
        <div className="rc-tabs">
          {[
            {
              key: "params",
              label: "Params",
              count: requestParams.filter((p) => p.key.trim()).length,
            },
            {
              key: "headers",
              label: "Headers",
              count: requestHeaders.filter((h) => h.key.trim()).length,
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
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
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
