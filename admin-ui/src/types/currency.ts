export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  fractional_unit: string; 
  min_increment: number;
  requires_special_handling: boolean;
  description?: string;
}

export interface CurrencySettings {
  code: string;
  min_price_increment: number;
  fractional_unit: string;
}

export interface CurrenciesResponse {
  currencies: CurrencyInfo[];
}

// Helper function to format price according to currency rules
export function formatPrice(currencyInfo: CurrencyInfo, amount: number): string {
  // For currencies with special increments
  if (currencyInfo.min_increment >= 100) {
    const mainUnit = Math.floor(amount / currencyInfo.min_increment);
    return `${currencyInfo.symbol}${mainUnit}`;
  }
  
  // Standard format
  const mainUnit = Math.floor(amount / 100);
  const subUnit = amount % 100;
  
  if (subUnit === 0) {
    return `${currencyInfo.symbol}${mainUnit}`;
  } else {
    return `${currencyInfo.symbol}${mainUnit}.${subUnit.toString().padStart(2, '0')}`;
  }
}

// Helper function to validate price amount meets currency constraints
export function validatePriceAmount(currencyInfo: CurrencyInfo, amount: number): boolean {
  return amount % currencyInfo.min_increment === 0;
}