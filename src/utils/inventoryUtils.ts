import { HistoryEntry, ConsolidatedItem, Category, Unit } from "../types";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

// TODO: These functions will be updated to make API calls instead of direct database access

export const saveHistoryEntries = async (): Promise<void> => {
  // Backend API handles database operations
};

export const saveCategories = async (_categories: Category): Promise<void> => {
  // Backend API handles database operations
};

// Dynamic helper functions to get category and subcategory IDs from the categories object
const getCategoryIdByName = (categories: Category, categoryName: string): number | null => {
  const category = categories[categoryName];
  return category ? Number(category.id) : null;
};

const getSubcategoryIdByName = (categories: Category, categoryName: string, subcategoryName: string): number | null => {
  const category = categories[categoryName];
  if (category && category.subcategories[subcategoryName]) {
    return Number(category.subcategories[subcategoryName].id);
  }
  return null;
};

// Helper function to get category name by ID (useful for reverse lookups)
export const getCategoryNameById = (categories: Category, categoryId: number): string | null => {
  for (const [name, category] of Object.entries(categories)) {
    if (Number(category.id) === categoryId) {
      return name;
    }
  }
  return null;
};

// Helper function to get subcategory name by ID
export const getSubcategoryNameById = (categories: Category, categoryName: string, subcategoryId: number): string | null => {
  const category = categories[categoryName];
  if (category && category.subcategories) {
    for (const [name, subcategory] of Object.entries(category.subcategories)) {
      if (Number(subcategory.id) === subcategoryId) {
        return name;
      }
    }
  }
  return null;
};

// Helper function to get category label for display
export const getCategoryLabel = (categories: Category, mainCategoryId: string | number | null, subcategoryId: string | number): string => {
  console.log('getCategoryLabel called with:', { mainCategoryId, subcategoryId, categories });
  
  // Handle case where categories isn't loaded yet
  if (!categories || Object.keys(categories).length === 0) {
    return `Loading...`;
  }
  
  // If mainCategoryId is null, try to find it by looking through subcategories
  if (mainCategoryId === null || mainCategoryId === undefined) {
    // Search through all categories to find which one contains this subcategory
    for (const [categoryName, categoryData] of Object.entries(categories)) {
      if (categoryData.subcategories) {
        for (const [subName, subData] of Object.entries(categoryData.subcategories)) {
          if (subData.id === Number(subcategoryId)) {
            const mainLabel = categoryData.label || categoryName;
            const subLabel = subData.label || subName;
            return `${mainLabel}/${subLabel}`;
          }
        }
      }
    }
    return `Unknown/${subcategoryId}`;
  }
  
  // Try to find category by ID (original logic)
  const categoryName = getCategoryNameById(categories, Number(mainCategoryId));
  
  if (categoryName) {
    const subcategoryName = getSubcategoryNameById(categories, categoryName, Number(subcategoryId));
    
    const mainLabel = categories[categoryName]?.label || categoryName;
    const subLabel = subcategoryName ? categories[categoryName]?.subcategories?.[subcategoryName]?.label || subcategoryName : subcategoryId;
    
    return `${mainLabel}/${subLabel}`;
  }
  
  // If category not found, might be due to data structure issues
  return `Unknown (${mainCategoryId}/${subcategoryId})`;
};

// Updated checkItemExists function to dynamically get category IDs
export const checkItemExists = async (
  name: string,
  mainCategoryString: string,  // main_category_id (as a string)
  subcategoryString: string,   // subcategory_id (as a string)
  categories: Category         // Required categories object to get IDs dynamically
): Promise<ConsolidatedItem | null> => {
  try {
    // Get the category and subcategory IDs dynamically from the categories object
    const mainCategoryId = getCategoryIdByName(categories, mainCategoryString);
    const subcategoryId = getSubcategoryIdByName(categories, mainCategoryString, subcategoryString);

    // Ensure IDs are valid before proceeding
    if (mainCategoryId && subcategoryId) {
      // Make the API request with numeric IDs for main_category_id and subcategory_id
      const response = await axios.get(`${API_BASE_URL}/check_item_exists.php`, {
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
      return null; // Invalid category/subcategory
    }
  } catch (error) {
    console.error("Error checking if item exists:", error);
    return null; // Return null if there's an error
  }
};

export const updateCategoriesFormat = async (
  baseCategories: Category
): Promise<Category> => {
  // Backend API handles database operations
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
export const formatDate = (datestring: string | null): string => {
  if (!datestring) return "-";
  return new Date(datestring).toLocaleDateString();
};

export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Helper function to create a predefined item with dynamic category lookup
export const createPredefinedItem = async (
  categories: Category,
  categoryName: string,
  subcategoryName: string,
  itemName: string,
  unit: string = 'Kgs'
): Promise<{ success: boolean; message: string; id?: number }> => {
  try {
    const mainCategoryId = getCategoryIdByName(categories, categoryName);
    const subcategoryId = getSubcategoryIdByName(categories, categoryName, subcategoryName);

    if (!mainCategoryId || !subcategoryId) {
      return {
        success: false,
        message: `Invalid category or subcategory: ${categoryName}/${subcategoryName}`
      };
    }

    const response = await axios.post(`${API_BASE_URL}/add_predefined_item.php`, {
      main_category_id: mainCategoryId,
      subcat_id: subcategoryId,
      name: itemName,
      unit: unit
    });

    return response.data;
  } catch (error) {
    console.error("Error creating predefined item:", error);
    return {
      success: false,
      message: "Failed to create predefined item"
    };
  }
};
