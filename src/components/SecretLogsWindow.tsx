import React, { useState, useEffect, useRef } from "react";
import { X, Trash2, RefreshCw, Search, Filter, Download } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: number;
  date: string;
  application: "SONGS" | "BIBLE" | "EVPRESENTER" | "SYSTEM";
  category:
    | "INFO"
    | "WARNING"
    | "ERROR"
    | "ACTION"
    | "PROJECTION"
    | "FILE_OPERATION";
  message: string;
  details?: string;
  age: string;
}

interface SecretLogsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretLogsWindow: React.FC<SecretLogsWindowProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await window.api.getSecretLogs();
      if (result.success && result.logs) {
        setLogs(result.logs);
        setFilteredLogs(result.logs);
      } else {
        setLogs([]);
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all logs? This cannot be undone."
      )
    ) {
      try {
        const result = await window.api.clearSecretLogs();
        if (result.success) {
          setLogs([]);
          setFilteredLogs([]);
          alert("All logs cleared successfully.");
        } else {
          alert(`Failed to clear logs: ${result.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Failed to clear logs:", error);
        alert("Failed to clear logs. Please try again.");
      }
    }
  };

  const exportLogs = async () => {
    try {
      const result = await window.api.exportSecretLogs();
      if (result.success && result.filePath) {
        alert(`Logs exported successfully to: ${result.filePath}`);
      } else {
        alert(`Failed to export logs: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to export logs:", error);
      alert("Failed to export logs. Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedApp !== "ALL") {
      filtered = filtered.filter((log) => log.application === selectedApp);
    }

    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((log) => log.category === selectedCategory);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedApp, selectedCategory]);

  const getAppColor = (app: string) => {
    switch (app) {
      case "SONGS":
        return "text-green-400";
      case "BIBLE":
        return "text-blue-400";
      case "EVPRESENTER":
        return "text-purple-400";
      case "SYSTEM":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ERROR":
        return "text-red-400";
      case "WARNING":
        return "text-orange-400";
      case "ACTION":
        return "text-cyan-400";
      case "PROJECTION":
        return "text-pink-400";
      case "FILE_OPERATION":
        return "text-indigo-400";
      case "INFO":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-11/12 h-5/6 bg-black border border-green-500 rounded-lg shadow-2xl flex flex-col">
        {/* Header - Git Bash style */}
        <div className="flex items-center justify-between p-4 border-b border-green-500 bg-ltgray">
          <div className="flex items-center space-x-4">
            <h2 className="text-green-400 font-mono text-lg">
              🔒 SECRET SYSTEM LOGS - ADMIN PANEL
            </h2>
            <div className="text-gray-400 text-sm font-mono">
              {filteredLogs.length} of {logs.length} entries
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div
              onClick={fetchLogs}
            //   disabled={loading}
              className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </div>
            <div
              onClick={exportLogs}
              className="p-2 text-blue-400 hover:text-blue-300"
              title="Export logs"
            >
              <Download className="h-4 w-4" />
            </div>
            <div
              onClick={clearLogs}
              className="p-2 text-red-400 hover:text-red-300"
              title="Clear all logs"
            >
              <Trash2 className="h-4 w-4" />
            </div>
            <div
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700 bg-ltgray flex flex-wrap items-center space-x-4 space-y-2">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black text-green-400 border border-gray-600 rounded px-3 py-1 text-sm font-mono focus:border-green-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="bg-black text-green-400 border border-gray-600 rounded px-3 py-1 text-sm font-mono focus:border-green-500 focus:outline-none"
          >
            <option value="ALL">All Apps</option>
            <option value="SONGS">Songs</option>
            <option value="BIBLE">Bible</option>
            <option value="EVPRESENTER">EvPresenter</option>
            <option value="SYSTEM">System</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-black text-green-400 border border-gray-600 rounded px-3 py-1 text-sm font-mono focus:border-green-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="ACTION">Actions</option>
            <option value="PROJECTION">Projections</option>
            <option value="FILE_OPERATION">File Ops</option>
            <option value="ERROR">Errors</option>
            <option value="WARNING">Warnings</option>
            <option value="INFO">Info</option>
          </select>
        </div>

        {/* Logs Display */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto thin-scrollbar *: bg-black p-4 font-mono text-sm"
          style={{
            // add background color to the scrollbar
            scrollbarWidth: "thin",
            scrollbarColor: "#4a4a4a transparent",
          }}
          >
            {loading ? (
              <div className="text-green-400 text-center">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center">No logs found</div>
            ) : (
              <div className="space-y-1 ">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="cursor-pointer hover:bg-ltgray p-2 rounded border-l-2 border-gray-700 hover:border-green-500 transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-500 text-xs w-20 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`w-16 flex-shrink-0 text-xs ${getAppColor(
                          log.application
                        )}`}
                      >
                        [{log.application}]
                      </span>
                      <span
                        className={`w-16 flex-shrink-0 text-xs ${getCategoryColor(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                      <span className="text-green-300 flex-1">
                        {log.message}
                      </span>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        {log.age}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>

          {/* Log Details Panel */}
          {selectedLog && (
            <div className="w-1/3 border-l border-gray-700 bg-ltgray p-4 overflow-y-auto thin-scrollbar" 
            style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4a4a4a transparent",
            }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-green-400 font-semibold">Log Details</h3>
                  <div
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span>
                    <span className="text-green-300 ml-2 font-mono">
                      {selectedLog.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="text-green-300 ml-2">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Application:</span>
                    <span
                      className={`ml-2 ${getAppColor(selectedLog.application)}`}
                    >
                      {selectedLog.application}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span
                      className={`ml-2 ${getCategoryColor(
                        selectedLog.category
                      )}`}
                    >
                      {selectedLog.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Age:</span>
                    <span className="text-green-300 ml-2">
                      {selectedLog.age}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Message:</span>
                    <div className="text-green-300 mt-1 p-2 bg-black rounded border border-gray-700 font-mono text-xs whitespace-pre-wrap">
                      {selectedLog.message}
                    </div>
                  </div>
                  {selectedLog.details && (
                    <div>
                      <span className="text-gray-400">Details:</span>
                      <div className="text-cyan-300 mt-1 p-2 bg-black rounded border border-gray-700 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {selectedLog.details}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-700 bg-ltgray text-xs text-gray-500 font-mono text-center">
          🔒 Confidential System Logs - Authorized Personnel Only |
          Auto-cleanup: 3 weeks | Press Ctrl+` or Ctrl+Shift+L to toggle
        </div>
      </div>
    </div>
  );
};
