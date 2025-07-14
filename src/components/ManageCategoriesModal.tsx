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

  // Handle deleting a subcategory
  const handleDeleteSubcategory = async (subcategoryKey: string) => {
    if (!workingCategories[categoryType] ||
        !workingCategories[categoryType].subcategories ||
        !workingCategories[categoryType].subcategories[subcategoryKey]) {
      showToast.error("Delete Error", "Cannot delete subcategory: Invalid category state.");
      return;
    }

    const subcategory = workingCategories[categoryType].subcategories[subcategoryKey];
    const subcategoryLabel = subcategory.label || subcategoryKey;

    // Get current user for logging
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    const confirmResult = await showConfirmation.delete(subcategoryLabel);
    if (!confirmResult.isConfirmed) return;

    try {
      let response = await axios.post(
        `${API_BASE_URL}/delete_subcategory.php`,
        { 
          subcategory_id: subcategory.id,
          user_id: userId // Add user_id for action logging
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // If deletion failed due to references, ask for force delete confirmation
      if (!response.data.success && response.data.message && 
          (response.data.message.includes("being used") || response.data.message.includes("references"))) {
        const forceConfirmResult = await showConfirmation.action(
          "Force Delete Required",
          `${response.data.message}<br><br>Do you want to force delete this subcategory? This will remove all predefined items and references and cannot be undone.`,
          "Force Delete"
        );
        
        if (forceConfirmResult.isConfirmed) {
          // Try again with force delete
          response = await axios.post(
            `${API_BASE_URL}/delete_subcategory.php`,
            { 
              subcategory_id: subcategory.id,
              user_id: userId,
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
        delete updatedCategories[categoryType].subcategories[subcategoryKey];
        setWorkingCategories(updatedCategories);
        
        // If the deleted subcategory was selected, clear the selection
        if (selectedSubcategory === subcategoryKey) {
          setSelectedSubcategory("");
        }
        
        showToast.success("Subcategory Deleted!", `${subcategoryLabel} has been deleted successfully.`);
      } else {
        showToast.error("Failed to Delete Subcategory", response.data.message || "Failed to delete subcategory.");
      }
    } catch (error: any) {
      console.error("Error deleting subcategory:", error);
      let errorMessage = "Error deleting subcategory.";
      if (error.response?.data?.message) {
        errorMessage += " " + error.response.data.message;
      }
      showToast.error("Error", errorMessage);
    }
  };

  // Handle saving changes
  const handleSave = () => {
    onUpdateCategories(workingCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-[#8a9b6e]">Manage Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {(!workingCategories || Object.keys(workingCategories).length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No categories loaded yet. Please wait...</p>
              <button
                onClick={onClose}
                className="bg-[#b85c57] hover:bg-[#a54c47] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Main Category</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#8a9b6e] focus:border-transparent"
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

              {/* Subcategory Management */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8a9b6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Subcategories
                </h3>

                {/* Add New Subcategory */}
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Subcategory</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#8a9b6e] focus:border-transparent"
                      placeholder="Enter subcategory name"
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                    />
                    <button
                      onClick={handleAddSubcategory}
                      className="bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      + Add Subcategory
                    </button>
                  </div>
                </div>

                {/* Existing Subcategories List */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Existing Subcategories</label>
                  {workingCategories[categoryType] && workingCategories[categoryType].subcategories ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(workingCategories[categoryType].subcategories).map(([subKey, subData]: [string, any]) => (
                        <div key={subKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{subData.label}</span>
                            <span className="text-sm text-gray-500 ml-2">({subKey})</span>
                          </div>
                          <button
                            onClick={() => handleDeleteSubcategory(subKey)}
                            className="text-[#b85c57] hover:text-[#a54c47] p-1 transition-colors duration-200"
                            title="Delete subcategory"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No subcategories available</p>
                  )}
                </div>
              </div>

              {/* Predefined Items Management */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8a9b6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Predefined Items
                </h3>

                {/* Subcategory Selection for Items */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Subcategory</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#8a9b6e] focus:border-transparent"
                    value={selectedSubcategory || ""}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                  >
                    <option value="">-- Select Subcategory --</option>
                    {workingCategories[categoryType] && workingCategories[categoryType].subcategories ? (
                      Object.keys(workingCategories[categoryType].subcategories).map((sub) => (
                        <option key={sub} value={sub}>
                          {workingCategories[categoryType].subcategories[sub].label}
                        </option>
                      ))
                    ) : (
                      <option disabled>No subcategories available</option>
                    )}
                  </select>
                </div>

                {/* Add New Predefined Item */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add New Predefined Item</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#8a9b6e] focus:border-transparent disabled:bg-gray-100"
                      placeholder="Enter item name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      disabled={!selectedSubcategory}
                    />
                    <select
                      className="p-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#8a9b6e] focus:border-transparent disabled:bg-gray-100"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      disabled={!selectedSubcategory}
                    >
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                    </select>
                    <button
                      onClick={handleAddPredefinedItem}
                      className="bg-[#8a9b6e] hover:bg-[#7a8b5e] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none whitespace-nowrap"
                      disabled={!selectedSubcategory}
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {/* Existing Predefined Items */}
                {selectedSubcategory && 
                 workingCategories[categoryType] && 
                 workingCategories[categoryType].subcategories && 
                 workingCategories[categoryType].subcategories[selectedSubcategory] && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Items in {workingCategories[categoryType].subcategories[selectedSubcategory].label}
                    </label>
                    {workingCategories[categoryType].subcategories[selectedSubcategory].predefinedItems?.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {workingCategories[categoryType].subcategories[selectedSubcategory].predefinedItems.map(
                          (item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <span className="text-sm text-gray-500 ml-2">({item.unit})</span>
                              </div>
                              <button
                                onClick={() => handleDeletePredefinedItem(idx)}
                                className="text-[#b85c57] hover:text-[#a54c47] p-1 transition-colors duration-200"
                                title="Delete item"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No predefined items</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {workingCategories && Object.keys(workingCategories).length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-[#8a9b6e] hover:bg-[#7a8b5e] text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-[#b85c57] hover:bg-[#a54c47] text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
