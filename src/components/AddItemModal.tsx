import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Category, Unit, PredefinedItem, HistoryEntry } from '../types';
import { checkItemExists } from '../utils/inventoryUtils';
import { API_BASE_URL } from '../config/api';
import { showToast, showConfirmation } from '../utils/toastUtils';

interface AddItemModalProps {
  categories: Category;
  onClose: () => void;
  onAddItem: (entry: HistoryEntry) => void;
}
const AddItemModal: React.FC<AddItemModalProps> = ({ categories, onClose, onAddItem }) => {
  const transformedCategories: Category = categories || {};

  const [mainCategory, setMainCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>('kg');
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
      setUnit(selectedItem.unit);    } else {
      setName('');
      setUnit('kg');
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
      showToast.warning("Missing Information", "Please enter an item name.");
      setIsSubmitting(false);
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      showToast.warning("Invalid Quantity", "Please enter a valid quantity.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if the item exists in predefined_items (categories is now required)
      if (!categories || Object.keys(categories).length === 0) {
        showToast.error('Categories Not Loaded', 'Categories not loaded. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const existing = await checkItemExists(name, mainCategory, subcategory, categories);

      console.log('Categories structure:', categories);
      console.log('Selected mainCategory:', mainCategory);
      console.log('Selected subcategory:', subcategory);
      console.log('Categories[mainCategory]:', categories[mainCategory]);
      console.log('Subcategories:', categories[mainCategory]?.subcategories);
      console.log('Selected subcategory data:', categories[mainCategory]?.subcategories?.[subcategory]);
      console.log('Check item exists result:', existing);

      if (!existing || !existing.id) {
        // Item doesn't exist in predefined_items, so create it first
        try {
          const main_category_id = categories[mainCategory].id;
          const subcat_id = categories[mainCategory].subcategories[subcategory].id;
          
          console.log('Creating predefined item:', { main_category_id, subcat_id, name, unit });
          
          const createResponse = await axios.post(`${API_BASE_URL}/add_predefined_item.php`, {
            main_category_id: Number(main_category_id),
            subcat_id: Number(subcat_id),
            name,
            unit
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });

          if (!createResponse.data.success) {
            showToast.error("Creation Failed", `Failed to create predefined item: ${createResponse.data.message}`);
            setIsSubmitting(false);
            return;
          }
          
          // Now use the newly created predefined item ID
          const predefinedItemId = createResponse.data.id;
          
          // Get user data for action logging
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;
          
          // Prepare the payload for the backend
          const payload = {
            predefined_item_id: Number(predefinedItemId),
            quantity: Number(quantity),
            harvest_date: harvestDate,
            notes: notes || '',
            user_id: user?.id
          };

          console.log('Sending payload with new predefined item:', payload);

          // Send the payload to the backend
          const response = await axios.post(`${API_BASE_URL}/add_item.php`, payload, {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          });

          // Handle the backend response
          if (response.data.success) {
            showToast.success("Item Created!", "Item created and added successfully!");

            // Add the new history entry to the history view
            onAddItem({
              id: response.data.id,
              name,
              mainCategory,
              subcategory,
              quantity: Number(quantity),
              unit,
              harvestDate: harvestDate,
              notes,
              predefined_item_id: predefinedItemId,
              changeType: "add",
              date: new Date().toISOString()
            });

            // Close the modal
            onClose();
          } else {
            showToast.error("Failed to Add Item", response.data.message || "Failed to add item.");
          }
          
        } catch (createError) {
          console.error("Error creating predefined item:", createError);
          showToast.error("Creation Error", "Failed to create predefined item. Please try again.");
        }
      } else {
        // Item exists in predefined_items, proceed normally
        if (existing.unit !== unit) {
          showToast.warning("Unit Mismatch", `The item "${name}" already exists with unit "${existing.unit}".`);
          setIsSubmitting(false);
          return;
        }

        // Get user data for action logging
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;

        // Prepare the payload for the backend
        const payload = {
          predefined_item_id: Number(existing.id),
          quantity: Number(quantity),
          harvest_date: harvestDate,
          notes: notes || '',
          user_id: user?.id
        };

        console.log('Sending payload:', payload);

        // Send the payload to the backend
        const response = await axios.post(`${API_BASE_URL}/add_item.php`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        // Handle the backend response
        if (response.data.success) {
          showToast.success("Item Added!", "Item added successfully!");

          // Add the new history entry to the history view
          onAddItem({
            id: response.data.id,
            name,
            mainCategory,
            subcategory,
            quantity: Number(quantity),
            unit,
            harvestDate: harvestDate,
            notes,
            predefined_item_id: existing.id,
            changeType: "add",
            date: new Date().toISOString()
          });

          // Close the modal
          onClose();
        } else {
          showToast.error("Failed to Add Item", response.data.message || "Failed to add item.");
        }
      }
    } catch (error) {
      console.error("Error adding item:", error);
      showToast.error("Error", "An error occurred while adding the item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
        <button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 pr-8">Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Main Category:
              </label>
              <select
                id="mainCategory"
                className="w-full p-2 sm:p-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm sm:text-base"
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
                className="w-full p-2 sm:p-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm sm:text-base"
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
                  className="w-full p-2 sm:p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 mb-2 text-sm sm:text-base"
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
              <input
                type="text"
                id="itemName"
                className="w-full p-2 sm:p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm sm:text-base"
                placeholder="Enter item name or select above"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {showPredefinedItems && (
                <p className="text-xs sm:text-sm text-teal-700 italic mt-1">
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
                className="w-full p-2 sm:p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm sm:text-base"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit:
              </label>
              <div className="flex gap-4 sm:gap-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="unit"
                    value="kg"
                    checked={unit === 'kg'}
                    onChange={() => setUnit('kg')}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2 text-sm sm:text-base">kg</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="unit"
                    value="pcs"
                    checked={unit === 'pcs'}
                    onChange={() => setUnit('pcs')}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2 text-sm sm:text-base">pcs</span>
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
                className="w-full p-2 sm:p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-sm sm:text-base"
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
                className="w-full p-2 sm:p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base"
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#8a9b6e] hover:bg-[#7a8b5e] disabled:bg-gray-400 text-white py-2 sm:py-2 px-4 rounded-lg transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {isSubmitting ? "Adding..." : "Add Item"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 bg-[#b85c57] hover:bg-[#a54c47] text-white py-2 sm:py-2 px-4 rounded-lg transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg"
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