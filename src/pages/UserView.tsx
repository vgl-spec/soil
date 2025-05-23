import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ConsolidatedItem, Category } from "../types";

const UserView: React.FC = () => {
  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [categories, setCategories] = useState<Category>({});

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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("https://soil-3tik.onrender.com/API/items.php");
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
    }
  };

  const getCategoryLabel = (mainCategoryId: string | number, subcategoryId: string | number): string => {
    let mainLabel = mainCategoryId;
    let subLabel = subcategoryId;

    for (const [, mainCat] of Object.entries(categories)) {
      if (String(mainCat.id) === String(mainCategoryId)) {
        mainLabel = mainCat.label;

        for (const [, subCat] of Object.entries(mainCat.subcategories || {})) {
          if (String(subCat.id) === String(subcategoryId)) {
            subLabel = subCat.label;
            break;
          }
        }

        break;
      }
    }

    return `${mainLabel} / ${subLabel}`;
  };

  return (
    <div className="min-h-screen w-full bg-black bg-opacity-40 flex items-center justify-center overflow-auto p-4 sm:p-6">
      <div className="w-full max-w-screen-lg bg-white bg-opacity-60 backdrop-blur-lg rounded-xl shadow-lg flex flex-col h-full max-h-[95dvh] overflow-hidden">
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.6)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col h-full">
          <Header />
          <main className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="overflow-x-auto mt-8 flex-1 flex flex-col">
              <table className="w-full border-collapse flex-shrink-0 table-fixed">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="p-3 text-left w-1/4">Item Name</th>
                    <th className="p-3 text-left w-1/4">Category</th>
                    <th className="p-3 text-left w-1/4">Current Stock</th>
                    <th className="p-3 text-left w-1/4">Recent Procured Date</th>
                  </tr>
                </thead>
              </table>
              <div className="overflow-y-auto max-h-[60dvh] flex-1">
                <table className="w-full border-collapse table-fixed">
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
                          <td className="p-3 w-1/4">{item.name}</td>
                          <td className="p-3 w-1/4">{getCategoryLabel(item.mainCategory, item.subcategory)}</td>
                          <td className="p-3 font-medium w-1/4">{item.quantity} {item.unit}</td>
                          <td className="p-3 w-1/4">{item.harvestDate ? formatDate(item.harvestDate) : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserView;
