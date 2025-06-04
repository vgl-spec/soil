// Type definitions for the Farm Inventory application

// View mode type
export type ViewMode = 'consolidated' | 'history';

// Unit type
export type Unit = 'kg' | 'pcs';

// Predefined item type
export interface PredefinedItem {
  name: string;
  unit: Unit;
}

// Subcategory type
export interface Subcategory {
  id: string | number; // <-- add this line
  label: string;
  system?: boolean;
  predefinedItems: PredefinedItem[];
}

// Main category type
export interface MainCategory {
  id: string | number; // <-- add this line
  label: string;
  subcategories: Record<string, Subcategory>;
}

// Categories type
export interface Category {
  [key: string]: MainCategory;
}

// History entry type
// In src/types.ts
export interface HistoryEntry {
  id: number;
  name: string;
  mainCategory: string;
  subcategory: string;
  quantity: number;
  unit: string;
  harvestDate: string | null;
  notes: string | null;
  predefined_item_id: number;
  changeType: 'add' | 'reduce' | 'increase';
  date: string;
  userId?: number;
  itemId?: number;
}

// Consolidated item type
export interface ConsolidatedItem {
  id: number;
  name: string;
  mainCategory: string;
  subcategory: string;
  quantity: number;
  unit: string;
  harvestDate: string | null;
  predefined_item_id?: number; // Added property
  notes: string;
  lastUpdated: string;
  changeType: string;
}

// Chart data type
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

// Summary data type
export interface SummaryData {
  category: string;
  totalItems: number;
  totalQuantity: number;
  avgStock: number;
}