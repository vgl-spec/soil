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
import { ConsolidatedItem, HistoryEntry, Category, ViewMode } from "../types";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { showToast, showConfirmation } from "../utils/toastUtils";

const OperatorDashboard: React.FC = () => {
  console.log("OperatorDashboard component loaded");
  console.log("API_BASE_URL:", API_BASE_URL);
  
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
  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching categories from:", `${API_BASE_URL}/categories.php`);
        const res = await axios.get(`${API_BASE_URL}/categories.php`, {
          timeout: 10000 // 10 second timeout
        });
        console.log("Categories response status:", res.status);
        console.log("Categories response data:", res.data);
        const json = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        console.log("Loaded categories:", json);
        setCategories(json);
      } catch (error) {
        console.error("❌ Failed to load categories:", error);
        if (axios.isAxiosError(error)) {
          console.error("Status:", error.response?.status);
          console.error("URL:", error.config?.url);
          console.error("Data:", error.response?.data);
          
          if (error.code === 'ECONNABORTED') {
            console.error("Request timed out - server might be sleeping");
          } else if (error.response?.status === 404) {
            console.error("Endpoint not found - check if server is deployed correctly");
          }
        }
        // Set empty categories as fallback
        setCategories({});
      }
    };
    fetchData();
  }, []);

  // Fetch items and history from backend
  const fetchItems = async () => {
    showToast.loading("Loading inventory...");
    
    try {
      console.log("Fetching items from:", `${API_BASE_URL}/items.php`);
      const res = await axios.get(`${API_BASE_URL}/items.php`, {
        timeout: 10000 // 10 second timeout
      });
      console.log("Items response status:", res.status);
      const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      
      console.log("Loaded items data:", data);

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
        
        showToast.close();
        showToast.success("Inventory loaded successfully!", `Found ${itemsWithDates.length} items`);
      }
    } catch (error) {
      showToast.close();
      console.error("❌ Failed to load items:", error);
      
      if (axios.isAxiosError(error)) {
        console.error("Items - Status:", error.response?.status);
        console.error("Items - URL:", error.config?.url);
        console.error("Items - Data:", error.response?.data);
        
        if (error.code === 'ECONNABORTED') {
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
  };  // Filtered items
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

  // Debug logging for filter issues
  useEffect(() => {
    console.log("Filter Debug Info:");
    console.log("Selected Category:", selectedCategory);
    console.log("Selected Subcategory:", selectedSubcategory);
    console.log("Categories structure:", categories);
    console.log("Consolidated items sample with mainCategory:", consolidatedItems.slice(0, 3).map(item => ({
      name: item.name,
      mainCategory: item.mainCategory,
      mainCategoryType: typeof item.mainCategory,
      subcategory: item.subcategory,
      subcategoryType: typeof item.subcategory
    })));
    
    // Show ALL items for debugging
    console.log("ALL items mainCategory values:", consolidatedItems.map(item => ({
      name: item.name,
      mainCategory: item.mainCategory
    })));
    console.log("Filtered consolidated items count:", filteredConsolidatedItems.length);
    console.log("Total consolidated items count:", consolidatedItems.length);
    
    // Show filter results as toast
    if (consolidatedItems.length > 0) {
      const filterMessage = [];
      if (selectedCategory) filterMessage.push(`Category: ${categories[selectedCategory]?.label}`);
      if (selectedSubcategory && selectedCategory) {
        const subcategoryLabel = categories[selectedCategory]?.subcategories?.[selectedSubcategory]?.label;
        if (subcategoryLabel) filterMessage.push(`Subcategory: ${subcategoryLabel}`);
      }
      if (selectedDateRange !== "all") filterMessage.push(`Date: ${selectedDateRange}`);
      if (searchQuery) filterMessage.push(`Search: "${searchQuery}"`);
      
      if (filterMessage.length > 0) {
        showToast.info(
          `Filter applied: ${filteredConsolidatedItems.length} items found`,
          filterMessage.join(', ')
        );
      }
    }
    
    // Test category matching for first item
    if (consolidatedItems.length > 0 && selectedCategory) {
      const firstItem = consolidatedItems[0];
      const selectedCategoryData = categories[selectedCategory];
      console.log("Testing first item category matching:");
      console.log("- Item mainCategory:", firstItem.mainCategory, "(type:", typeof firstItem.mainCategory, ")");
      console.log("- Selected category key:", selectedCategory);
      console.log("- Selected category data:", selectedCategoryData);
      if (selectedCategoryData) {
        console.log("- Category ID:", selectedCategoryData.id, "(type:", typeof selectedCategoryData.id, ")");
        console.log("- Category label:", selectedCategoryData.label);
        console.log("- Match by ID:", Number(firstItem.mainCategory) === Number(selectedCategoryData.id));
        console.log("- Match by key:", String(firstItem.mainCategory) === selectedCategory);
        console.log("- Match by label:", String(firstItem.mainCategory) === selectedCategoryData.label);
      }
    }
  }, [selectedCategory, selectedSubcategory, categories, consolidatedItems, filteredConsolidatedItems, selectedDateRange, searchQuery]);

  return (
    <div className="h-screen w-screen bg-black bg-opacity-40 flex items-center justify-center p-1 sm:p-2">
      <div className="w-full h-full max-w-screen-xl bg-white bg-opacity-60 backdrop-blur-lg rounded-xl shadow-lg flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.6)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 flex flex-col min-h-0 overflow-hidden">

            {/* Compact header with action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-2">
              <h2 className="text-lg sm:text-xl font-bold">Operator Dashboard</h2>
              
              {/* Compact action buttons */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                  onClick={() => {
                    setShowAddModal(true);
                    showToast.info("Add Item", "Opening add item form...");
                  }}
                >
                  + Add
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                  onClick={() => {
                    setShowCategoryModal(true);
                    showToast.info("Categories", "Opening category management...");
                  }}
                >
                  Categories
                </button>
                <button
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm transition-colors whitespace-nowrap"
                  onClick={() => {
                    setShowReportView(!showReportView);
                    showToast.info(
                      showReportView ? "Back to Inventory" : "Generate Report",
                      showReportView ? "Returning to inventory view..." : "Opening report generator..."
                    );
                  }}
                >
                  {showReportView ? "Back" : "Report"}
                </button>
              </div>
            </div>

            {!showReportView ? (
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
                      viewMode === "consolidated" ? "bg-green-700 text-white shadow-md" : "bg-white border hover:bg-green-50"
                    }`}
                    onClick={() => {
                      setViewMode("consolidated");
                      showToast.info("Consolidated View", "Showing aggregated inventory data");
                    }}
                  >
                    Consolidated
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded text-sm transition-all duration-300 ${
                      viewMode === "history" ? "bg-green-700 text-white shadow-md" : "bg-white border hover:bg-green-50"
                    }`}
                    onClick={() => {
                      setViewMode("history");
                      showToast.info("History View", "Showing detailed transaction history");
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
            ) : (
              <ReportView
                historyEntries={historyEntries}
                categories={categories}
                onClose={() => setShowReportView(false)}
              />
            )}
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
              showToast.warning("Add Item Cancelled", "Item was not added to inventory");
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
              showToast.warning("Stock Reduction Cancelled", "No changes were made to inventory");
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
              showToast.warning("Stock Increase Cancelled", "No changes were made to inventory");
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
              showToast.info("History View Closed", `Finished viewing ${selectedItem.name} history`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;