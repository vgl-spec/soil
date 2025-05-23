import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

interface LogEntry {
  id: number;
  user_id: number;
  action_type: string;
  description: string;
  timestamp: string;
}

const SupervisorDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showReportView, setShowReportView] = useState<boolean>(false);

  useEffect(() => {
    axios.get("https://soil-3tik.onrender.com/API/logs.php")
      .then(res => setLogs(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-4xl bg-white rounded-lg relative">
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.45)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 max-w-6xl mx-auto bg-white shadow rounded-lg rounded-tl-none rounded-tr-none flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Operator Logs</h2>
              <button
                className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700"
                onClick={() => setShowReportView(!showReportView)}
              >
                {showReportView ? "Back to Logs" : "Generate Report"}
              </button>
            </div>

            {!showReportView ? (
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
                    {logs.map(log => (
                      <tr key={log.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2">{log.user_id}</td>
                        <td className="px-4 py-2 capitalize">{log.action_type}</td>
                        <td className="px-4 py-2">{log.description}</td>
                        <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-500 py-4">No logs available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-6 border rounded shadow text-sm">
                <h3 className="text-lg font-bold mb-4">Report Preview</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {logs.map(log => (
                    <li key={log.id}>
                      <strong>User {log.user_id}</strong> {log.action_type} — {log.description} at {new Date(log.timestamp).toLocaleString()}
                    </li>
                  ))}
                  {logs.length === 0 && <li>No log data available for report.</li>}
                </ul>
              </div>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
