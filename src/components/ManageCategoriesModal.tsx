import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [workingCategories, setWorkingCategories] = useState(categories);
  const [categoryType, setCategoryType] = useState<string>(
    Object.keys(categories)[0] || ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("Kgs");

  useEffect(() => {
    setSelectedSubcategory(null);
  }, [categoryType]);

  // Handle adding a new subcategory
  const handleAddSubcategory = async () => {
    console.log(
      "Attempting to add subcategory:",
      newSubcategoryName,
      "to category:",
      categoryType
    );

    if (!newSubcategoryName.trim()) {
      alert("Please enter a subcategory name.");
      return;
    }
    if (!workingCategories[categoryType]) {
      alert("Selected category type does not exist.");
      return;
    }
    // Generate a key for the new subcategory
    const key = newSubcategoryName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (workingCategories[categoryType].subcategories[key]) {
      alert("A subcategory with this name already exists.");
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
    const unit = "Kgs"; // or let user select

    try {
      console.log("Sending request to add_subcategory.php with:", {
        main_category_id,
        name,
        label,
        unit,
      });
      const response = await axios.post(
        "https://soil-3tik.onrender.com/API/add_subcategory.php",
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
        alert("Subcategory added!");
        console.log(
          "Subcategory added to local state:",
          updatedCategories[categoryType].subcategories[key]
        );
      } else {
        alert(response.data.message || "Failed to add subcategory.");
      }
    } catch (error) {
      alert("Error adding subcategory.");
      console.error("Error from add_subcategory.php:", error);
    }
  };

  // Handle adding a predefined item
  const handleAddPredefinedItem = async () => {
    console.log(
      "Attempting to add predefined item:",
      newItemName,
      "to subcategory:",
      selectedSubcategory
    );

    if (!selectedSubcategory || !workingCategories[categoryType]) return;

    if (!newItemName.trim()) {
      alert("Please enter an item name.");
      return;
    }

    const items =
      workingCategories[categoryType].subcategories[selectedSubcategory]
        .predefinedItems;
    const existingItem = items.find(
      (item: any) =>
        item.name.toLowerCase() === newItemName.toLowerCase()
    );

    if (existingItem) {
      if (existingItem.unit !== newItemUnit) {
        alert(
          `This item already exists with unit "${existingItem.unit}". You cannot add the same item with a different unit.`
        );
        return;
      }
      alert("This item already exists.");
      return;
    }

    if (items.length >= 100) {
      alert("This category has reached the maximum limit of 100 items.");
      return;
    }

    // Prepare API payload
    const main_category_id = workingCategories[categoryType].id;
    const subcat_id = workingCategories[categoryType].subcategories[selectedSubcategory].id;
    const name = newItemName;
    const unit = newItemUnit;

    try {
      console.log("Sending request to add_predefined_item.php with:", {
        main_category_id,
        subcat_id,
        name,
        unit,
      });
      const response = await axios.post(
        "https://soil-3tik.onrender.com/API/add_predefined_item.php",
        {
          main_category_id,
          subcat_id,
          name,
          unit,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Response from add_predefined_item.php:", response.data);

      if (response.data.success) {
        // Add to local state for immediate UI update
        const updatedCategories = { ...workingCategories };
        updatedCategories[categoryType].subcategories[
          selectedSubcategory
        ].predefinedItems.push({
          name: newItemName,
          unit: newItemUnit,
        });

        setWorkingCategories(updatedCategories);
        setNewItemName("");
        alert("Predefined item added!");
        console.log("Predefined item added to local state:", {
          name: newItemName,
          unit: newItemUnit,
          subcategory: selectedSubcategory,
          category: categoryType,
        });
      } else {
        alert(response.data.message || "Failed to add predefined item.");
      }
    } catch (error) {
      alert("Error adding predefined item.");
      console.error("Error from add_predefined_item.php:", error);
    }
  };

  // Handle deleting a predefined item
  const handleDeletePredefinedItem = (index: number) => {
    if (!selectedSubcategory || !workingCategories[categoryType]) return;

    const updatedCategories = { ...workingCategories };
    updatedCategories[categoryType].subcategories[
      selectedSubcategory
    ].predefinedItems.splice(index, 1);

    setWorkingCategories(updatedCategories);
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
        <div className="mb-4">
          <label className="block mb-1 font-medium">Main Category</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
          >
            {Object.keys(workingCategories).map((cat) => (
              <option key={cat} value={cat}>
                {workingCategories[cat].label}
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
            {Object.keys(workingCategories[categoryType].subcategories).map(
              (sub) => (
                <option key={sub} value={sub}>
                  {workingCategories[categoryType].subcategories[sub].label}
                </option>
              )
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
            disabled={!selectedSubcategory}
          >
            <option value="Kgs">Kgs</option>
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
        {selectedSubcategory && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Predefined Items in {workingCategories[categoryType].subcategories[selectedSubcategory].label}
            </label>
            <ul>
              {workingCategories[categoryType].subcategories[selectedSubcategory].predefinedItems.map(
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
              )}
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
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
