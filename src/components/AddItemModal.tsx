import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Category, Unit, PredefinedItem, HistoryEntry } from '../types';
import { checkItemExists } from '../utils/inventoryUtils';

interface AddItemModalProps {
  categories: Category;
  onClose: () => void;
  onAddItem: (entry: HistoryEntry) => void;
}
const API_BASE = 'https://soil-3tik.onrender.com/API/';
const AddItemModal: React.FC<AddItemModalProps> = ({ categories, onClose, onAddItem }) => {
  const transformedCategories: Category = categories || {};

  const [mainCategory, setMainCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>('Kg');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [predefinedItems, setPredefinedItems] = useState<PredefinedItem[]>([]);
  const [showPredefinedItems, setShowPredefinedItems] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const keys = Object.keys(transformedCategories);
    if (keys.length > 0 && !mainCategory) {
      setMainCategory(keys[0]);
    }
  }, [transformedCategories]);

  useEffect(() => {
    const subKeys = Object.keys(transformedCategories?.[mainCategory]?.subcategories || {});
    if (subKeys.length > 0) {
      setSubcategory(subKeys[0]);
    }
  }, [mainCategory, transformedCategories]);

  useEffect(() => {
    const items = transformedCategories?.[mainCategory]?.subcategories?.[subcategory]?.predefinedItems || [];
    setPredefinedItems(items);
    setShowPredefinedItems(items.length > 0);
  }, [mainCategory, subcategory]);

  const handlePredefinedItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      const selectedItem = JSON.parse(e.target.value);
      setName(selectedItem.name);
      setUnit(selectedItem.unit);
    } else {
      setName('');
      setUnit('Kg');
    }
  };

  // Handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate input fields
    if (!name.trim()) {
      alert("Please enter an item name.");
      setIsSubmitting(false);
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      setIsSubmitting(false);
      return;
    }    try {
      // Check if the item exists in predefined_items (categories is now required)
      if (!categories || Object.keys(categories).length === 0) {
        alert('Categories not loaded. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const existing = await checkItemExists(name, mainCategory, subcategory, categories);

      if (!existing || !existing.id) {
        alert('This item does not exist in predefined items. Please add it as a predefined item first.');
        setIsSubmitting(false);
        return;
      }
      if (existing.unit !== unit) {
        alert(`The item "${name}" already exists with unit "${existing.unit}".`);
        setIsSubmitting(false);
        return;
      }

      // Prepare the payload for the backend
      const payload = {
        predefined_item_id: Number(existing.id),
        quantity: Number(quantity),
        harvest_date: harvestDate,
        notes: notes || ''
      };

      console.log('Sending payload:', payload);

      // Send the payload to the backend
      const response = await axios.post('https://soil-3tik.onrender.com/API/add_item.php', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include credentials if needed
      });

      // Handle the backend response
      if (response.data.success) {
        alert("Item added or updated successfully!");

        // Add the new history entry to the history view
        onAddItem({
          id: response.data.id, // Use the ID returned from the backend
          name,
          mainCategory,
          subcategory,
          quantity: Number(quantity),
          unit,
          harvestDate: harvestDate,
          notes,
          predefined_item_id: existing.id,
          changeType: "add",
          date: new Date().toISOString() // Use the current timestamp
        });

        // Close the modal
        onClose();
      } else {
        alert(response.data.message || "Failed to add item.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("An error occurred while adding the item. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the submit button
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-6 pr-8">Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Main Category:
              </label>
              <select
                id="mainCategory"
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
              >
                {Object.keys(transformedCategories).map((key) => (
                  <option key={key} value={key}>
                    {transformedCategories[key]?.label || key}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory:
              </label>
              <select
                id="subcategory"
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              >
                {mainCategory && transformedCategories?.[mainCategory]?.subcategories &&
                  Object.keys(transformedCategories[mainCategory].subcategories).map((key) => (
                    <option key={key} value={key}>
                      {transformedCategories[mainCategory].subcategories[key]?.label || key}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name:
              </label>
              {showPredefinedItems && (
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 mb-2"
                  onChange={handlePredefinedItemSelect}
                  defaultValue=""
                >
                  <option value="">-- Select Item --</option>
                  {predefinedItems.map((item, index) => (
                    <option 
                      key={index} 
                      value={JSON.stringify({name: item.name, unit: item.unit})}
                    >
                      {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              )}
              {showPredefinedItems && (
                <p className="text-sm text-teal-700 italic mt-1">
                  You can enter a new item or select from predefined items
                </p>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                min="1"
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => {
                  const raw = e.target.value.replace(/^0+/, '');
                  let parsed = parseInt(raw) || 0;
                  if (parsed > 99) parsed = parseInt(raw.slice(0, 2));
                  setQuantity(parsed);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit:
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="unit"
                    value="Kg"
                    checked={unit === 'Kg'}
                    onChange={() => setUnit('Kg')}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2">Kg</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="unit"
                    value="Pcs"
                    checked={unit === 'Pcs'}
                    onChange={() => setUnit('Pcs')}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2">Pcs</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">
                Harvest/Produced Date:
              </label>
              <input
                type="date"
                id="harvestDate"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes:
              </label>
              <textarea
                id="notes"
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 min-h-[80px]"
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add Item"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
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

export default AddItemModal;