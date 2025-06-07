import { CurrencyCode } from '../api/gamesApi';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  fractionalUnit: string;
  minIncrement: number;
  requiresSpecialHandling: boolean;
  description?: string;
}

// Define all currency information
export const CURRENCY_INFO: Record<CurrencyCode, CurrencyInfo> = {
  [CurrencyCode.AED]: {
    code: CurrencyCode.AED,
    name: "United Arab Emirates Dirham",
    symbol: "د.إ",
    fractionalUnit: "fils",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.AUD]: {
    code: CurrencyCode.AUD,
    name: "Australian Dollar",
    symbol: "A$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.BRL]: {
    code: CurrencyCode.BRL,
    name: "Brazilian Real",
    symbol: "R$",
    fractionalUnit: "centavos",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.CAD]: {
    code: CurrencyCode.CAD,
    name: "Canadian Dollar",
    symbol: "C$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.CHF]: {
    code: CurrencyCode.CHF,
    name: "Swiss Franc",
    symbol: "Fr.",
    fractionalUnit: "centime",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.CLP]: {
    code: CurrencyCode.CLP,
    name: "Chilean Peso",
    symbol: "$",
    fractionalUnit: "centavos",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 centavos"
  },
  [CurrencyCode.CNY]: {
    code: CurrencyCode.CNY,
    name: "Chinese Renminbi",
    symbol: "¥",
    fractionalUnit: "fēn",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.COP]: {
    code: CurrencyCode.COP,
    name: "Colombian Peso",
    symbol: "$",
    fractionalUnit: "centavos",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 centavos"
  },
  [CurrencyCode.CRC]: {
    code: CurrencyCode.CRC,
    name: "Costa Rican Colón",
    symbol: "₡",
    fractionalUnit: "céntimos",
    minIncrement: 500,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 500 céntimos"
  },
  [CurrencyCode.EUR]: {
    code: CurrencyCode.EUR,
    name: "Euro",
    symbol: "€",
    fractionalUnit: "eurocents",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.GBP]: {
    code: CurrencyCode.GBP,
    name: "British Pound",
    symbol: "£",
    fractionalUnit: "pence",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.HKD]: {
    code: CurrencyCode.HKD,
    name: "Hong Kong Dollar",
    symbol: "HK$",
    fractionalUnit: "sin",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.ILS]: {
    code: CurrencyCode.ILS,
    name: "Israeli New Shekel",
    symbol: "₪",
    fractionalUnit: "agorot",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.IDR]: {
    code: CurrencyCode.IDR,
    name: "Indonesian Rupiah",
    symbol: "Rp",
    fractionalUnit: "sen",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 sen"
  },
  [CurrencyCode.INR]: {
    code: CurrencyCode.INR,
    name: "Indian Rupee",
    symbol: "₹",
    fractionalUnit: "paise",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 paise"
  },
  [CurrencyCode.JPY]: {
    code: CurrencyCode.JPY,
    name: "Japanese Yen",
    symbol: "¥",
    fractionalUnit: "sen",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 sen"
  },
  [CurrencyCode.KRW]: {
    code: CurrencyCode.KRW,
    name: "South Korean Won",
    symbol: "₩",
    fractionalUnit: "jeon",
    minIncrement: 1000,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 1000 jeon"
  },
  [CurrencyCode.KWD]: {
    code: CurrencyCode.KWD,
    name: "Kuwaiti Dinar",
    symbol: "د.ك",
    fractionalUnit: "fils",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.KZT]: {
    code: CurrencyCode.KZT,
    name: "Kazakhstani Tenge",
    symbol: "₸",
    fractionalUnit: "tïın",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 tïın"
  },
  [CurrencyCode.MXN]: {
    code: CurrencyCode.MXN,
    name: "Mexican Peso",
    symbol: "Mex$",
    fractionalUnit: "centavos",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.MYR]: {
    code: CurrencyCode.MYR,
    name: "Malaysian Ringgit",
    symbol: "RM",
    fractionalUnit: "sen",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.NOK]: {
    code: CurrencyCode.NOK,
    name: "Norwegian Krone",
    symbol: "kr",
    fractionalUnit: "Øre",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.NZD]: {
    code: CurrencyCode.NZD,
    name: "New Zealand Dollar",
    symbol: "NZ$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.PEN]: {
    code: CurrencyCode.PEN,
    name: "Peruvian Sol",
    symbol: "S/",
    fractionalUnit: "céntimos",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.PHP]: {
    code: CurrencyCode.PHP,
    name: "Philippine Peso",
    symbol: "₱",
    fractionalUnit: "centavos",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.PLN]: {
    code: CurrencyCode.PLN,
    name: "Polish Złoty",
    symbol: "zł",
    fractionalUnit: "grosz",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.QAR]: {
    code: CurrencyCode.QAR,
    name: "Qatari Riyal",
    symbol: "ر.ق",
    fractionalUnit: "dirham",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.RUB]: {
    code: CurrencyCode.RUB,
    name: "Russian Ruble",
    symbol: "₽",
    fractionalUnit: "kopeks",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.SAR]: {
    code: CurrencyCode.SAR,
    name: "Saudi Riyal",
    symbol: "ر.س",
    fractionalUnit: "halalah",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.SGD]: {
    code: CurrencyCode.SGD,
    name: "Singapore Dollar",
    symbol: "S$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.THB]: {
    code: CurrencyCode.THB,
    name: "Thai Baht",
    symbol: "฿",
    fractionalUnit: "satang",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.TWD]: {
    code: CurrencyCode.TWD,
    name: "New Taiwan Dollar",
    symbol: "NT$",
    fractionalUnit: "fēn",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 fēn"
  },
  [CurrencyCode.UAH]: {
    code: CurrencyCode.UAH,
    name: "Ukrainian Hryvnia",
    symbol: "₴",
    fractionalUnit: "kopiykas",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 kopiykas"
  },
  [CurrencyCode.USD]: {
    code: CurrencyCode.USD,
    name: "United States Dollar",
    symbol: "$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false
  },
  [CurrencyCode.USD_CIS]: {
    code: CurrencyCode.USD_CIS,
    name: "US Dollar (CIS)",
    symbol: "$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false,
    description: "Discounted USD for Commonwealth of Independent States"
  },
  [CurrencyCode.USD_LATAM]: {
    code: CurrencyCode.USD_LATAM,
    name: "US Dollar (LATAM)",
    symbol: "$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false,
    description: "Discounted USD for Latin America"
  },
  [CurrencyCode.USD_MENA]: {
    code: CurrencyCode.USD_MENA,
    name: "US Dollar (MENA)",
    symbol: "$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false,
    description: "Discounted USD for Middle East and North Africa"
  },
  [CurrencyCode.USD_SASIA]: {
    code: CurrencyCode.USD_SASIA,
    name: "US Dollar (South Asia)",
    symbol: "$",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false,
    description: "Discounted USD for South Asia"
  },
  [CurrencyCode.UYU]: {
    code: CurrencyCode.UYU,
    name: "Uruguayan Peso",
    symbol: "$U",
    fractionalUnit: "centesimos",
    minIncrement: 100,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 100 centesimos"
  },
  [CurrencyCode.VND]: {
    code: CurrencyCode.VND,
    name: "Vietnamese Dong",
    symbol: "₫",
    fractionalUnit: "xu",
    minIncrement: 50000,
    requiresSpecialHandling: true,
    description: "Must be charged in increments of 50000 xu"
  },
  [CurrencyCode.ZAR]: {
    code: CurrencyCode.ZAR,
    name: "South African Rand",
    symbol: "R",
    fractionalUnit: "cents",
    minIncrement: 1,
    requiresSpecialHandling: false
  }
};

// Returns all currencies as an array for dropdown usage
export const getAllCurrencies = (): CurrencyInfo[] => {
  return Object.values(CURRENCY_INFO);
};

// Gets a specific currency's info
export const getCurrencyInfo = (code: CurrencyCode): CurrencyInfo => {
  return CURRENCY_INFO[code];
};

// Format a price amount according to the currency's conventions
export const formatPrice = (code: CurrencyCode, amount: number): string => {
  const currencyInfo = CURRENCY_INFO[code];
  
  // For currencies with special increments
  if (currencyInfo.minIncrement >= 100) {
    const mainUnit = Math.floor(amount / currencyInfo.minIncrement);
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
};

// Validate a price amount meets the currency's constraints
export const validatePriceAmount = (code: CurrencyCode, amount: number): boolean => {
  const currencyInfo = CURRENCY_INFO[code];
  return amount % currencyInfo.minIncrement === 0;
};

// Get default currency settings for a currency
export const getDefaultCurrencySettings = (code: CurrencyCode): {
  code: CurrencyCode;
  min_price_increment: number;
  fractional_unit: string;
} => {
  const info = CURRENCY_INFO[code];
  return {
    code,
    min_price_increment: info.minIncrement,
    fractional_unit: info.fractionalUnit
  };
};