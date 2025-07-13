import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { showToast, showConfirmation } from '../utils/toastUtils';

interface ManageCategoriesModalProps {
  categories: any;
  onClose: () => void;
  onUpdateCategories: (categories: any) => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  categories,
  onClose,
  onUpdateCategories,
}) => {
  // Initialize state with the categories prop
  const [workingCategories, setWorkingCategories] = useState(categories || {});
  const [categoryType, setCategoryType] = useState<string>(() => {
    const keys = Object.keys(categories || {});
    return keys.length > 0 ? keys[0] : "";
  });
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("kg");

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [categoryType]);

  // Simple update when categories prop changes - no complex validation
  useEffect(() => {
    if (categories) {
      setWorkingCategories(categories);
    }
  }, [categories]);

  // Function to refresh categories from server
  const refreshCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories.php`, {
        withCredentials: true,
      });
      const freshCategories = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
      setWorkingCategories(freshCategories);
      onUpdateCategories(freshCategories);
      
      // Reset selections if current category/subcategory no longer exists
      if (!freshCategories[categoryType]) {
        const firstCategory = Object.keys(freshCategories)[0] || "";
        setCategoryType(firstCategory);
        setSelectedSubcategory(null);
      } else if (selectedSubcategory && !freshCategories[categoryType]?.subcategories?.[selectedSubcategory]) {
        setSelectedSubcategory(null);
      }
    } catch (error) {
      console.error("Error refreshing categories:", error);
    }
  };

  // Handle adding a new subcategory
  const handleAddSubcategory = async () => {
    console.log(
      "Attempting to add subcategory:",
      newSubcategoryName,
      "to category:",
      categoryType
    );

    if (!newSubcategoryName.trim()) {
      showToast.warning("Missing Information", "Please enter a subcategory name.");
      return;
    }
    if (!workingCategories[categoryType]) {
      showToast.error("Invalid Category", "Selected category type does not exist.");
      return;
    }
    // Generate a key for the new subcategory
    const key = newSubcategoryName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (workingCategories[categoryType].subcategories[key]) {
      showToast.warning("Duplicate Subcategory", "A subcategory with this name already exists.");
      return;
    }
    console.log(
      "Category object for",
      categoryType,
      workingCategories[categoryType]
    );
    const main_category_id = workingCategories[categoryType].id;
    const name = key;
    const label = newSubcategoryName;
    const unit = "kg"; // or let user select

    try {
      console.log("Sending request to add_subcategory.php with:", {
        main_category_id,
        name,
        label,
        unit,
      });
      const response = await axios.post(
        `${API_BASE_URL}/add_subcategory.php`,
        {
          main_category_id,
          name,
          label,
          unit,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Response from add_subcategory.php:", response.data);

      if (response.data.success) {
        // Add to local state for immediate UI update
        const updatedCategories = { ...workingCategories };
        updatedCategories[categoryType].subcategories[key] = {
          id: response.data.id,
          label: newSubcategoryName,
          unit,
          predefinedItems: [],
        };
        setWorkingCategories(updatedCategories);
        setNewSubcategoryName("");
        showToast.success("Subcategory Added!", "Subcategory added successfully!");
        console.log(
          "Subcategory added to local state:",
          updatedCategories[categoryType].subcategories[key]
        );
      } else {
        showToast.error("Failed to Add Subcategory", response.data.message || "Failed to add subcategory.");
      }
    } catch (error) {
      showToast.error("Error", "Error adding subcategory.");
      console.error("Error from add_subcategory.php:", error);
    }
  };

  // Handle adding a predefined item
  const handleAddPredefinedItem = async () => {
    if (!selectedSubcategory || 
        !workingCategories[categoryType] || 
        !workingCategories[categoryType].subcategories ||
        !workingCategories[categoryType].subcategories[selectedSubcategory]) {
      showToast.warning("Invalid Selection", "Please select a valid subcategory.");
      return;
    }

    if (!newItemName.trim()) {
      showToast.warning("Missing Information", "Please enter an item name.");
      return;
    }

    const items =
      workingCategories[categoryType].subcategories[selectedSubcategory]
        .predefinedItems || [];
    const existingItem = items.find(
      (item: any) =>
        item.name.toLowerCase() === newItemName.toLowerCase()
    );

    if (existingItem) {
      if (existingItem.unit !== newItemUnit) {
        showToast.warning(
          "Unit Mismatch",
          `This item already exists with unit "${existingItem.unit}". You cannot add the same item with a different unit.`
        );
        return;
      }
      showToast.warning("Duplicate Item", "This item already exists.");
      return;
    }

    if (items.length >= 100) {
      showToast.warning("Limit Reached", "This category has reached the maximum limit of 100 items.");
      return;
    }

    // Prepare API payload
    const main_category_id = workingCategories[categoryType].id;
    const subcat_id = workingCategories[categoryType].subcategories[selectedSubcategory].id;
    const name = newItemName.trim();
    const unit = newItemUnit;

    if (!main_category_id || !subcat_id) {
      showToast.error("Invalid Selection", "Invalid category or subcategory selected. Please refresh and try again.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/add_predefined_item.php`,
        {
          main_category_id: Number(main_category_id),
          subcat_id: Number(subcat_id),
          name,
          unit,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Add to local state for immediate UI update, including the ID from server
        const updatedCategories = { ...workingCategories };
        const newItem = {
          id: response.data.id,
          name: newItemName,
          unit: newItemUnit,
        };
        
        updatedCategories[categoryType].subcategories[
          selectedSubcategory
        ].predefinedItems.push(newItem);

        setWorkingCategories(updatedCategories);
        setNewItemName("");
        showToast.success("Item Added!", "Predefined item added successfully!");
      } else {
        showToast.error("Failed to Add Item", response.data.message || "Failed to add predefined item.");
      }
    } catch (error: any) {
      let errorMessage = "Error adding predefined item.";
      if (error.response?.data?.message) {
        errorMessage += " " + error.response.data.message;
      }
      showToast.error("Error", errorMessage);
    }
  };

  // Handle deleting a predefined item
  const handleDeletePredefinedItem = async (index: number) => {
    if (!selectedSubcategory || 
        !workingCategories[categoryType] ||
        !workingCategories[categoryType].subcategories ||
        !workingCategories[categoryType].subcategories[selectedSubcategory] ||
        !workingCategories[categoryType].subcategories[selectedSubcategory].predefinedItems) {
      showToast.error("Delete Error", "Cannot delete item: Invalid category state.");
      return;
    }

    const item = workingCategories[categoryType].subcategories[selectedSubcategory].predefinedItems[index];
    
    if (!item || !item.id) {
      showToast.error("Delete Error", "Cannot delete item: Item ID not found.");
      return;
    }

    // Get current user for logging
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    console.log("Current user for deletion:", user);
    console.log("User ID for deletion:", userId);

    const confirmResult = await showConfirmation.delete(item.name);
    if (!confirmResult.isConfirmed) return;

    try {
      // First try without force delete
      let response = await axios.post(
        `${API_BASE_URL}/delete_predefined_item.php`,
        { 
          predefined_item_id: item.id,
          user_id: userId // Add user_id for action logging
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // If deletion failed due to references, ask for force delete confirmation
      if (!response.data.success && response.data.message && response.data.message.includes("being used in the system")) {
        const forceConfirmResult = await showConfirmation.action(
          "Force Delete Required",
          `${response.data.message}<br><br>Do you want to force delete this item? This will remove all references and cannot be undone.`,
          "Force Delete"
        );
        
        if (forceConfirmResult.isConfirmed) {
          // Try again with force delete
          response = await axios.post(
            `${API_BASE_URL}/delete_predefined_item.php`,
            { 
              predefined_item_id: item.id,
              user_id: userId, // Add user_id for action logging
              force_delete: true
            },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
        } else {
          return; // User cancelled force delete
        }
      }

      if (response.data.success) {
        // Remove from local state for immediate UI update
        const updatedCategories = { ...workingCategories };
        updatedCategories[categoryType].subcategories[
          selectedSubcategory
        ].predefinedItems.splice(index, 1);
        setWorkingCategories(updatedCategories);
        
        showToast.success("Item Deleted!", "Item deleted successfully!");
        
        // Refresh categories from server to ensure consistency
        // This will reflect any changes to inventory items that were affected
        await refreshCategories();
      } else {
        showToast.error("Delete Failed", `Failed to delete item: ${response.data.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error deleting predefined item:", error);
      showToast.error("Delete Error", `Error deleting item: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle saving changes
  const handleSave = () => {
    onUpdateCategories(workingCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <h2 className="text-xl font-semibold mb-6 pr-8">Manage Categories</h2>
        
        {/* Show loading message if no categories are available */}
        {(!workingCategories || Object.keys(workingCategories).length === 0) ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No categories loaded yet. Please wait...</p>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Main Category</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
              >
                {Object.keys(workingCategories).map((cat) => (
                  <option key={cat} value={cat}>
                    {workingCategories[cat]?.label || cat}
                  </option>
                ))}
              </select>
            </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Subcategories</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={selectedSubcategory || ""}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
          >
            <option value="">-- Select Subcategory --</option>
            {workingCategories[categoryType] && workingCategories[categoryType].subcategories ? (
              Object.keys(workingCategories[categoryType].subcategories).map(
                (sub) => (
                  <option key={sub} value={sub}>
                    {workingCategories[categoryType].subcategories[sub].label}
                  </option>
                )
              )
            ) : (
              <option disabled>No subcategories available</option>
            )}
          </select>
        </div>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1 flex-1"
            placeholder="New Subcategory Name"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
          />
          <button
            onClick={handleAddSubcategory}
            className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800"
          >
            Add Subcategory
          </button>
        </div>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1 flex-1"
            placeholder="New Predefined Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            disabled={!selectedSubcategory}
          />
          <select
            className="border rounded px-2 py-1"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            disabled={!selectedSubcategory}          >
            <option value="kg">kg</option>
            <option value="pcs">pcs</option>
          </select>
          <button
            onClick={handleAddPredefinedItem}
            className="bg-blue-700 text-white px-3 py-2 rounded hover:bg-blue-800"
            disabled={!selectedSubcategory}
          >
            Add Predefined Item
          </button>
        </div>
        {selectedSubcategory && 
         workingCategories[categoryType] && 
         workingCategories[categoryType].subcategories && 
         workingCategories[categoryType].subcategories[selectedSubcategory] && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Predefined Items in {workingCategories[categoryType].subcategories[selectedSubcategory].label}
            </label>
            <ul>
              {workingCategories[categoryType].subcategories[selectedSubcategory].predefinedItems?.map(
                (item: any, idx: number) => (
                  <li key={idx} className="flex items-center justify-between border-b py-1">
                    <span>
                      {item.name} ({item.unit})
                    </span>
                    <button
                      onClick={() => handleDeletePredefinedItem(idx)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </li>
                )
              ) || <li className="text-gray-500 italic">No predefined items</li>}
            </ul>
          </div>
        )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800"
              >
                Save Changes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
