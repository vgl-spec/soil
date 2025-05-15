import { HistoryEntry, ConsolidatedItem, Category, Unit } from "../types";
import axios from "axios";

// TODO: These functions will be updated to make API calls instead of direct database access

export const saveHistoryEntries = async (
  entries: HistoryEntry[]
): Promise<void> => {
  console.warn(
    "Database operations moved to backend API - saveHistoryEntries not implemented"
  );
};

export const saveCategories = async (categories: Category): Promise<void> => {
  console.warn(
    "Database operations moved to backend API - saveCategories not implemented"
  );
  console.log("Received categories:", categories); // Log the categories for now
};

// Map for main category (agricultural -> 1, non-agricultural -> 2)
const mainCategoryMapping: { [key: string]: number } = {
  "agricultural": 1,
  "non-agricultural": 2
};

// Map for subcategory (vegetables -> 1, fruits -> 2)
const subcategoryMapping: { [key: string]: number } = {
  "vegetables": 1,
  "soil": 2,
  "fertilizer": 3,
  "cocopots": 4,
  "seedlings": 5,
  "repurposed_items": 6,
  // Add more subcategories as needed
};

// Updated checkItemExists function to make an API call to check if the item exists in the backend
export const checkItemExists = async (
  name: string,
  mainCategoryString: string,  // main_category_id (as a string)
  subcategoryString: string     // subcategory_id (as a string)
): Promise<ConsolidatedItem | null> => {
  try {
    // Convert string category and subcategory to their corresponding numeric IDs
    const mainCategoryId = mainCategoryMapping[mainCategoryString];
    
    const subcategoryId = subcategoryMapping[subcategoryString];

    // Ensure IDs are valid before proceeding
    if (mainCategoryId && subcategoryId) {
      console.log("Sending parameters: ", { name, mainCategoryId , subcategoryId });
      const mainCatID = String(mainCategoryId);
      const subCatID = String(subcategoryId);
      console.log("Sending parameters: ", { name, mainCatID, subCatID });
      // Make the API request with numeric IDs for main_category_id and subcategory_id

      const response = await axios.get('http://localhost:8012/Test/API/check_item_exists.php', {
  params: {
    name,
    main_category_id: mainCategoryId,
    subcategory_id: subcategoryId
  }
});

      // If the item exists, return the item data
      if (response.data.exists) {
        return response.data.item as ConsolidatedItem;
      } else {
        return null; // Return null if the item doesn't exist
      }
    } else {
      console.error("Invalid category or subcategory");
      return null; // Invalid category/subcategory
    }
  } catch (error) {
    console.error("Error checking if item exists:", error);
    if (axios.isAxiosError(error)) {
      console.error('Network Error:', error.message);
      if (error.response) {
        console.log('Response Error:', error.response);
      }
    }
    return null; // Return null if there's an error
    
  }
};

console.log('Response Error:', 2);

export const updateCategoriesFormat = async (
  loadedCategories: Category,
  baseCategories: Category
): Promise<Category> => {
  console.warn(
    "Database operations moved to backend API - updateCategoriesFormat not implemented"
  );
  return baseCategories;
};

export const getConsolidatedInventory = (
  historyEntries: HistoryEntry[]
): ConsolidatedItem[] => {
  if (!Array.isArray(historyEntries)) return [];

  try {
    const inventoryMap = new Map<string, ConsolidatedItem>();

    historyEntries.forEach((entry) => {
      const key = `${entry.name}-${entry.mainCategory}-${entry.subcategory}`;

      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          id: entry.id ?? generateId(),
          name: entry.name,
          mainCategory: entry.mainCategory,
          subcategory: entry.subcategory,
          quantity: 0,
          unit: entry.unit as Unit,
          lastUpdated: "",
          harvestDate: entry.harvestDate ? String(Number(entry.harvestDate)) : null,
          notes: entry.notes ?? "",
          changeType: entry.changeType ?? "",
        });
      }

      const item = inventoryMap.get(key)!;
      item.quantity += entry.quantity;
    });

    return Array.from(inventoryMap.values()).filter(
      (item) => item.quantity !== 0
    );
  } catch (error) {
    console.error("Error consolidating inventory:", error);
    return [];
  }
};

// Utility functions that don't require database access
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};
