import React, { useEffect, useState, useRef } from "react";
import EditiorNavbar from "../components/EditorNavbar";
import Editor from "@monaco-editor/react";
import { MdLightMode, MdOutlineMonitor } from "react-icons/md";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { FiExternalLink, FiRefreshCw } from "react-icons/fi";
import { VscDebugConsole, VscFiles, VscCode } from "react-icons/vsc";
import { api_base_url } from "../helper";
import { useParams, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

// Console override injected before user code — sends all console calls to parent via postMessage
const CONSOLE_OVERRIDE = `<script>
(function() {
  var _methods = ['log', 'warn', 'error', 'info'];
  _methods.forEach(function(method) {
    var orig = console[method];
    console[method] = function() {
      if (orig) orig.apply(console, arguments);
      var args = Array.prototype.slice.call(arguments).map(function(a) {
        try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
        catch(e) { return String(a); }
      });
      window.parent.postMessage({ source: 'wc-iframe', type: 'console', method: method, args: args }, '*');
    };
  });
  window.addEventListener('error', function(e) {
    window.parent.postMessage({
      source: 'wc-iframe', type: 'console', method: 'error',
      args: [e.message + ' (line ' + e.lineno + ')']
    }, '*');
  });
})();
<\/script>`;

const LOG_STYLE = {
  log:   { text: "text-gray-200",   icon: "›",  bg: "",                     iconCls: "text-gray-500"   },
  info:  { text: "text-blue-300",   icon: "ℹ",  bg: "bg-blue-950/20",       iconCls: "text-blue-400"   },
  warn:  { text: "text-yellow-300", icon: "⚠",  bg: "bg-yellow-950/20",     iconCls: "text-yellow-400" },
  error: { text: "text-red-400",    icon: "✖",  bg: "bg-red-950/30",        iconCls: "text-red-500"    },
};

const EditorPage = () => {
  const [tab, setTab]               = useState("html");
  const [isLightMode, setIsLightMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [htmlCode, setHtmlCode]     = useState("<h1>Hello world</h1>");
  const [cssCode, setCssCode]       = useState("body { background-color: #f4f4f4; }");
  const [jsCode, setJsCode]         = useState("// some comment");
  const [data, setData]             = useState({});
  const [projects, setProjects]     = useState([]);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [rightPanel, setRightPanel] = useState("preview"); // "preview" | "console"
  const [unreadLogs, setUnreadLogs] = useState(0);

  const consoleEndRef  = useRef(null);
  const rightPanelRef  = useRef(rightPanel); // ref to avoid stale closure in message handler
  const { projectID }  = useParams();
  const navigate       = useNavigate();

  // Keep ref in sync with state
  useEffect(() => { rightPanelRef.current = rightPanel; }, [rightPanel]);

  // Reset unread badge when console panel is opened
  useEffect(() => { if (rightPanel === "console") setUnreadLogs(0); }, [rightPanel]);

  // Auto-scroll console to latest entry
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  // Listen for postMessage from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source !== "wc-iframe" || event.data?.type !== "console") return;
      setConsoleLogs((prev) => [
        ...prev,
        {
          method: event.data.method || "log",
          args: event.data.args || [],
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      if (rightPanelRef.current !== "console") {
        setUnreadLogs((prev) => prev + 1);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ── Editor helpers ──────────────────────────────────────────────────────────

  const changeTheme = () => {
    const editorNavbar = document.querySelector(".EditiorNavbar");
    if (isLightMode) {
      editorNavbar.style.background = "#141414";
      document.body.classList.remove("lightMode");
      setIsLightMode(false);
    } else {
      editorNavbar.style.background = "#f4f4f4";
      document.body.classList.add("lightMode");
      setIsLightMode(true);
    }
  };

  const run = () => {
    const css    = `<style>${cssCode}</style>`;
    const js     = `<script>${jsCode}<\/script>`;
    const iframe = document.getElementById("iframe");
    if (iframe) {
      iframe.srcdoc = CONSOLE_OVERRIDE + htmlCode + css + js;
    }
  };

  useEffect(() => {
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [htmlCode, cssCode, jsCode]);

  // ── Data fetching ───────────────────────────────────────────────────────────

  // Fetch current project code
  useEffect(() => {
    fetch(api_base_url + "/api/projects/get", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        projId: projectID,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setHtmlCode(data.project.htmlCode);
        setCssCode(data.project.cssCode);
        setJsCode(data.project.jsCode);
        setData(data.project);
      });
  }, [projectID]);

  // Fetch all projects for sidebar list
  useEffect(() => {
    fetch(api_base_url + "/api/projects/all", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProjects(data.projects);
      });
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────

  const saveProject = () => {
    fetch(api_base_url + "/api/projects/update", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        projId: projectID,
        htmlCode,
        cssCode,
        jsCode,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Project saved!");
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch(() => toast.error("Failed to save project. Please try again."));
  };

  // Ctrl+S shortcut
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [projectID, htmlCode, cssCode, jsCode]);

  // ── Download ────────────────────────────────────────────────────────────────

  const handleDownload = () => {
    const zip = new JSZip();
    zip.file("index.html", htmlCode);
    zip.file("style.css", cssCode);
    zip.file("script.js", jsCode);
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${data.title}.zip`);
    });
  };

  // ── Open preview in new tab ─────────────────────────────────────────────────

  const openInNewTab = () => {
    const css  = `<style>${cssCode}</style>`;
    const js   = `<script>${jsCode}<\/script>`;
    const blob = new Blob([htmlCode + css + js], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ── onChange handler for single Editor ─────────────────────────────────────

  const handleEditorChange = (value) => {
    if (tab === "html") setHtmlCode(value || "");
    else if (tab === "css") setCssCode(value || "");
    else setJsCode(value || "");
  };

  const editorValue    = tab === "html" ? htmlCode : tab === "css" ? cssCode : jsCode;
  const editorLanguage = tab === "js" ? "javascript" : tab;
  const editorHeight   = window.innerWidth < 768 ? "50vh" : "calc(100vh - 130px)";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <EditiorNavbar title={data.title} handledownload={handleDownload} saveProject={saveProject} />

      <div className="flex" style={{ height: "calc(100vh - 80px)" }}>

        {/* ── SIDEBAR: Project List ── */}
        <div
          className={`flex-shrink-0 flex-col bg-[#111] border-r border-[#1f1f1f] transition-all duration-300 overflow-hidden hidden md:flex ${
            isSidebarOpen ? "w-[220px]" : "w-0"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center gap-2 px-3 h-[50px] border-b border-[#1f1f1f] flex-shrink-0">
            <VscFiles className="text-gray-500 text-[14px]" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Projects
            </span>
          </div>

          {/* Project list */}
          <div className="flex-1 overflow-y-auto py-1">
            {projects.length === 0 ? (
              <p className="text-xs text-gray-600 text-center mt-6 px-3">No projects yet</p>
            ) : (
              projects.map((proj) => {
                const isActive = proj._id === projectID;
                return (
                  <div
                    key={proj._id}
                    onClick={() => navigate(`/editior/${proj._id}`)}
                    title={proj.title}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-[13px] transition-colors group ${
                      isActive
                        ? "bg-[#2764c0]/15 border-l-2 border-[#2764c0] text-white"
                        : "border-l-2 border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                  >
                    <VscCode
                      className={`flex-shrink-0 text-[14px] ${
                        isActive ? "text-[#2764c0]" : "text-gray-600 group-hover:text-gray-400"
                      }`}
                    />
                    <span className="truncate">{proj.title}</span>
                    {isActive && (
                      <span className="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#2764c0]" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Editor + Preview wrapper ── */}
        <div className={`flex flex-col md:flex-row flex-1 min-w-0`}>

        {/* ── LEFT: Code Editor ── */}
        <div className={`flex flex-col ${isExpanded ? "w-full" : "w-full md:w-1/2"}`}>

          {/* Tab bar */}
          <div className="tabs flex items-center justify-between gap-2 w-full bg-[#1A1919] h-[50px] px-4 sm:px-6 flex-shrink-0">
            <div className="flex items-center gap-1">
              {/* Sidebar toggle */}
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                title={isSidebarOpen ? "Hide project list" : "Show project list"}
                className={`hidden md:flex items-center justify-center w-7 h-7 rounded transition-colors mr-1 ${
                  isSidebarOpen ? "text-[#2764c0]" : "text-gray-500 hover:text-white"
                }`}
              >
                <VscFiles className="text-[17px]" />
              </button>
              {[
                { id: "html", label: "HTML" },
                { id: "css",  label: "CSS"  },
                { id: "js",   label: "JS"   },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`tab cursor-pointer px-3 py-1 text-[14px] rounded transition-colors ${
                    tab === id
                      ? "bg-[#2764c0] text-white"
                      : "bg-[#1E1E1E] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* <button
                className="text-[20px] cursor-pointer text-gray-400 hover:text-white transition-colors"
                onClick={changeTheme}
                title="Toggle light/dark theme"
              >
                <MdLightMode />
              </button> */}
              <button
                className="text-[20px] cursor-pointer text-gray-400 hover:text-white transition-colors"
                title={isExpanded ? "Collapse editor" : "Expand editor"}
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                <AiOutlineExpandAlt />
              </button>
            </div>
          </div>

          {/* Monaco Editor — single instance, path keeps separate undo histories */}
          <Editor
            path={tab}
            onChange={handleEditorChange}
            height={editorHeight}
            theme={isLightMode ? "vs-light" : "vs-dark"}
            language={editorLanguage}
            value={editorValue}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
            }}
          />
        </div>

        {/* ── RIGHT: Preview / Console ── */}
        {!isExpanded && (
          <div className="flex flex-col w-full md:w-1/2 border-l border-[#1a1a1a]">

            {/* Right panel header */}
            <div className="flex items-center justify-between bg-[#1A1919] h-[50px] px-4 flex-shrink-0 border-b border-[#0d0d0d]">
              <div className="flex items-center gap-1">
                {/* Preview button */}
                <button
                  onClick={() => setRightPanel("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-all ${
                    rightPanel === "preview"
                      ? "bg-[#2764c0] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#252525]"
                  }`}
                >
                  <MdOutlineMonitor className="text-[15px]" />
                  Preview
                </button>

                {/* Console button with unread badge */}
                <button
                  onClick={() => setRightPanel("console")}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-all ${
                    rightPanel === "console"
                      ? "bg-[#2764c0] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#252525]"
                  }`}
                >
                  <VscDebugConsole className="text-[15px]" />
                  Console
                  {unreadLogs > 0 && rightPanel !== "console" && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                      {unreadLogs > 9 ? "9+" : unreadLogs}
                    </span>
                  )}
                </button>
              </div>

              {/* Right-side actions: Clear (console) + Reload + Open in new tab */}
              <div className="flex items-center gap-1">
                {rightPanel === "console" && (
                  <button
                    onClick={() => setConsoleLogs([])}
                    className="text-[12px] text-gray-500 hover:text-red-400 px-2 py-1 rounded hover:bg-[#252525] transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={run}
                  title="Reload preview"
                  className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-green-400 px-2 py-1 rounded hover:bg-[#252525] transition-colors"
                >
                  <FiRefreshCw className="text-[13px]" />
                  <span className="hidden sm:inline">Reload</span>
                </button>
                <button
                  onClick={openInNewTab}
                  title="Open preview in new tab"
                  className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-[#2764c0] px-2 py-1 rounded hover:bg-[#252525] transition-colors"
                >
                  <FiExternalLink className="text-[14px]" />
                  <span className="hidden sm:inline">Open</span>
                </button>
              </div>
            </div>

            {/* Preview iframe — keep mounted but hide with CSS so it doesn't reload */}
            <iframe
              id="iframe"
              title="output"
              className="w-full flex-1 bg-white text-black"
              style={{
                display: rightPanel === "preview" ? "block" : "none",
                minHeight: 0,
              }}
            />

            {/* Console panel */}
            {rightPanel === "console" && (
              <div
                className="flex-1 overflow-y-auto bg-[#0d0d0d] font-mono"
                style={{ minHeight: 0 }}
              >
                {consoleLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2 select-none">
                    <VscDebugConsole className="text-3xl" />
                    <span className="text-sm">No console output yet</span>
                    <span className="text-xs text-gray-700">
                      Use <code className="bg-[#1a1a1a] px-1 rounded">console.log()</code> in your JS
                    </span>
                  </div>
                ) : (
                  <div>
                    {consoleLogs.map((log, i) => {
                      const s = LOG_STYLE[log.method] || LOG_STYLE.log;
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-2 px-3 py-1.5 border-b border-[#1a1a1a] text-[13px] ${s.text} ${s.bg}`}
                        >
                          <span className={`${s.iconCls} flex-shrink-0 mt-0.5 w-4 text-center font-bold`}>
                            {s.icon}
                          </span>
                          <span className="flex-1 break-all whitespace-pre-wrap leading-relaxed">
                            {log.args.join(" ")}
                          </span>
                          <span className="text-[10px] text-gray-700 flex-shrink-0 mt-1">
                            {log.timestamp}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={consoleEndRef} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div> {/* end editor+preview wrapper */}
      </div>
    </>
  );
};

export default EditorPage;
