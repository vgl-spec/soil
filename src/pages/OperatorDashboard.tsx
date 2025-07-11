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
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all"); // "all", "today", "7d", etc.  // Fetch categories
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
      }
    } catch (error) {
      console.error("❌ Failed to load items:", error);
      if (axios.isAxiosError(error)) {
        console.error("Items - Status:", error.response?.status);
        console.error("Items - URL:", error.config?.url);
        console.error("Items - Data:", error.response?.data);
        
        if (error.code === 'ECONNABORTED') {
          console.error("Items request timed out - server might be sleeping");
        } else if (error.response?.status === 404) {
          console.error("Items endpoint not found - check if server is deployed correctly");
        }
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
  const filterItems = <T extends { name: string; mainCategory: string | number; subcategory: string | number; date?: string }>(
      items: T[]
  ) => {
      return items.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Fix category matching - item.mainCategory is a numeric ID, selectedCategory is a string key
        let categoryMatch = !selectedCategory;
        if (selectedCategory) {
          // Find the category by matching the numeric ID with the category's ID
          const selectedCategoryData = categories[selectedCategory];
          if (selectedCategoryData) {
            categoryMatch = Number(item.mainCategory) === Number(selectedCategoryData.id);
          }
        }
        
        // Fix subcategory matching - item.subcategory is a numeric ID, selectedSubcategory is a string key
        let subcategoryMatch = !selectedSubcategory;
        if (selectedSubcategory && selectedCategory) {
          const selectedCategoryData = categories[selectedCategory];
          if (selectedCategoryData && selectedCategoryData.subcategories) {
            const subcategoryData = selectedCategoryData.subcategories[selectedSubcategory];
            if (subcategoryData) {
              subcategoryMatch = Number(item.subcategory) === Number(subcategoryData.id);
            }
          }
        }
        
        const dateMatch = (() => {
          if (selectedDateRange === "all" || !item.date) return true;
          const itemDate = new Date(item.date);
          const now = new Date();
          if (selectedDateRange === "today") {
            return itemDate.toDateString() === now.toDateString();
          } else if (selectedDateRange === "7d") {
            return now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
          } else if (selectedDateRange === "30d") {
            return now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
          }
          return true;
        })();
        
        return nameMatch && categoryMatch && subcategoryMatch && dateMatch;
      });
    };

  const filteredConsolidatedItems = filterItems(consolidatedItems);
  const filteredHistoryItems = filterItems(historyEntries);

  return (
    <div className="min-h-screen w-full bg-black bg-opacity-40 flex items-center justify-center overflow-auto p-4">
      <div className="w-full max-w-screen-lg bg-white bg-opacity-60 backdrop-blur-lg rounded-xl shadow-lg flex flex-col h-full max-h-[95vh] overflow-hidden">
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.6)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <main className="flex-1 p-6 flex flex-col">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Operator Dashboard</h2>
              <div className="space-x-2">
                <button
                  className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add Item
                </button>
                <button
                  className="bg-blue-700 text-white px-3 py-2 rounded hover:bg-blue-800"
                  onClick={() => setShowCategoryModal(true)}
                >
                  Manage Categories
                </button>
                <button
                  className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700"
                  onClick={() => setShowReportView(!showReportView)}
                >
                  {showReportView ? "Back to Inventory" : "Generate Report"}
                </button>
              </div>
            </div>

            {!showReportView ? (
              <>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Main Category:</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
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
                    <label className="block text-sm font-medium text-gray-700">Subcategory:</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
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
                    <label className="block text-sm font-medium text-gray-700">Date Range:</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded"
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
                <div className="mb-4">
                  <button
                    className={`px-4 py-2 mr-2 rounded ${
                      viewMode === "consolidated" ? "bg-green-700 text-white" : "bg-white border"
                    }`}
                    onClick={() => setViewMode("consolidated")}
                  >
                    Consolidated View
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${
                      viewMode === "history" ? "bg-green-700 text-white" : "bg-white border"
                    }`}
                    onClick={() => setViewMode("history")}
                  >
                    History View
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[50vh] rounded border border-gray-300">
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

      {/* Modals positioned above the main container */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <AddItemModal
            categories={categories}
            onClose={() => setShowAddModal(false)}
            onAddItem={() => {
              setShowAddModal(false);
              fetchItems();
            }}
          />
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <ManageCategoriesModal
            categories={categories}
            onUpdateCategories={(updatedCategories) => setCategories(updatedCategories)}
            onClose={() => setShowCategoryModal(false)}
          />
        </div>
      )}

      {showReduceModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <ReduceStockModal
            item={selectedItem}
            onClose={() => setShowReduceModal(false)}
            onReduceStock={() => {
              setShowReduceModal(false);
              fetchItems();
            }}
          />
        </div>
      )}

      {showIncreaseModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <IncreaseStockModal
            item={selectedItem}
            onClose={() => setShowIncreaseModal(false)}
            onIncreaseStock={() => {
              setShowIncreaseModal(false);
              fetchItems();
            }}
          />
        </div>
      )}

      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <ItemHistoryModal
            item={selectedItem}
            historyEntries={selectedHistory}
            categories={categories}
            onClose={() => setShowHistoryModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;