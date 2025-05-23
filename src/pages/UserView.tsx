import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ConsolidatedItem, HistoryEntry, Category, ViewMode } from "../types";

// Utility functions for date formatting
const safeFormatDate = (date: string | number | null | undefined) => {
  if (!date) return "-";
  const dateValue = typeof date === "number" ? new Date(date) : new Date(date);
  return dateValue.toLocaleDateString();
};

const formatDate = (date: string | null | undefined) => {
  if (!date || date === "0000-00-00") return "-";
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date format:", date);
      return "-";
    }
    return dateObj.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};

interface InventoryTableProps {
  items: ConsolidatedItem[] | HistoryEntry[];
  viewMode: ViewMode;
  categories: Category;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  categories,
  viewMode,
}) => {
  const itemsArray = Array.isArray(items) ? items : [];

  const getCategoryLabel = (mainCategory: string | number, subcategory: string | number) => {
    const mainCat = categories[mainCategory];
    const mainLabel = mainCat?.label || mainCategory;
    const subLabel = mainCat?.subcategories?.[subcategory]?.label || subcategory;
    return `${mainLabel} ${subLabel}`;
  };

  return (
    <div className="overflow-x-auto mt-8">
      <table className="w-full border-collapse">
        <thead className="bg-green-700 text-white">
          <tr>
            {viewMode === "consolidated" ? (
              <>
                <th className="p-3 text-left">Item Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Current Stock</th>
                <th className="p-3 text-left">Recent Procured Date</th>
              </>
            ) : (
              <>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Item Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Quantity Change</th>
                <th className="p-3 text-left">Procured Date</th>
                <th className="p-3 text-left">Notes</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {itemsArray.length === 0 ? (
            <tr>
              <td
                colSpan={viewMode === "consolidated" ? 4 : 6}
                className="p-4 text-center text-gray-500 border border-gray-200"
              >
                No items found
              </td>
            </tr>
          ) : viewMode === "consolidated" ? (
            (itemsArray as ConsolidatedItem[]).map((item) => (
              <tr
                key={`consolidated-${item.id}-${item.predefined_item_id}`}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3">{item.name}</td>
                <td className="p-3">{getCategoryLabel(item.mainCategory, item.subcategory)}</td>
                <td className="p-3">
                  <span className="font-medium">
                    {item.quantity} {item.unit}
                  </span>
                </td>
                <td className="p-3">
                  {item.harvestDate ? formatDate(item.harvestDate) : "-"}
                </td>
              </tr>
            ))
          ) : (
            (itemsArray as HistoryEntry[]).map((entry, index) => (
              <tr
                key={`history-${entry.id}-${entry.date}-${index}`}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3">{safeFormatDate(entry.date)}</td>
                <td className="p-3">{entry.name}</td>
                <td className="p-3">{getCategoryLabel(entry.mainCategory, entry.subcategory)}</td>
                <td className="p-3">
                  {entry.quantity > 0 ? (
                    <span className="text-green-700 font-medium">
                      +{entry.quantity} {entry.unit}
                    </span>
                  ) : (
                    <span className="text-red-700 font-medium">
                      {entry.quantity} {entry.unit}
                    </span>
                  )}
                </td>
                <td className="p-3">{formatDate(entry.harvestDate)}</td>
                <td className="p-3">{entry.notes || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const UserView: React.FC = () => {
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
  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://soil-3tik.onrender.com/API/categories.php");
        const json = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setCategories(json);
      } catch (error) {
        console.error("❌ Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch items and history from backend
  const fetchItems = async () => {
    try {
      const res = await axios.get("https://soil-3tik.onrender.com/API/items.php");
      const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

      if (data.items && Array.isArray(data.items)) {
        const itemsWithDates = data.items.map((item: ConsolidatedItem) => {
          const itemHistory = data.history.filter((h: HistoryEntry) =>
            h.predefined_item_id === item.predefined_item_id
          );

          const entriesWithDates = itemHistory
            .filter((h: HistoryEntry) => h.harvestDate && h.harvestDate.trim() !== "")
            .sort((a: HistoryEntry, b: HistoryEntry) =>
              new Date(b.harvestDate || "").getTime() - new Date(a.harvestDate || "").getTime()
            );

          if (entriesWithDates.length > 0) {
            return {
              ...item,
              harvestDate: entriesWithDates[0].harvestDate,
            };
          }

          const addEntries = itemHistory
            .filter((h: HistoryEntry) => h.changeType === "add")
            .sort((a: HistoryEntry, b: HistoryEntry) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );

          if (addEntries.length > 0) {
            return {
              ...item,
              harvestDate: addEntries[0].harvestDate,
            };
          }

          return {
            ...item,
            harvestDate: null,
          };
        });

        setItems(itemsWithDates);
        setHistoryEntries(Array.isArray(data.history) ? data.history : []);
      }
    } catch (error) {
      console.error("❌ Failed to load items:", error);
      setItems([]);
      setHistoryEntries([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const getCategoryLabel = (mainCategory: string | number, subcategory: string | number) => {
    const mainCat = categories[mainCategory];
    const mainLabel = mainCat?.label || mainCategory;
    const subLabel = mainCat?.subcategories?.[subcategory]?.label || subcategory;
    return `${mainLabel}/${subLabel}`;
  };

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

  // Filter items
  const filterItems = <T extends { name: string; mainCategory: string | number; subcategory: string | number; date?: string }>(
    items: T[]
  ) => {
    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch = !selectedCategory || item.mainCategory === selectedCategory;
      const subcategoryMatch = !selectedSubcategory || item.subcategory === selectedSubcategory;
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

  const filteredItems = filterItems(items);
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
              <h2 className="text-2xl font-bold">User View</h2>
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
                      {Object.entries(categories).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.label}</option>
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

                <div className="flex-1 overflow-y-auto max-h-[60vh] rounded border border-gray-300">
                  <InventoryTable
                    items={viewMode === "consolidated" ? filteredItems : filteredHistoryItems}
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

          {showAddModal && (
            <AddItemModal
              categories={categories}
              onClose={() => setShowAddModal(false)}
              onAddItem={() => {
                setShowAddModal(false);
                fetchItems();
              }}
            />
          )}

          {showCategoryModal && (
            <ManageCategoriesModal
              categories={categories}
              onUpdateCategories={(updatedCategories) => setCategories(updatedCategories)}
              onClose={() => setShowCategoryModal(false)}
            />
          )}

          {showReduceModal && selectedItem && (
            <ReduceStockModal
              item={selectedItem}
              onClose={() => setShowReduceModal(false)}
              onReduceStock={() => {
                setShowReduceModal(false);
                fetchItems();
              }}
            />
          )}

          {showIncreaseModal && selectedItem && (
            <IncreaseStockModal
              item={selectedItem}
              onClose={() => setShowIncreaseModal(false)}
              onIncreaseStock={() => {
                setShowIncreaseModal(false);
                fetchItems();
              }}
            />
          )}

          {showHistoryModal && selectedItem && (
            <ItemHistoryModal
              item={selectedItem}
              historyEntries={selectedHistory}
              categories={categories}
              onClose={() => setShowHistoryModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};


export default UserView;