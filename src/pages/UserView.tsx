import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ConsolidatedItem, Category } from "../types";
import { getCategoryLabel } from "../utils/inventoryUtils";

const UserView: React.FC = () => {
  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [categories, setCategories] = useState<Category>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories.php`);
        const json = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setCategories(json);
      } catch (error) {
        console.error("❌ Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/items.php`);
        const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

        if (data.items && Array.isArray(data.items)) {
          const itemsWithDates = data.items.map((item: ConsolidatedItem) => {
            const itemHistory = data.history.filter(
              (h: any) => h.predefined_item_id === item.predefined_item_id
            );

            const entriesWithDates = itemHistory
              .filter((h: any) => h.harvestDate && h.harvestDate.trim() !== "")
              .sort(
                (a: any, b: any) =>
                  new Date(b.harvestDate || "").getTime() -
                  new Date(a.harvestDate || "").getTime()
              );

            if (entriesWithDates.length > 0) {
              return {
                ...item,
                harvestDate: entriesWithDates[0].harvestDate,
              };
            }

            const addEntries = itemHistory
              .filter((h: any) => h.changeType === "add")
              .sort(
                (a: any, b: any) =>
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
        }
      } catch (error) {
        console.error("❌ Failed to load items:", error);
        setItems([]);
      }
    };
    fetchItems();
  }, []);

  const formatDate = (date: string | null | undefined): string => {
    if (!date || date === "0000-00-00") return "-";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "-";
      }
      return dateObj.toLocaleDateString();
    } catch {
      return "-";
    }  };

  return (
    <div className="h-screen w-screen bg-black bg-opacity-40 flex items-center justify-center p-0">
      <div className="w-full h-full bg-white bg-opacity-60 backdrop-blur-lg flex flex-col overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "rgba(255, 255, 255, 0.45)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#8a9b6e]">Inventory Overview</h2>
            
            {/* Mobile Card View */}
            <div className="block sm:hidden flex-1 overflow-y-auto space-y-3 min-h-0">
              {items.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border border-gray-200 rounded">
                  No items found
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`item-${item.id}-${item.predefined_item_id}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                      <span className="bg-[#8a9b6e] text-white px-2 py-1 rounded text-sm font-medium shadow-md">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="text-gray-900">{getCategoryLabel(categories, item.mainCategory, item.subcategory)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Procured Date:</span>
                        <span className="text-gray-900">{item.harvestDate ? formatDate(item.harvestDate) : "-"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:flex flex-1 overflow-auto rounded border border-gray-300 shadow-lg bg-white min-h-0">
              <table className="w-full border-collapse">
                <thead className="bg-[#8a9b6e] text-white">
                  <tr>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Item Name</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Category</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Current Stock</th>
                    <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Recent Procured Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500 border border-gray-200">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={`item-${item.id}-${item.predefined_item_id}`} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">{item.name}</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">{getCategoryLabel(categories, item.mainCategory, item.subcategory)}</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <span className="font-medium">{item.quantity} {item.unit}</span>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">{item.harvestDate ? formatDate(item.harvestDate) : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserView;