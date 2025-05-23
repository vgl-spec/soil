import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InventoryTable from "../components/InventoryTable";
import { ConsolidatedItem, Category, ViewMode } from "../types";

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
          <main className="flex-1 p-6 flex flex-col overflow-auto">
            <InventoryTable
              items={items}
              categories={categories}
              viewMode={"consolidated" as ViewMode}
              onIncreaseStock={() => {}}
              onReduceStock={() => {}}
              onViewHistory={() => {}}
            />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserView;
