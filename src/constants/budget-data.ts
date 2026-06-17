export interface BudgetConfig {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
}

export interface TravelStyleData {
  backpacker: BudgetConfig;
  moderate: BudgetConfig;
  luxury: BudgetConfig;
}

// Cost Index multipliers in USD per day (Accommodation, Food, Transport, Activities)
export const REGIONAL_COSTS: Record<string, TravelStyleData> = {
  "western-europe": {
    backpacker: { accommodation: 35, food: 20, transport: 10, activities: 15 },
    moderate: { accommodation: 120, food: 60, transport: 25, activities: 35 },
    luxury: { accommodation: 350, food: 150, transport: 80, activities: 120 }
  },
  "eastern-europe": {
    backpacker: { accommodation: 22, food: 14, transport: 6, activities: 10 },
    moderate: { accommodation: 70, food: 35, transport: 15, activities: 20 },
    luxury: { accommodation: 220, food: 95, transport: 50, activities: 70 }
  },
  "southeast-asia": {
    backpacker: { accommodation: 10, food: 8, transport: 3, activities: 7 },
    moderate: { accommodation: 40, food: 25, transport: 12, activities: 18 },
    luxury: { accommodation: 180, food: 80, transport: 40, activities: 60 }
  },
  "east-asia": {
    backpacker: { accommodation: 32, food: 18, transport: 8, activities: 14 },
    moderate: { accommodation: 100, food: 55, transport: 20, activities: 30 },
    luxury: { accommodation: 280, food: 130, transport: 70, activities: 100 }
  },
  "south-asia": {
    backpacker: { accommodation: 8, food: 6, transport: 2, activities: 5 },
    moderate: { accommodation: 30, food: 20, transport: 10, activities: 12 },
    luxury: { accommodation: 150, food: 60, transport: 35, activities: 45 }
  },
  "middle-east": {
    backpacker: { accommodation: 20, food: 12, transport: 6, activities: 10 },
    moderate: { accommodation: 80, food: 45, transport: 20, activities: 25 },
    luxury: { accommodation: 250, food: 110, transport: 60, activities: 80 }
  },
  "north-america": {
    backpacker: { accommodation: 45, food: 25, transport: 15, activities: 20 },
    moderate: { accommodation: 160, food: 75, transport: 35, activities: 45 },
    luxury: { accommodation: 450, food: 180, transport: 100, activities: 150 }
  },
  "central-america": {
    backpacker: { accommodation: 15, food: 10, transport: 4, activities: 8 },
    moderate: { accommodation: 50, food: 28, transport: 12, activities: 18 },
    luxury: { accommodation: 180, food: 75, transport: 45, activities: 60 }
  },
  "south-america": {
    backpacker: { accommodation: 16, food: 11, transport: 4, activities: 8 },
    moderate: { accommodation: 55, food: 32, transport: 15, activities: 20 },
    luxury: { accommodation: 220, food: 90, transport: 50, activities: 75 }
  },
  "oceania": {
    backpacker: { accommodation: 40, food: 22, transport: 12, activities: 18 },
    moderate: { accommodation: 140, food: 65, transport: 30, activities: 40 },
    luxury: { accommodation: 380, food: 160, transport: 90, activities: 130 }
  },
  "africa": {
    backpacker: { accommodation: 14, food: 9, transport: 3, activities: 7 },
    moderate: { accommodation: 50, food: 28, transport: 14, activities: 18 },
    luxury: { accommodation: 200, food: 85, transport: 45, activities: 70 }
  }
};

export const US_BASELINE_COSTS: TravelStyleData = {
  backpacker: { accommodation: 45, food: 25, transport: 15, activities: 20 },
  moderate: { accommodation: 160, food: 75, transport: 35, activities: 45 },
  luxury: { accommodation: 450, food: 180, transport: 100, activities: 150 }
};

export const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" }
];
