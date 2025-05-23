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
  // Replace with real data fetching logic
  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [categories, setCategories] = useState<Category>({});
  const [viewMode, setViewMode] = useState<ViewMode>("consolidated");

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

  // Fetch items and history, and set most recent harvestDate for each item
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("https://soil-3tik.onrender.com/API/items.php");
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

        if (data.items && Array.isArray(data.items)) {
          const itemsWithDates = data.items.map((item: ConsolidatedItem) => {
            // Get all history entries for this item
            const itemHistory = data.history.filter((h: HistoryEntry) =>
              h.predefined_item_id === item.predefined_item_id
            );

            // Find most recent harvestDate
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

            // If no entries with harvest dates, look for the initial 'add' entry
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

            // If no matching entries found, return item with null harvest date
            return {
              ...item,
              harvestDate: null,
            };
          });

          setItems(itemsWithDates);
          // Optionally, if you want to use history elsewhere:
          // setHistoryEntries(Array.isArray(data.history) ? data.history : []);
        }
      } catch (error) {
        console.error("❌ Failed to load items:", error);
        setItems([]);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen w-full bg-black bg-opacity-40 flex items-center justify-center overflow-auto p-4">
      <div className="w-full max-w-screen-lg bg-white bg-opacity-60 backdrop-blur-lg rounded-xl shadow-lg flex flex-col h-full max-h-[95vh]">
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.6)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <main className="flex-1 p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-green-700">Welcome, User!</h2>
            <p className="text-gray-700 mt-2">You have read-only access to the system.</p>
            <div className="mt-4 flex-1 max-h-sm overflow-auto rounded border border-gray-300">
              <InventoryTable items={items} categories={categories} viewMode={viewMode} />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserView;