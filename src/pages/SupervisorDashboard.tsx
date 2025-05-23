import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import ReportView from "../components/ReportView";
import { HistoryEntry, Category } from "../types";

interface LogEntry {
  id: number;
  user_id: number;
  action_type: string;
  description: string;
  timestamp: string;
}

const SupervisorDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [categories, setCategories] = useState<Category>({});

  useEffect(() => {
    axios
      .get("https://soil-3tik.onrender.com/API/logs.php")
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));

    axios
      .get("https://soil-3tik.onrender.com/API/categories.php")
      .then((res) => {
        const json = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setCategories(json);
      })
      .catch((err) => console.error("Failed to load categories:", err));

    axios
      .get("https://soil-3tik.onrender.com/API/items.php")
      .then((res) => {
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setHistoryEntries(Array.isArray(data.history) ? data.history : []);
      })
      .catch((err) => console.error("Failed to load history entries:", err));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-4xl bg-white rounded-lg relative">
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: "rgba(255, 255, 255, 0.45)",
            zIndex: 0,
            backdropFilter: "blur(8px)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 max-w-6xl mx-auto bg-white shadow rounded-lg rounded-tl-none rounded-tr-none flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Operator Logs</h2>
              <button
                onClick={() => setShowReport(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Generate Report
              </button>
            </div>

            {!showReport ? (
              <div className="flex-1 overflow-y-auto max-h-[70vh] rounded border border-gray-300">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-green-700 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left">User ID</th>
                      <th className="px-4 py-2 text-left">Action</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2">{log.user_id}</td>
                        <td className="px-4 py-2 capitalize">{log.action_type}</td>
                        <td className="px-4 py-2">{log.description}</td>
                        <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-500 py-4">
                          No logs available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <ReportView
                historyEntries={historyEntries}
                categories={categories}
                onClose={() => setShowReport(false)}
              />
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;