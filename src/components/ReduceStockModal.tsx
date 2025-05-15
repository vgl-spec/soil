import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ConsolidatedItem, HistoryEntry } from '../types';
import axios from 'axios';

interface ReduceStockModalProps {
  item: ConsolidatedItem;
  onClose: () => void;
  onReduceStock: (entry: HistoryEntry) => void;
}

const ReduceStockModal: React.FC<ReduceStockModalProps> = ({ item, onClose, onReduceStock }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [harvestDate, setHarvestDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]; // Always default to today's date
  });

  console.log("Item harvest date:", item.harvestDate);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (quantity > item.quantity) {
      alert("Cannot reduce more than the current stock.");
      return;
    }

    // Retrieve user_id from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (!userId) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    // Use the predefined_item_id from the item object
    const predefinedItemId = item.predefined_item_id || 0;

    const historyEntry: HistoryEntry = {
      id: Date.now(), // Unique id for this action
      name: item.name,
      mainCategory: item.mainCategory,
      subcategory: item.subcategory,
      quantity: -quantity,
      unit: item.unit,
      harvestDate: String(item.harvestDate || ''),
      notes: reason || "Stock reduced",
      changeType: 'reduce',
      predefined_item_id: predefinedItemId,
      date: new Date().toISOString(), // <-- Add this line for action timestamp
    };

    const payload = {
      itemId: item.id,
      quantity: -quantity,
      notes: reason || "Stock reduced",
      userId: userId,
      predefinedItemId: predefinedItemId,
      harvestDate: new Date().toISOString().split('T')[0], // Use today's date
    };

    console.log("Payload being sent:", payload);

    // API call to reduce stock and update the database
    axios.post('https://soil-3tik.onrender.com/soil/API/reduce_stock.php', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include credentials if needed
    })
      .then((response) => {
        if (response.data && response.data.success) {
          console.log("Stock reduced successfully:", response.data);
          onReduceStock(historyEntry); // Add a new row in the history
          onClose();
        } else {
          console.error("Failed to reduce stock:", response.data.message || "Unknown error");
          alert(response.data.message || "Failed to reduce stock. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Error reducing stock:", err);
        alert("An error occurred while reducing stock. Please try again.");
      });
  };

  const handleViewHistory = (item: ConsolidatedItem) => {
    const itemHistory = historyEntries.filter(
      (entry) => entry.predefined_item_id === item.predefined_item_id
    );
    setSelectedItem(item);
    setShowHistoryModal(true);
    setSelectedHistory(itemHistory); // Pass the filtered history entries
  };

  // Return the JSX structure
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-6 pr-8">Reduce Stock</h2>
        
        <div className="mb-4">
          <p className="font-medium text-lg">{item.name}</p>
          <p className="text-gray-600">Current Stock: {item.quantity} {item.unit}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="reduceQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Reduce:
              </label>
              <input
                type="number"
                id="reduceQuantity"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                min="1"
                max={item.quantity}
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+/, '');
                  let parsed = parseInt(raw) || 0;
                  if (parsed > item.quantity) parsed = item.quantity;
                  setQuantity(parsed);
                }}
              />
            </div>
            
            <div>
              <label htmlFor="reduceReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason:
              </label>
              <textarea
                id="reduceReason"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 min-h-[100px]"
                placeholder="Why are you reducing the stock? (e.g., sold, damaged, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            
            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Reduce Stock
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReduceStockModal;