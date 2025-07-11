import React from 'react';
import { History } from 'lucide-react';
import { ConsolidatedItem, HistoryEntry, Category, ViewMode } from '../types';
import { getCategoryLabel } from '../utils/inventoryUtils';

// Add this function to safely format dates
const safeFormatDate = (date: string | number | null | undefined) => {
  if (!date) return "-";
  const dateValue = typeof date === 'number' ? new Date(date) : new Date(date);
  return dateValue.toLocaleDateString();
};

const formatDate = (date: string | null | undefined) => {
  if (!date || date === "0000-00-00") return "-"; // Handle invalid dates
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
  onReduceStock: (item: ConsolidatedItem) => void;
  onIncreaseStock: (item: ConsolidatedItem) => void;
  onViewHistory: (item: ConsolidatedItem) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  categories,
  viewMode,
  onIncreaseStock,
  onReduceStock,
  onViewHistory
}) => {
  const itemsArray = Array.isArray(items) ? items : [];

  // Debug logging
  React.useEffect(() => {
    console.log('Categories structure:', categories);
    if (itemsArray.length > 0) {
      const firstItem = itemsArray[0];
      console.log('First item:', firstItem);
      if (viewMode === 'consolidated') {
        const item = firstItem as ConsolidatedItem;
        console.log('Item mainCategory:', item.mainCategory, 'subcategory:', item.subcategory);
        console.log('Category lookup result:', getCategoryLabel(categories, item.mainCategory, item.subcategory));
      }
    }
  }, [categories, itemsArray, viewMode]);

  // useEffect(() => {
  //   console.log('All items:', itemsArray);
  //   if (viewMode === 'consolidated') {
  //     console.log('Consolidated items:', itemsArray.map(item => ({
  //       name: item.name,
  //       harvestDate: item.harvestDate,
  //       raw: item
  //     })));
  //   }
  // }, [itemsArray, viewMode]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-green-700 text-white">
          <tr>
            {viewMode === 'consolidated' ? (
              <>
                <th className="p-3 text-left">Item Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Current Stock</th>
                <th className="p-3 text-left">Recent Procured Date</th>
                <th className="p-3 text-left">Actions</th>
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
                colSpan={viewMode === 'consolidated' ? 5 : 6}
                className="p-4 text-center text-gray-500 border border-gray-200"
              >
                No items found
              </td>
            </tr>
          ) : (
            viewMode === 'consolidated' ? (
              // Consolidated view
              (itemsArray as ConsolidatedItem[]).map((item) => (
                <tr
                  key={`consolidated-${item.id}-${item.predefined_item_id}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{getCategoryLabel(categories, item.mainCategory, item.subcategory)}</td>
                  <td className="p-3">
                    <span className="font-medium">{item.quantity} {item.unit}</span>
                  </td>
                  <td className="p-3">
                    {item.harvestDate ? formatDate(item.harvestDate) : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onIncreaseStock(item)}
                        className="bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-800 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => onReduceStock(item)}
                        className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors"
                      >
                        Reduce
                      </button>
                      <button
                        onClick={() => onViewHistory(item)}
                        className="bg-teal-700 text-white px-3 py-1 rounded text-sm hover:bg-teal-800 transition-colors flex items-center gap-1"
                      >
                        <History className="h-3 w-3" />
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // History view
              (itemsArray as HistoryEntry[]).map((entry, index) => (
                <tr
                  key={`history-${entry.id}-${entry.date}-${index}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{safeFormatDate(entry.date)}</td>
                  <td className="p-3">{entry.name}</td>
                  <td className="p-3">{getCategoryLabel(categories, entry.mainCategory, entry.subcategory)}</td>
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
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;