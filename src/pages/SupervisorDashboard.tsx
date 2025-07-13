import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import ReportView from "../components/ReportView";
import { HistoryEntry, Category } from "../types";
import { API_BASE_URL } from "../config/api";
import Swal from "sweetalert2";

interface LogEntry {
  id: number;
  user_id: number;
  action_type: string;
  description: string;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

const SupervisorDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [categories, setCategories] = useState<Category>({});

  // Function to humanize action types
  const humanizeAction = (actionType: string): string => {
    const actionMap: { [key: string]: string } = {
      'login': 'Login',
      'logout': 'Logout',
      'add_item': 'Add Item',
      'delete_item': 'Delete Item',
      'reduce_stock': 'Reduce Stock',
      'increase_stock': 'Increase Stock',
      'update_item': 'Update Item',
      'clear_logs': 'Clear Logs'
    };
    return actionMap[actionType] || actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Function to get username by user_id
  const getUsernameById = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : `User ${userId}`;
  };

  // Function to download logs as CSV
  const handleDownloadLogs = () => {
    window.open(`${API_BASE_URL}/download_logs.php`, '_blank');
  };

  // Function to clear all logs
  const handleClearLogs = async () => {
    const result = await Swal.fire({
      title: 'Clear ALL Logs?',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>⚠️ This action cannot be undone.</strong></p>
          <br>
          <p>The system will:</p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>✅ Download all current logs to your device</li>
            <li>🗑️ Permanently delete all log records from the database</li>
          </ul>
          <br>
          <p>Type <strong>"CLEAR LOGS"</strong> below to confirm:</p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Type CLEAR LOGS to confirm',
      showCancelButton: true,
      confirmButtonText: 'Clear All Logs',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      allowEnterKey: false,
      focusConfirm: false,
      focusCancel: false,
      inputValidator: (value) => {
        if (value !== 'CLEAR LOGS') {
          return 'You must type "CLEAR LOGS" exactly to confirm!';
        }
        return null;
      },
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      // Mobile-responsive settings
      width: window.innerWidth < 640 ? '90vw' : '32rem',
      padding: window.innerWidth < 640 ? '1rem' : '1.5rem'
    });

    if (result.isConfirmed) {
      try {
        // Show loading spinner
        Swal.fire({
          title: 'Processing...',
          html: 'Downloading logs and clearing database...',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          width: window.innerWidth < 640 ? '90vw' : '24rem',
          padding: window.innerWidth < 640 ? '1rem' : '1.5rem',
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // First download the logs
        handleDownloadLogs();
        
        // Wait a moment for download to start, then clear logs
        setTimeout(async () => {
          // Get current user data
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;
          
          if (!user?.id) {
            Swal.fire({
              icon: 'error',
              title: 'Authentication Required',
              text: 'User authentication required for this action',
              confirmButtonColor: '#dc2626',
              width: window.innerWidth < 640 ? '90vw' : '24rem',
              padding: window.innerWidth < 640 ? '1rem' : '1.5rem'
            });
            return;
          }

          const response = await axios.post(`${API_BASE_URL}/clear_logs.php`, {
            user_id: user.id,
            confirm: true
          });

          if (response.data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Logs Cleared Successfully!',
              html: `
                <div style="text-align: center;">
                  <p>✅ Successfully cleared <strong>${response.data.deleted_count}</strong> log records</p>
                  <p>📥 Logs have been downloaded to your device</p>
                </div>
              `,
              confirmButtonColor: '#059669',
              width: window.innerWidth < 640 ? '90vw' : '28rem',
              padding: window.innerWidth < 640 ? '1rem' : '1.5rem'
            });
            
            // Refresh the logs display
            axios
              .get(`${API_BASE_URL}/logs.php`)
              .then((res) => setLogs(res.data))
              .catch((err) => console.error(err));
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed to Clear Logs',
              text: response.data.message,
              confirmButtonColor: '#dc2626',
              width: window.innerWidth < 640 ? '90vw' : '24rem',
              padding: window.innerWidth < 640 ? '1rem' : '1.5rem'
            });
          }
        }, 2000); // Wait 2 seconds for download to start
        
      } catch (error) {
        console.error('Error clearing logs:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error Occurred',
          text: 'An error occurred while clearing logs',
          confirmButtonColor: '#dc2626',
          width: window.innerWidth < 640 ? '90vw' : '24rem',
          padding: window.innerWidth < 640 ? '1rem' : '1.5rem'
        });
      }
    }
  };

  useEffect(() => {
    // Fetch logs
    axios
      .get(`${API_BASE_URL}/logs.php`)
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));

    // Fetch users
    axios
      .get(`${API_BASE_URL}/users.php`)
      .then((res) => {
        if (res.data.success) {
          setUsers(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load users:", err));

    // Fetch categories
    axios
      .get(`${API_BASE_URL}/categories.php`)
      .then((res) => {
        const json = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setCategories(json);
      })
      .catch((err) => console.error("Failed to load categories:", err));

    // Fetch history entries
    axios
      .get(`${API_BASE_URL}/items.php`)
      .then((res) => {
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setHistoryEntries(Array.isArray(data.history) ? data.history : []);
      })
      .catch((err) => console.error("Failed to load history entries:", err));
  }, []);

  return (
    <div className="h-screen w-screen bg-black bg-opacity-40 flex items-center justify-center p-1 sm:p-2">
      <div className="w-full h-full max-w-screen-xl bg-white bg-opacity-60 backdrop-blur-lg rounded-xl shadow-lg flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: "rgba(255, 255, 255, 0.45)",
            zIndex: 0,
            backdropFilter: "blur(8px)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 bg-white shadow rounded-lg rounded-tl-none rounded-tr-none flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Operator Logs</h2>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={handleDownloadLogs}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-1 sm:px-2 sm:py-1.5 rounded text-xs whitespace-nowrap transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={handleClearLogs}
                  className="bg-red-600 hover:bg-red-700 text-white px-1.5 py-1 sm:px-2 sm:py-1.5 rounded text-xs whitespace-nowrap transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-1.5 py-1 sm:px-2 sm:py-1.5 rounded text-xs whitespace-nowrap transition-colors"
                >
                  Report
                </button>
              </div>
            </div>

            {!showReport ? (
              <div className="flex-1 overflow-y-auto rounded border border-gray-300 min-h-0">
                {/* Mobile Card View */}
                <div className="sm:hidden">
                  {logs.map((log) => (
                    <div key={log.id} className="border-b border-gray-200 p-3 bg-white hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm text-gray-900">{getUsernameById(log.user_id)}</span>
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-blue-600 font-medium mb-1">{humanizeAction(log.action_type)}</div>
                      <div className="text-sm text-gray-700 mb-2">{log.description}</div>
                      <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No logs available
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <table className="hidden sm:table min-w-full table-auto border-collapse">
                  <thead className="bg-green-700 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left">Username</th>
                      <th className="px-4 py-2 text-left">Action</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2 font-medium">{getUsernameById(log.user_id)}</td>
                        <td className="px-4 py-2">{humanizeAction(log.action_type)}</td>
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