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
    <div className="h-full flex flex-col">
      {/* Mobile Card View for small screens */}
      <div className="block sm:hidden overflow-y-auto flex-1">
        {itemsArray.length === 0 ? (
          <div className="p-4 text-center text-gray-500 border border-gray-200 rounded">
            No items found
          </div>
        ) : (
          <div className="space-y-3">
            {viewMode === 'consolidated' ? (
              // Mobile Consolidated Cards
              (itemsArray as ConsolidatedItem[]).map((item) => (
                <div
                  key={`consolidated-${item.id}-${item.predefined_item_id}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{getCategoryLabel(categories, item.mainCategory, item.subcategory)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Procured Date:</span>
                      <span className="text-gray-900">{item.harvestDate ? formatDate(item.harvestDate) : "-"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onIncreaseStock(item)}
                        className="flex-1 bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-3 py-2 rounded text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Add Stock
                      </button>
                      <button
                        onClick={() => onReduceStock(item)}
                        className="flex-1 bg-[#b85c57] hover:bg-[#a54c47] text-white px-3 py-2 rounded text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Reduce Stock
                      </button>
                    </div>
                    <button
                      onClick={() => onViewHistory(item)}
                      className="w-full bg-teal-700 text-white px-3 py-2 rounded text-sm hover:bg-teal-800 transition-colors flex items-center justify-center gap-1"
                    >
                      <History className="h-4 w-4" />
                      View History
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Mobile History Cards
              (itemsArray as HistoryEntry[]).map((entry, index) => (
                <div
                  key={`history-${entry.id}-${entry.date}-${index}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{entry.name}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      entry.quantity > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.quantity > 0 ? '+' : ''}{entry.quantity} {entry.unit}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{safeFormatDate(entry.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{getCategoryLabel(categories, entry.mainCategory, entry.subcategory)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Procured Date:</span>
                      <span className="text-gray-900">{formatDate(entry.harvestDate)}</span>
                    </div>
                    {entry.notes && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Notes:</span>
                        <span className="text-gray-900">{entry.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Desktop Table View for larger screens */}
      <div className="hidden sm:flex flex-col h-full overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
        <thead className="bg-[#8a9b6e] text-white">
          <tr>
            {viewMode === 'consolidated' ? (
              <>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Item Name</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Category</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Current Stock</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Recent Procured Date</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Actions</th>
              </>
            ) : (
              <>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Date</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Item Name</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Category</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Quantity Change</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Procured Date</th>
                <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">Notes</th>
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
              // Desktop Consolidated view
              (itemsArray as ConsolidatedItem[]).map((item) => (
                <tr
                  key={`consolidated-${item.id}-${item.predefined_item_id}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{item.name}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{getCategoryLabel(categories, item.mainCategory, item.subcategory)}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    <span className="font-medium">{item.quantity} {item.unit}</span>
                  </td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    {item.harvestDate ? formatDate(item.harvestDate) : "-"}
                  </td>
                  <td className="p-2 sm:p-3">
                    <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                      <button
                        onClick={() => onIncreaseStock(item)}
                        className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => onReduceStock(item)}
                        className="bg-amber-600 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm hover:bg-amber-700 transition-colors whitespace-nowrap"
                      >
                        Reduce
                      </button>
                      <button
                        onClick={() => onViewHistory(item)}
                        className="bg-teal-700 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm hover:bg-teal-800 transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <History className="h-3 w-3" />
                        <span className="hidden lg:inline">History</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Desktop History view
              (itemsArray as HistoryEntry[]).map((entry, index) => (
                <tr
                  key={`history-${entry.id}-${entry.date}-${index}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{safeFormatDate(entry.date)}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{entry.name}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{getCategoryLabel(categories, entry.mainCategory, entry.subcategory)}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
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
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatDate(entry.harvestDate)}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{entry.notes || "-"}</td>
                </tr>
              ))
            )
          )}
        </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;