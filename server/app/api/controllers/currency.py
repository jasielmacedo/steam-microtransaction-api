from typing import List, Dict, Any, Optional
from fastapi import Depends, Query

from app.api.schemas.game import Currency, CurrencySettings
from app.api.helpers.currency_helper import CURRENCY_CONSTRAINTS
from app.core.security import get_current_user

async def get_currencies(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get all supported currencies with their details.
    """
    currencies = []
    
    for code in Currency:
        constraints = CURRENCY_CONSTRAINTS.get(code.value, {})
        currencies.append({
            "code": code.value,
            "name": get_currency_name(code.value),
            "symbol": get_currency_symbol(code.value),
            "fractional_unit": constraints.get("fraction_name", "cents"),
            "min_increment": constraints.get("min_increment", 1),
            "requires_special_handling": constraints.get("min_increment", 1) > 1,
            "description": get_currency_description(code.value, constraints),
        })
    
    return {
        "currencies": currencies
    }

async def get_default_currency_settings(
    currency_code: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get default settings for a specific currency.
    """
    if currency_code not in [c.value for c in Currency]:
        return {
            "error": "Invalid currency code"
        }
    
    constraints = CURRENCY_CONSTRAINTS.get(currency_code, {})
    
    return {
        "code": currency_code,
        "min_price_increment": constraints.get("min_increment", 1),
        "fractional_unit": constraints.get("fraction_name", "cents"),
    }

def get_currency_name(code: str) -> str:
    """Get friendly name for a currency code."""
    currency_names = {
        "AED": "United Arab Emirates Dirham",
        "AUD": "Australian Dollar",
        "BRL": "Brazilian Real",
        "CAD": "Canadian Dollar",
        "CHF": "Swiss Franc",
        "CLP": "Chilean Peso",
        "CNY": "Chinese Renminbi (Yuan)",
        "COP": "Colombian Peso",
        "CRC": "Costa Rican Colón",
        "EUR": "Euro",
        "GBP": "British Pound",
        "HKD": "Hong Kong Dollar",
        "ILS": "Israeli New Shekel",
        "IDR": "Indonesian Rupiah",
        "INR": "Indian Rupee",
        "JPY": "Japanese Yen",
        "KRW": "South Korean Won",
        "KWD": "Kuwaiti Dinar",
        "KZT": "Kazakhstani Tenge",
        "MXN": "Mexican Peso",
        "MYR": "Malaysian Ringgit",
        "NOK": "Norwegian Krone",
        "NZD": "New Zealand Dollar",
        "PEN": "Peruvian Sol",
        "PHP": "Philippine Peso",
        "PLN": "Polish Złoty",
        "QAR": "Qatari Riyal",
        "RUB": "Russian Ruble",
        "SAR": "Saudi Riyal",
        "SGD": "Singapore Dollar",
        "THB": "Thai Baht",
        "TWD": "New Taiwan Dollar",
        "UAH": "Ukrainian Hryvnia",
        "USD": "United States Dollar",
        "USD_CIS": "US Dollar (CIS)",
        "USD_LATAM": "US Dollar (LATAM)",
        "USD_MENA": "US Dollar (MENA)",
        "USD_SASIA": "US Dollar (South Asia)",
        "UYU": "Uruguayan Peso",
        "VND": "Vietnamese Dong",
        "ZAR": "South African Rand"
    }
    
    return currency_names.get(code, code)

def get_currency_symbol(code: str) -> str:
    """Get symbol for a currency code."""
    currency_symbols = {
        "AED": "د.إ",
        "AUD": "A$",
        "BRL": "R$",
        "CAD": "C$",
        "CHF": "Fr.",
        "CLP": "$",
        "CNY": "¥",
        "COP": "$",
        "CRC": "₡",
        "EUR": "€",
        "GBP": "£",
        "HKD": "HK$",
        "ILS": "₪",
        "IDR": "Rp",
        "INR": "₹",
        "JPY": "¥",
        "KRW": "₩",
        "KWD": "د.ك",
        "KZT": "₸",
        "MXN": "Mex$",
        "MYR": "RM",
        "NOK": "kr",
        "NZD": "NZ$",
        "PEN": "S/",
        "PHP": "₱",
        "PLN": "zł",
        "QAR": "ر.ق",
        "RUB": "₽",
        "SAR": "ر.س",
        "SGD": "S$",
        "THB": "฿",
        "TWD": "NT$",
        "UAH": "₴",
        "USD": "$",
        "USD_CIS": "$",
        "USD_LATAM": "$",
        "USD_MENA": "$",
        "USD_SASIA": "$",
        "UYU": "$U",
        "VND": "₫",
        "ZAR": "R"
    }
    
    return currency_symbols.get(code, code)

def get_currency_description(code: str, constraints: Dict) -> str:
    """Get description for a currency code."""
    min_increment = constraints.get("min_increment", 1)
    fraction_name = constraints.get("fraction_name", "cents")
    
    special_descriptions = {
        "USD_CIS": "Discounted USD for Commonwealth of Independent States",
        "USD_LATAM": "Discounted USD for Latin America",
        "USD_MENA": "Discounted USD for Middle East and North Africa",
        "USD_SASIA": "Discounted USD for South Asia",
    }
    
    if code in special_descriptions:
        return special_descriptions[code]
    
    if min_increment > 1:
        return f"Must be charged in increments of {min_increment} {fraction_name}"
    
    return ""