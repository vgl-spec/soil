import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ConsolidatedItem, HistoryEntry } from '../types';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { showToast } from '../utils/toastUtils';

interface IncreaseStockModalProps {
  item: ConsolidatedItem;
  onClose: () => void;
  onIncreaseStock: (entry: HistoryEntry) => void;
}

const IncreaseStockModal: React.FC<IncreaseStockModalProps> = ({ item, onClose, onIncreaseStock }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [harvestDate, setHarvestDate] = useState<string>(
    item.harvestDate ? new Date(item.harvestDate).toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0]
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(quantity) || quantity <= 0) {
      showToast.warning("Invalid Quantity", "Please enter a valid quantity.");
      return;
    }

    if (!harvestDate) {
      showToast.warning("Missing Date", "Please enter a valid harvest date.");
      return;
    }

    // Retrieve user_id from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (!userId) {
      showToast.error("Authentication Error", "User not authenticated. Please log in again.");
      return;
    }

    // Use the predefined_item_id from the item object
    const predefinedItemId = item.predefined_item_id || 0;

    const historyEntry: HistoryEntry = {
      id: Date.now(),
      name: item.name,
      mainCategory: item.mainCategory,
      subcategory: item.subcategory,
      quantity: quantity,
      unit: item.unit,
      harvestDate: harvestDate,
      notes: reason || "Stock increased",
      changeType: 'increase',
      predefined_item_id: predefinedItemId,
      date: new Date().toISOString(), // <-- Add this line
    };

    console.log("historyEntry:", historyEntry); // Debug log

    const payload = {
      itemId: item.id, // Pass the item ID
      quantity: quantity, // Positive quantity for increasing stock
      notes: reason || "Stock increased", // Reason for increasing stock
      userId: userId, // Pass the user ID
      predefinedItemId: predefinedItemId, // Pass the predefined_item_id
      harvestDate: harvestDate, // Pass the new harvest date
    };

    console.log("Payload being sent:", payload);

    // API call to increase stock and update the database
    axios.post(`${API_BASE_URL}/increase_stock.php`, payload)
      .then(() => {
        onIncreaseStock(historyEntry);
        onClose();
      })
      .catch((err) => console.error("Error increasing stock:", err));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 relative max-h-[95vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 pr-8">Increase Stock</h2>
        
        <div className="mb-4">
          <p className="font-medium text-base sm:text-lg">{item.name}</p>
          <p className="text-gray-600 text-sm sm:text-base">Current Stock: {item.quantity} {item.unit}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="increaseQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Increase:
              </label>
              <input
                type="number"
                id="increaseQuantity"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm sm:text-base"
                min="1"
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+/, '');
                  let parsed = parseInt(raw) || 0;
                  setQuantity(parsed);
                }}
              />
            </div>
            
            <div>
              <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Date:
              </label>
              <input
                type="date"
                id="harvestDate"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm sm:text-base"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="increaseReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason:
              </label>
              <textarea
                id="increaseReason"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                placeholder="Why are you increasing the stock? (e.g., restocked, returned, etc.)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            
            <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="submit"
                className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                Increase Stock
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
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

export default IncreaseStockModal;