import React, { useEffect, useState } from "react";
import axios from "axios";
import { ConsolidatedItem, Category } from "../types";

// Utility function for date formatting
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
  items: ConsolidatedItem[];
  categories: Category;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, categories }) => {
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
            <th className="p-3 text-left">Item Name</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Current Stock</th>
            <th className="p-3 text-left">Recent Procured Date</th>
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
              <tr key={`consolidated-${item.id}-${item.predefined_item_id}`} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{getCategoryLabel(item.mainCategory, item.subcategory)}</td>
                <td className="p-3">
                  <span className="font-medium">
                    {item.quantity} {item.unit}
                  </span>
                </td>
                <td className="p-3">{item.harvestDate ? formatDate(item.harvestDate) : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

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
            const itemHistory = data.history.filter((h: any) =>
              h.predefined_item_id === item.predefined_item_id
            );

            const entriesWithDates = itemHistory
              .filter((h: any) => h.harvestDate && h.harvestDate.trim() !== "")
              .sort((a: any, b: any) =>
                new Date(b.harvestDate || "").getTime() - new Date(a.harvestDate || "").getTime()
              );

            if (entriesWithDates.length > 0) {
              return {
                ...item,
                harvestDate: entriesWithDates[0].harvestDate,
              };
            }

            const addEntries = itemHistory
              .filter((h: any) => h.changeType === "add")
              .sort((a: any, b: any) =>
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <InventoryTable items={items} categories={categories} />
    </div>
  );
};

export default UserView;
