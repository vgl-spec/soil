import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InventoryTable from "../components/InventoryTable";
import AddItemModal from "../components/AddItemModal";
import ItemHistoryModal from "../components/ItemHistoryModal";
import IncreaseStockModal from "../components/IncreaseStockModal";
import ReduceStockModal from "../components/ReduceStockModal";
import ManageCategoriesModal from "../components/ManageCategoriesModal";
import ReportView from "../components/ReportView";
import AnalyticsReportView from "../components/AnalyticsReportView";
import { ConsolidatedItem, HistoryEntry, Category, ViewMode } from "../types";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { showToast } from "../utils/toastUtils";
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
  created_at?: string;
}

const OperatorDashboard: React.FC = () => {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [categories, setCategories] = useState<Category>({});
  const [viewMode, setViewMode] = useState<ViewMode>("consolidated");
  const [showReportView, setShowReportView] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConsolidatedItem | null>(null);
  const [showIncreaseModal, setShowIncreaseModal] = useState(false);
  const [showReduceModal, setShowReduceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all"); // "all", "today", "7d", etc.
  const [showFilters, setShowFilters] = useState<boolean>(false); // Control filter visibility
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true); // Track initial loading state
  const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false);
  const [itemsLoaded, setItemsLoaded] = useState<boolean>(false);
  
  // Additional state for menu functionality
  const [currentView, setCurrentView] = useState<'main' | 'accounts' | 'analytics' | 'changePassword' | 'analyticsReport'>('main');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if all data is loaded and close loading dialog
  useEffect(() => {
    if (categoriesLoaded && itemsLoaded && isInitialLoading) {
      showToast.close();
      setIsInitialLoading(false);
      
      // Show welcome notification
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.username) {
        showToast.success("Welcome", `Welcome, ${user.username}!`);
      }
    }
  }, [categoriesLoaded, itemsLoaded, isInitialLoading]);

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      // Show loading toast at the start only once
      if (isInitialLoading) {
        showToast.loading("Loading categories and inventory...");
      }
      
      try {
        const res = await axios.get(`${API_BASE_URL}/categories.php`, {
          timeout: 10000 // 10 second timeout
        });
        const json = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setCategories(json);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error("Failed to load categories:", error);
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            showToast.close();
            showToast.error("Request timeout", "Server might be sleeping. Please try again.");
          } else if (error.response?.status === 404) {
            showToast.error("Endpoint not found", "Check if server is deployed correctly.");
          } else {
            showToast.error("Failed to load categories", "Please check your connection and try again.");
          }
        }
        
        // Close loading dialog and show error
        showToast.close();
        showToast.error("Failed to Load Categories", "Unable to load categories. Some features may not work properly.");
        setIsInitialLoading(false);
        
        // Set empty categories as fallback
        setCategories({});
        setCategoriesLoaded(true);
      }
    };
    fetchData();
  }, []);

  // Fetch items and history from backend
  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/items.php`, {
        timeout: 10000 // 10 second timeout
      });
      const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

      if (data.items && Array.isArray(data.items)) {
        const itemsWithDates = data.items.map((item: ConsolidatedItem) => {
          const itemHistory = data.history.filter((h: HistoryEntry) => 
            h.predefined_item_id === item.predefined_item_id
          );

          const entriesWithDates = itemHistory
            .filter((h: HistoryEntry) => h.harvestDate && h.harvestDate.trim() !== '')
            .sort((a: HistoryEntry, b: HistoryEntry) => 
              new Date(b.harvestDate || '').getTime() - new Date(a.harvestDate || '').getTime()
            );

          if (entriesWithDates.length > 0) {
            return {
              ...item,
              harvestDate: entriesWithDates[0].harvestDate,
            };
          }

          const addEntries = itemHistory
            .filter((h: HistoryEntry) => h.changeType === 'add')
            .sort((a: HistoryEntry, b: HistoryEntry) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );

          if (addEntries.length > 0) {
            return {
              ...item,
              harvestDate: addEntries[0].harvestDate
            };
          }

          return {
            ...item,
            harvestDate: null
          };
        });
        
        setConsolidatedItems(itemsWithDates);
        setHistoryEntries(Array.isArray(data.history) ? data.history : []);
        setItemsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          showToast.close();
          showToast.error("Request timeout", "Server might be sleeping. Please try again.");
        } else if (error.response?.status === 404) {
          showToast.error("Endpoint not found", "Check if server is deployed correctly.");
        } else {
          showToast.error("Failed to load inventory", "Please check your connection and try again.");
        }
      } else {
        showToast.error("Network error", "Unable to connect to server.");
      }
      
      setHistoryEntries([]);
      setConsolidatedItems([]);
    }
  };
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch users for account management
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users.php`);
        
        if (response.data.success) {
          setUsers(response.data.data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Fetch logs for analytics
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/logs.php`);
        
        // The logs.php endpoint returns data directly as an array
        if (Array.isArray(response.data)) {
          setLogs(response.data);
        } else if (response.data.success) {
          setLogs(response.data.data);
        } else {
          setLogs([]);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLogs([]);
      }
    };
    fetchLogs();
  }, []);

  const handleReduceStock = (item: ConsolidatedItem) => {
    setSelectedItem(item);
    setShowReduceModal(true);
  };

  const handleIncreaseStock = (item: ConsolidatedItem) => {
    setSelectedItem(item);
    setShowIncreaseModal(true);
  };

  const handleViewHistory = (item: ConsolidatedItem) => {
    const itemHistory = historyEntries
      .filter((entry) => entry.predefined_item_id === item.predefined_item_id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSelectedItem(item);
    setShowHistoryModal(true);
    setSelectedHistory(itemHistory);
  };

  // Menu action handlers
  const handleDeleteAccounts = async () => {
    // Fetch users first
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/users.php`);
      if (usersResponse.data.success) {
        const availableUsers = usersResponse.data.data.filter((user: any) => user.role !== 'supervisor');
        
        if (availableUsers.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Accounts to Delete',
            text: 'There are no user accounts available for deletion.',
            confirmButtonColor: '#059669'
          });
          return;
        }

        const userOptions = availableUsers.reduce((acc: any, user: any) => {
          acc[user.id] = `${user.username} (${user.role})`;
          return acc;
        }, {});

        const { value: selectedUserId } = await Swal.fire({
          title: 'Select Account to Delete',
          input: 'select',
          inputOptions: userOptions,
          inputPlaceholder: 'Choose an account to delete',
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
          const selectedUser = availableUsers.find((u: any) => u.id === parseInt(selectedUserId));
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
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch user accounts.',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  const handleViewAccounts = () => {
    setCurrentView('accounts');
    setShowReportView(false); // Reset report view
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
    setShowReportView(false); // Reset report view
  };

  const handleChangePassword = () => {
    setCurrentView('changePassword');
    setShowReportView(false); // Reset report view
  };

  // Function to go back to main dashboard
  const handleBackToMain = () => {
    setCurrentView('main');
    setShowReportView(false);
  };

  // Function to generate analytics report
  const handleGenerateAnalyticsReport = () => {
    setCurrentView('analyticsReport');
  };

  const handleMenuAction = (action: 'addOperator' | 'deleteAccounts' | 'accounts' | 'analytics' | 'changePassword') => {
    switch (action) {
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
      default:
        break;
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showToast.error('Error', 'New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      showToast.error('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('/soil/app/API/users.php?action=change_password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast.success('Success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentView('main');
      } else {
        showToast.error('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast.error('Error', 'Failed to change password');
    }
  };

  // Filtered items
  const filterItems = <T extends { name: string; mainCategory: string | number | null; subcategory: string | number | null; date?: string; harvestDate?: string | null }>(
      items: T[]
  ): T[] => {
      return items.filter((item) => {
        // Name search filter
        const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter - selectedCategory is the key, item.mainCategory is the ID
        let categoryMatch = true;
        if (selectedCategory) {
          const selectedCategoryData = categories[selectedCategory];
          if (selectedCategoryData && item.mainCategory !== null && item.mainCategory !== undefined) {
            // Match by ID (item.mainCategory should match selectedCategoryData.id)
            categoryMatch = Number(item.mainCategory) === Number(selectedCategoryData.id);
          } else {
            categoryMatch = false;
          }
        }
        
        // Subcategory filter - only apply if category is selected
        let subcategoryMatch = true;
        if (selectedSubcategory && selectedCategory) {
          const selectedCategoryData = categories[selectedCategory];
          if (selectedCategoryData && selectedCategoryData.subcategories && item.subcategory !== null && item.subcategory !== undefined) {
            const subcategoryData = selectedCategoryData.subcategories[selectedSubcategory];
            if (subcategoryData) {
              // Match by ID (item.subcategory should match subcategoryData.id)
              subcategoryMatch = Number(item.subcategory) === Number(subcategoryData.id);
            } else {
              subcategoryMatch = false;
            }
          } else {
            subcategoryMatch = false;
          }
        }
        
        // Date filter - check both date and harvestDate fields
        const dateMatch = (() => {
          if (selectedDateRange === "all") return true;
          
          // Use harvestDate if available, otherwise use date
          const itemDateStr = item.harvestDate || item.date;
          if (!itemDateStr) return selectedDateRange === "all";
          
          const itemDate = new Date(itemDateStr);
          const now = new Date();
          
          // Reset time to beginning of day for accurate comparison
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          
          switch (selectedDateRange) {
            case "today":
              return itemDateOnly.getTime() === today.getTime();
            case "7d":
              const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              return itemDateOnly >= sevenDaysAgo;
            case "30d":
              const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              return itemDateOnly >= thirtyDaysAgo;
            default:
              return true;
          }
        })();
        
        return nameMatch && categoryMatch && subcategoryMatch && dateMatch;
      });
    };

  const filteredConsolidatedItems = filterItems(consolidatedItems);
  const filteredHistoryItems = filterItems(historyEntries);

  return (
    <div className="h-screen w-screen bg-black bg-opacity-40 flex items-center justify-center p-0">
      <div className="w-full h-full bg-white bg-opacity-60 backdrop-blur-lg flex flex-col overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "rgba(255, 255, 255, 0.45)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full">
          <Header isOperator={true} onMenuAction={handleMenuAction} />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col min-h-0 overflow-hidden">

            {/* Compact header with action buttons */}
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#8a9b6e] truncate">Operator Dashboard</h2>
              
              {/* Compact action buttons - always inline */}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-1.5 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg min-w-0"
                  onClick={() => {
                    setShowAddModal(true);
                    showToast.info("Add Item", "Opening add item form...");
                  }}
                >
                  <span className="hidden sm:inline">Add Item</span>
                  <span className="sm:hidden">Add</span>
                </button>
                <button
                  className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-1.5 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg min-w-0"
                  onClick={() => {
                    setShowCategoryModal(true);
                  }}
                >
                  <span className="hidden sm:inline">Manage Categories</span>
                  <span className="sm:hidden">Categories</span>
                </button>
                <button
                  className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-1.5 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg min-w-0"
                  onClick={() => {
                    setShowReportView(!showReportView);
                    if (!showReportView) {
                      setCurrentView('main'); // Reset to main view when showing report
                    }
                    showToast.info(
                      showReportView ? "Back to Inventory" : "Generate Report",
                      showReportView ? "Returning to inventory view..." : "Opening report generator..."
                    );
                  }}
                >
                  <span className="hidden sm:inline">{showReportView ? "Back" : "View Report"}</span>
                  <span className="sm:hidden">{showReportView ? "Back" : "Report"}</span>
                </button>
              </div>
            </div>

            {showReportView ? (
              <ReportView
                historyEntries={historyEntries}
                categories={categories}
                onClose={() => setShowReportView(false)}
              />
            ) : currentView === 'main' ? (
              <>
                {/* Filter Toggle Button */}
                <div className="mb-2 flex items-center justify-between">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                  >
                    <svg 
                      className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {(searchQuery || selectedCategory || selectedSubcategory || selectedDateRange !== "all") && (
                      <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {[searchQuery, selectedCategory, selectedSubcategory, selectedDateRange !== "all" ? selectedDateRange : null]
                          .filter(Boolean).length}
                      </span>
                    )}
                  </button>
                  
                  {/* Clear all filters button */}
                  {(searchQuery || selectedCategory || selectedSubcategory || selectedDateRange !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory(null);
                        setSelectedSubcategory(null);
                        setSelectedDateRange("all");
                        showToast.info("Filters Cleared", "All filters have been reset");
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Collapsible Filter Section */}
                {showFilters && (
                  <div className="mb-2 p-2 sm:p-3 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 items-end">
                      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Search:</label>
                        <input
                          type="text"
                          className="w-full p-1.5 border border-gray-300 rounded text-sm"
                          placeholder="Search inventory..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Main Category:</label>
                        <select
                          className="w-full p-1.5 border border-gray-300 rounded text-sm"
                          value={selectedCategory || ""}
                          onChange={(e) => {
                            const value = e.target.value || null;
                            setSelectedCategory(value);
                            setSelectedSubcategory(null);
                          }}
                        >
                          <option value="">All</option>
                          {Object.entries(categories).map(([name, cat]) => (
                            <option key={name} value={name}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subcategory:</label>
                        <select
                          className="w-full p-1.5 border border-gray-300 rounded text-sm"
                          value={selectedSubcategory || ""}
                          onChange={(e) => {
                            const value = e.target.value || null;
                            setSelectedSubcategory(value);
                          }}
                          disabled={!selectedCategory}
                        >
                          <option value="">All</option>
                          {selectedCategory &&
                            Object.entries(categories[selectedCategory]?.subcategories || {}).map(
                              ([key, sub]) => (
                                <option key={key} value={key}>{sub.label}</option>
                              )
                            )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date Range:</label>
                        <select
                          className="w-full p-1.5 border border-gray-300 rounded text-sm"
                          value={selectedDateRange}
                          onChange={(e) => setSelectedDateRange(e.target.value)}
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="7d">Last 7 Days</option>
                          <option value="30d">Last 30 Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Compact view mode buttons */}
                <div className="mb-2 flex gap-1">
                  <button
                    className={`px-3 py-1.5 rounded text-sm transition-all duration-300 ${
                      viewMode === "consolidated" ? "bg-[#8a9b6e] text-white shadow-md" : "bg-white border hover:bg-[#8a9b6e] hover:text-white"
                    }`}
                    onClick={() => {
                      setViewMode("consolidated");
                    }}
                  >
                    Consolidated
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded text-sm transition-all duration-300 ${
                      viewMode === "history" ? "bg-[#8a9b6e] text-white shadow-md" : "bg-white border hover:bg-[#8a9b6e] hover:text-white"
                    }`}
                    onClick={() => {
                      setViewMode("history");
                    }}
                  >
                    History
                  </button>
                </div>

                {/* Prominent Inventory Table */}
                <div className="flex-1 overflow-auto rounded border border-gray-300 shadow-lg bg-white min-h-0">
                  <InventoryTable
                    items={viewMode === "consolidated" ? filteredConsolidatedItems : filteredHistoryItems}
                    viewMode={viewMode}
                    categories={categories}
                    onReduceStock={handleReduceStock}
                    onIncreaseStock={handleIncreaseStock}
                    onViewHistory={handleViewHistory}
                  />
                </div>
              </>
            ) : currentView === 'accounts' ? (
              <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h2 className="text-lg sm:text-xl font-bold">Account Management</h2>
                  <button
                    onClick={handleBackToMain}
                    className="bg-[#b85c57] hover:bg-[#a54c47] text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm self-start sm:self-auto shadow-md hover:shadow-lg"
                  >
                    ← Back
                  </button>
                </div>
                
                {/* Mobile Card View */}
                <div className="sm:hidden flex-1 overflow-y-auto p-2 space-y-3 pb-20">
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
            ) : currentView === 'analytics' ? (
              <AnalyticsView onBack={() => setCurrentView('main')} onGenerateReport={handleGenerateAnalyticsReport} logs={logs} users={users} />
            ) : currentView === 'analyticsReport' ? (
              <AnalyticsReportView
                logs={logs}
                users={users}
                onClose={() => setCurrentView('main')}
              />
            ) : currentView === 'changePassword' ? (
              <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#8a9b6e] to-[#7a8a5e] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-white">Change Password</h1>
                      <button
                        onClick={handleBackToMain}
                        className="bg-white text-[#8a9b6e] px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handlePasswordChange} className="max-w-md mx-auto space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a9b6e]"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a9b6e]"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a9b6e]"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#8a9b6e] text-white py-2 px-4 rounded-md hover:bg-[#7a8a5e] transition-colors"
                      >
                        Change Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile-optimized modals */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <AddItemModal
            categories={categories}
            onClose={() => {
              setShowAddModal(false);
            }}
            onAddItem={() => {
              setShowAddModal(false);
              fetchItems();
              showToast.success("Item Added!", "New item has been added to inventory");
            }}
          />
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <ManageCategoriesModal
            categories={categories}
            onUpdateCategories={(updatedCategories) => {
              setCategories(updatedCategories);
              showToast.success("Categories Updated!", "Category changes have been saved");
            }}
            onClose={() => {
              setShowCategoryModal(false);
              showToast.info("Category Management Closed", "No changes were made");
            }}
          />
        </div>
      )}

      {showReduceModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <ReduceStockModal
            item={selectedItem}
            onClose={() => {
              setShowReduceModal(false);
            }}
            onReduceStock={() => {
              setShowReduceModal(false);
              fetchItems();
              showToast.success("Stock Reduced!", `${selectedItem.name} stock has been updated`);
            }}
          />
        </div>
      )}

      {showIncreaseModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <IncreaseStockModal
            item={selectedItem}
            onClose={() => {
              setShowIncreaseModal(false);
            }}
            onIncreaseStock={() => {
              setShowIncreaseModal(false);
              fetchItems();
              showToast.success("Stock Increased!", `${selectedItem.name} stock has been updated`);
            }}
          />
        </div>
      )}

      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <ItemHistoryModal
            item={selectedItem}
            historyEntries={selectedHistory}
            categories={categories}
            onClose={() => {
              setShowHistoryModal(false);
            }}
          />
        </div>
      )}
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(actionCounts).map(([action, count]) => (
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

export default OperatorDashboard;