import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReportView from "../components/ReportView";
import AnalyticsReportView from "../components/AnalyticsReportView";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { HistoryEntry, Category } from "../types";
import Swal from "sweetalert2";
import { showToast } from "../utils/hotToast";

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
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [categories, setCategories] = useState<Category>({});
  const [currentView, setCurrentView] = useState<'main' | 'accounts' | 'analytics' | 'addOperator' | 'changePassword' | 'report' | 'analyticsReport'>('main');

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

  // Function to add new operator
  const handleAddOperator = () => {
    setCurrentView('addOperator');
  };

  // Function to delete accounts
  const handleDeleteAccounts = async () => {
    // Get list of users for deletion selection
    const userOptions = users
      .filter(user => user.role !== 'supervisor') // Don't allow deletion of supervisors
      .map(user => ({
        value: user.id.toString(),
        text: `${user.username} (${user.role})`
      }));

    if (userOptions.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Accounts to Delete',
        text: 'There are no user accounts available for deletion.',
        confirmButtonColor: '#059669'
      });
      return;
    }

    const { value: selectedUserId } = await Swal.fire({
      title: 'Select Account to Delete',
      input: 'select',
      inputOptions: userOptions.reduce((acc, option) => {
        acc[option.value] = option.text;
        return acc;
      }, {} as Record<string, string>),
      inputPlaceholder: 'Choose an account',
      showCancelButton: true,
      confirmButtonText: 'Delete Account',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to select an account!';
        }
        return null;
      }
    });

    if (selectedUserId) {
      const selectedUser = users.find(u => u.id === parseInt(selectedUserId));
      if (selectedUser) {
        const confirmResult = await Swal.fire({
          title: 'Confirm Account Deletion',
          html: `Are you sure you want to delete the account:<br><strong>${selectedUser.username}</strong> (${selectedUser.role})?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Delete',
          confirmButtonColor: '#dc2626',
          cancelButtonText: 'Cancel'
        });

        if (confirmResult.isConfirmed) {
          try {
            const response = await axios.delete(`${API_BASE_URL}/delete_user.php`, {
              data: { user_id: selectedUserId }
            });

            if (response.data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Account Deleted',
                text: `Account "${selectedUser.username}" has been successfully deleted.`,
                confirmButtonColor: '#059669'
              });
              // Refresh users list
              const usersResponse = await axios.get(`${API_BASE_URL}/users.php`);
              if (usersResponse.data.success) {
                setUsers(usersResponse.data.data);
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Deletion Failed',
                text: response.data.message || 'Failed to delete account.',
                confirmButtonColor: '#dc2626'
              });
            }
          } catch (error) {
            console.error('Error deleting user:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred while deleting the account.',
              confirmButtonColor: '#dc2626'
            });
          }
        }
      }
    }
  };

  // Function to view account details
  const handleViewAccounts = () => {
    setCurrentView('accounts');
  };

  // Function to view website analytics
  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  // Function to change password
  const handleChangePassword = () => {
    setCurrentView('changePassword');
  };

  // Function to handle menu actions from header
  const handleMenuAction = (action: 'addOperator' | 'deleteAccounts' | 'accounts' | 'analytics' | 'changePassword') => {
    switch (action) {
      case 'addOperator':
        handleAddOperator();
        break;
      case 'deleteAccounts':
        handleDeleteAccounts();
        break;
      case 'accounts':
        handleViewAccounts();
        break;
      case 'analytics':
        handleViewAnalytics();
        break;
      case 'changePassword':
        handleChangePassword();
        break;
    }
  };

  // Function to download logs
  const handleDownloadLogs = async () => {
    const loadingToast = showToast.loading('Downloading logs...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/download_logs.php`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast.dismiss(loadingToast);
      showToast.success('Download Complete', 'Activity logs downloaded successfully');
    } catch (error) {
      console.error('Error downloading logs:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Download Failed', 'Failed to download activity logs');
    }
  };

  // Function to clear logs
  const handleClearLogs = async () => {
    // First, download logs before clearing
    const downloadResult = await Swal.fire({
      title: 'Download Logs First',
      text: 'Before clearing logs, would you like to download them as backup?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Download First',
      confirmButtonColor: '#059669',
      cancelButtonText: 'Skip Download',
      cancelButtonColor: '#6b7280'
    });

    if (downloadResult.isConfirmed) {
      try {
        const response = await axios.get(`${API_BASE_URL}/download_logs.php`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activity_logs_backup_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        await Swal.fire({
          icon: 'success',
          title: 'Download Complete',
          text: 'Logs have been downloaded as backup.',
          confirmButtonColor: '#059669',
          timer: 2000
        });
      } catch (error) {
        console.error('Error downloading logs:', error);
        const proceedResult = await Swal.fire({
          icon: 'error',
          title: 'Download Failed',
          text: 'Failed to download logs. Do you still want to proceed with clearing?',
          showCancelButton: true,
          confirmButtonText: 'Proceed Anyway',
          confirmButtonColor: '#dc2626',
          cancelButtonText: 'Cancel'
        });
        
        if (!proceedResult.isConfirmed) {
          return;
        }
      }
    }

    // Require typing "CLEAR LOGS" for confirmation
    const { value: confirmText } = await Swal.fire({
      title: 'Type "CLEAR LOGS" to Confirm',
      html: 'This will permanently delete <strong>ALL</strong> activity logs.<br/>Type <strong>"CLEAR LOGS"</strong> to confirm:',
      input: 'text',
      inputPlaceholder: 'Type: CLEAR LOGS',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clear All Logs',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value || value.trim().toUpperCase() !== 'CLEAR LOGS') {
          return 'You must type "CLEAR LOGS" exactly to confirm!';
        }
        return null;
      }
    });

    if (confirmText && confirmText.trim().toUpperCase() === 'CLEAR LOGS') {
      try {
        // Get user ID from localStorage
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;

        if (!user?.id) {
          Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: 'User session not found. Please log in again.',
            confirmButtonColor: '#dc2626'
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
            title: 'Logs Cleared',
            text: `All activity logs have been cleared successfully. ${response.data.deleted_count || ''} records deleted.`,
            confirmButtonColor: '#059669'
          });
          // Refresh logs
          setLogs([]);
          
          // Fetch fresh logs to show the new clear_logs entry
          axios
            .get(`${API_BASE_URL}/logs.php`)
            .then((res) => setLogs(res.data))
            .catch((err) => console.error(err));
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Clear Failed',
            text: response.data.message || 'Failed to clear logs.',
            confirmButtonColor: '#dc2626'
          });
        }
      } catch (error) {
        console.error('Error clearing logs:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while clearing logs.',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  // Function to generate report
  const handleGenerateReport = () => {
    setCurrentView('report');
  };

  // Function to generate analytics report
  const handleGenerateAnalyticsReport = () => {
    setCurrentView('analyticsReport');
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

    // Fetch categories for report view
    axios
      .get(`${API_BASE_URL}/categories.php`)
      .then((res) => {
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setCategories(data);
      })
      .catch((err) => console.error("Failed to load categories:", err));

    // Fetch items/history for report view
    axios
      .get(`${API_BASE_URL}/items.php`)
      .then((res) => {
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        if (data.history && Array.isArray(data.history)) {
          setHistoryEntries(data.history);
        }
      })
      .catch((err) => console.error("Failed to load history:", err));
  }, []);

  return (
    <div className="h-screen w-screen bg-black bg-opacity-40 flex items-center justify-center p-0">
      <div className="w-full h-full bg-white bg-opacity-60 backdrop-blur-lg flex flex-col overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(255, 255, 255, 0.45)",
            zIndex: 0,
            backdropFilter: "blur(8px)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col h-full">
          <Header isSupervisor={true} onMenuAction={handleMenuAction} />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 bg-white bg-opacity-80 backdrop-blur-sm shadow flex flex-col min-h-0 overflow-hidden">
            {currentView === 'main' && (
              <>
                <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#8a9b6e]">Supervisor Dashboard</h2>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={handleDownloadLogs}
                      className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap shadow-md hover:shadow-lg"
                    >
                      <span className="hidden sm:inline">Download Logs</span>
                      <span className="sm:hidden">Download</span>
                    </button>
                    <button
                      onClick={handleClearLogs}
                      className="bg-[#b85c57] hover:bg-[#a54c47] text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap shadow-md hover:shadow-lg"
                    >
                      <span className="hidden sm:inline">Clear Logs</span>
                      <span className="sm:hidden">Clear Logs</span>
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap shadow-md hover:shadow-lg"
                    >
                      <span className="hidden sm:inline">Inventory Report</span>
                      <span className="sm:hidden">Report</span>
                    </button>
                  </div>
                </div>

                {/* Activity Logs */}
                <div className="flex-1 flex flex-col rounded border border-gray-300 min-h-0">
                  <div className="p-4 bg-gray-50 border-b">
                    <h3 className="font-semibold text-gray-800">Activity Logs</h3>
                    <p className="text-sm text-gray-600">All user activities ({logs.length} total)</p>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="sm:hidden flex-1 overflow-y-auto p-2">
                    {logs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-3 mb-3 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-900 truncate pr-2">{getUsernameById(log.user_id)}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-blue-600 font-medium mb-1">{humanizeAction(log.action_type)}</div>
                        <div className="text-sm text-gray-700 mb-2 break-words">{log.description}</div>
                        <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        No activity logs found
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View with Fixed Header */}
                  <div className="hidden sm:flex flex-col flex-1 min-h-0">
                    {/* Fixed Header */}
                    <div className="bg-[#8a9b6e] text-white">
                      <table className="w-full table-fixed">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left w-1/4">Username</th>
                            <th className="px-4 py-2 text-left w-1/4">Action</th>
                            <th className="px-4 py-2 text-left w-1/4">Description</th>
                            <th className="px-4 py-2 text-left w-1/4">Timestamp</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    
                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto bg-white">
                      <table className="w-full table-fixed">
                        <tbody>
                          {logs.map((log) => (
                            <tr key={log.id} className="border-b hover:bg-gray-100">
                              <td className="px-4 py-2 font-medium w-1/4">{getUsernameById(log.user_id)}</td>
                              <td className="px-4 py-2 w-1/4">{humanizeAction(log.action_type)}</td>
                              <td className="px-4 py-2 w-1/4">{log.description}</td>
                              <td className="px-4 py-2 w-1/4">{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                          ))}
                          {logs.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center text-gray-500 py-4">
                                No activity logs found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentView === 'accounts' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h2 className="text-lg sm:text-xl font-bold">Account Management</h2>
                  <button
                    onClick={() => setCurrentView('main')}
                    className="bg-[#b85c57] hover:bg-[#a54c47] text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm self-start sm:self-auto shadow-md hover:shadow-lg"
                  >
                    ← Back
                  </button>
                </div>
                
                {/* Mobile Card View */}
                <div className="sm:hidden flex-1 overflow-y-auto p-2 space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-sm text-gray-500">ID: {user.id}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium self-start ${
                            user.role === 'supervisor' ? 'bg-red-100 text-red-800' :
                            user.role === 'operator' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="border-b border-gray-100 pb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Username</span>
                          <div className="text-sm text-gray-900 font-medium mt-1 break-words">{user.username}</div>
                        </div>
                        
                        <div className="border-b border-gray-100 pb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
                          <div className="text-sm text-gray-900 mt-1 break-words">{(user as any).email || 'N/A'}</div>
                        </div>
                        
                        <div className="border-b border-gray-100 pb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</span>
                          <div className="text-sm text-gray-900 mt-1 break-words">{(user as any).contact || 'N/A'}</div>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subdivision</span>
                          <div className="text-sm text-gray-900 mt-1 break-words">{(user as any).subdivision || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No user accounts found
                    </div>
                  )}
                </div>

                {/* Desktop Table View with Fixed Header */}
                <div className="hidden sm:flex flex-1 flex-col rounded border border-gray-300 bg-white min-h-0">
                  {/* Fixed Header */}
                  <div className="bg-[#8a9b6e] text-white">
                    <table className="w-full table-fixed">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left w-16">ID</th>
                          <th className="px-4 py-3 text-left w-1/5">Username</th>
                          <th className="px-4 py-3 text-left w-1/5">Email</th>
                          <th className="px-4 py-3 text-left w-20">Role</th>
                          <th className="px-4 py-3 text-left w-1/5">Contact</th>
                          <th className="px-4 py-3 text-left w-1/5">Subdivision</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  
                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full table-fixed">
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 w-16">{user.id}</td>
                            <td className="px-4 py-3 font-medium w-1/5">{user.username}</td>
                            <td className="px-4 py-3 w-1/5">{(user as any).email || 'N/A'}</td>
                            <td className="px-4 py-3 w-20">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === 'supervisor' ? 'bg-red-100 text-red-800' :
                                user.role === 'operator' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 w-1/5">{(user as any).contact || 'N/A'}</td>
                            <td className="px-4 py-3 w-1/5">{(user as any).subdivision || 'N/A'}</td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center text-gray-500 py-4">
                              No user accounts found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'addOperator' && (
              <AddOperatorView onBack={() => setCurrentView('main')} onSuccess={() => {
                setCurrentView('main');
                // Refresh users list
                axios.get(`${API_BASE_URL}/users.php`)
                  .then((res) => {
                    if (res.data.success) {
                      setUsers(res.data.data);
                    }
                  })
                  .catch((err) => console.error("Failed to load users:", err));
              }} />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView onBack={() => setCurrentView('main')} onGenerateReport={handleGenerateAnalyticsReport} logs={logs} users={users} />
            )}

            {currentView === 'changePassword' && (
              <ChangePasswordView onBack={() => setCurrentView('main')} />
            )}

            {currentView === 'report' && (
              <ReportView
                historyEntries={historyEntries}
                categories={categories}
                onClose={() => setCurrentView('main')}
              />
            )}

            {currentView === 'analyticsReport' && (
              <AnalyticsReportView
                logs={logs}
                users={users}
                onClose={() => setCurrentView('main')}
              />
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

// Add New Operator Component
interface AddOperatorViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AddOperatorView: React.FC<AddOperatorViewProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    contact: '',
    subdivision: '',
    role: 'operator'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = showToast.loading('Creating operator account...');

    try {
      const response = await axios.post(`${API_BASE_URL}/register.php`, formData);
      
      showToast.dismiss(loadingToast);
      
      if (response.data.success) {
        showToast.success('Operator Added Successfully', `New operator "${formData.username}" has been created`);
        onSuccess();
      } else {
        showToast.error('Registration Failed', response.data.message || 'Failed to create operator account');
      }
    } catch (error) {
      console.error('Error creating operator:', error);
      showToast.dismiss(loadingToast);
      showToast.error('Error', 'An error occurred while creating the operator account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold">Add New Operator</h2>
        <button
          onClick={onBack}
          className="bg-[#b85c57] hover:bg-[#a54c47] text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm self-start sm:self-auto shadow-md hover:shadow-lg"
        >
          ← Back
        </button>
      </div>
      
      <div className="bg-white rounded border border-gray-300 p-4 sm:p-6 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-none sm:max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter contact number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdivision</label>
            <input
              type="text"
              value={formData.subdivision}
              onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter subdivision"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="operator">Operator</option>
              <option value="user">User</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8a9b6e] hover:bg-[#7a8b5e] disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {loading ? 'Creating...' : 'Create Operator'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Analytics View Component
interface AnalyticsViewProps {
  onBack: () => void;
  onGenerateReport: () => void;
  logs: LogEntry[];
  users: User[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack, onGenerateReport, logs, users }) => {
  // Calculate analytics data
  const totalUsers = users.length;
  const operators = users.filter(u => u.role === 'operator').length;
  const regularUsers = users.filter(u => u.role === 'user').length;
  const supervisors = users.filter(u => u.role === 'supervisor').length;
  
  const today = new Date().toDateString();
  const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
  const recentActivity = logs.slice(0, 5);

  // Website visits tracking (login events)
  const loginLogs = logs.filter(log => log.action_type === 'login');
  const totalWebsiteVisits = loginLogs.length;
  const todayVisits = loginLogs.filter(log => new Date(log.timestamp).toDateString() === today).length;
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const weeklyVisits = loginLogs.filter(log => new Date(log.timestamp) >= thisWeekStart).length;
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  const monthlyVisits = loginLogs.filter(log => new Date(log.timestamp) >= thisMonthStart).length;

  // Unique visitors (unique user logins)
  const uniqueVisitors = new Set(loginLogs.map(log => log.user_id)).size;
  const todayUniqueVisitors = new Set(
    loginLogs.filter(log => new Date(log.timestamp).toDateString() === today)
      .map(log => log.user_id)
  ).size;

  // Action type distribution
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold">Website Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={onGenerateReport}
            className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">View Report</span>
            <span className="sm:hidden">Report</span>
          </button>
          <button
            onClick={onBack}
            className="bg-[#b85c57] hover:bg-[#a54c47] text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm self-start sm:self-auto shadow-md hover:shadow-lg"
          >
            ← Back
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Website Visits Section */}
        <div className="bg-gradient-to-r from-[#8a9b6e] to-[#7a8b5e] rounded-lg border border-green-200 p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Website Visits & Usage
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-blue-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Total Visits</h4>
              <p className="text-2xl font-bold text-blue-600">{totalWebsiteVisits}</p>
              <p className="text-xs text-gray-500">All time logins</p>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Today's Visits</h4>
              <p className="text-2xl font-bold text-green-600">{todayVisits}</p>
              <p className="text-xs text-gray-500">Logins today</p>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-purple-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Weekly Visits</h4>
              <p className="text-2xl font-bold text-purple-600">{weeklyVisits}</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-orange-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Monthly Visits</h4>
              <p className="text-2xl font-bold text-orange-600">{monthlyVisits}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-indigo-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Unique Visitors</h4>
              <p className="text-xl font-bold text-indigo-600">{uniqueVisitors}</p>
              <p className="text-xs text-gray-500">Total unique users</p>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-teal-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Today's Unique</h4>
              <p className="text-xl font-bold text-teal-600">{todayUniqueVisitors}</p>
              <p className="text-xs text-gray-500">Unique visitors today</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded border border-gray-300 shadow-sm">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Total Users</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{totalUsers}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded border border-gray-300 shadow-sm">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Operators</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{operators}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded border border-gray-300 shadow-sm">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Regular Users</h3>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{regularUsers}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded border border-gray-300 shadow-sm">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Today's Activity</h3>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">{todayLogs.length}</p>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Action Distribution */}
          <div className="bg-white p-3 sm:p-4 rounded border border-gray-300">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Action Distribution</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">{Object.entries(actionCounts).map(([action, count]) => (
                <div key={action} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{action.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Roles */}
          <div className="bg-white p-3 sm:p-4 rounded border border-gray-300">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">User Roles</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Supervisors</span>
                <span className="font-medium text-red-600">{supervisors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Operators</span>
                <span className="font-medium text-green-600">{operators}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Users</span>
                <span className="font-medium text-purple-600">{regularUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded border border-gray-300">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#8a9b6e]">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-white">User</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-white">Action</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-white">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">
                      {users.find(u => u.id === log.user_id)?.username || `User ${log.user_id}`}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600">
                      {log.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-500">
                      <span className="hidden sm:inline">{new Date(log.timestamp).toLocaleString()}</span>
                      <span className="sm:hidden">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Change Password Component
interface ChangePasswordViewProps {
  onBack: () => void;
}

const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showToast.error("Password Mismatch", "New password and confirm password do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast.error("Password Too Short", "New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.id) {
        showToast.error("Authentication Error", "User session not found. Please log in again.");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/change_password.php`, {
        user_id: user.id,
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });

      if (response.data.success) {
        showToast.success("Password Changed", "Your password has been successfully updated.");
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onBack();
      } else {
        showToast.error("Password Change Failed", response.data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast.error("Error", "An error occurred while changing the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold">Change Password</h2>
        <button
          onClick={onBack}
          className="bg-[#b85c57] hover:bg-[#a54c47] text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm self-start sm:self-auto shadow-md hover:shadow-lg"
        >
          ← Back
        </button>
      </div>
      
      <div className="bg-white rounded border border-gray-300 p-4 sm:p-6 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-none sm:max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
              placeholder="Enter current password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              minLength={6}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
              placeholder="Enter new password (min 6 chars)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
              placeholder="Confirm new password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8a9b6e] hover:bg-[#7a8b5e] disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-base shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupervisorDashboard;