"""Helper functions for currency operations."""
from typing import Dict, Optional

# Currency constraints for Steam supported currencies
CURRENCY_CONSTRAINTS = {
    "AED": {"fraction_name": "fils", "min_increment": 1},
    "AUD": {"fraction_name": "cents", "min_increment": 1},
    "BRL": {"fraction_name": "centavos", "min_increment": 1},
    "CAD": {"fraction_name": "cents", "min_increment": 1},
    "CHF": {"fraction_name": "centime", "min_increment": 1},
    "CLP": {"fraction_name": "centavos", "min_increment": 100},  # Must be in increments of 100
    "CNY": {"fraction_name": "fēn", "min_increment": 1},
    "COP": {"fraction_name": "centavos", "min_increment": 100},  # Must be in increments of 100
    "CRC": {"fraction_name": "céntimos", "min_increment": 500},  # Must be in increments of 500
    "EUR": {"fraction_name": "eurocents", "min_increment": 1},
    "GBP": {"fraction_name": "pence", "min_increment": 1},
    "HKD": {"fraction_name": "sin", "min_increment": 1},
    "ILS": {"fraction_name": "agorot", "min_increment": 1},
    "IDR": {"fraction_name": "sen", "min_increment": 100},  # Must be in increments of 100
    "INR": {"fraction_name": "paise", "min_increment": 100},  # Must be in increments of 100
    "JPY": {"fraction_name": "sen", "min_increment": 100},  # Must be in increments of 100
    "KRW": {"fraction_name": "jeon", "min_increment": 1000},  # Must be in increments of 1000
    "KWD": {"fraction_name": "fils", "min_increment": 1},
    "KZT": {"fraction_name": "tïın", "min_increment": 100},  # Must be in increments of 100
    "MXN": {"fraction_name": "centavos", "min_increment": 1},
    "MYR": {"fraction_name": "sen", "min_increment": 1},
    "NOK": {"fraction_name": "Øre", "min_increment": 1},
    "NZD": {"fraction_name": "cents", "min_increment": 1},
    "PEN": {"fraction_name": "céntimos", "min_increment": 1},
    "PHP": {"fraction_name": "centavos", "min_increment": 1},
    "PLN": {"fraction_name": "grosz", "min_increment": 1},
    "QAR": {"fraction_name": "dirham", "min_increment": 1},
    "RUB": {"fraction_name": "kopeks", "min_increment": 1},
    "SAR": {"fraction_name": "halalah", "min_increment": 1},
    "SGD": {"fraction_name": "cents", "min_increment": 1},
    "THB": {"fraction_name": "satang", "min_increment": 1},
    "TWD": {"fraction_name": "fēn", "min_increment": 100},  # Must be in increments of 100
    "UAH": {"fraction_name": "kopiykas", "min_increment": 100},  # Must be in increments of 100
    "USD": {"fraction_name": "cents", "min_increment": 1},
    "USD_CIS": {"fraction_name": "cents", "min_increment": 1},
    "USD_LATAM": {"fraction_name": "cents", "min_increment": 1},
    "USD_MENA": {"fraction_name": "cents", "min_increment": 1},
    "USD_SASIA": {"fraction_name": "cents", "min_increment": 1},
    "UYU": {"fraction_name": "centesimos", "min_increment": 100},  # Must be in increments of 100
    "VND": {"fraction_name": "xu", "min_increment": 50000},  # Must be in increments of 50000
    "ZAR": {"fraction_name": "cents", "min_increment": 1},
}

def get_currency_constraints(currency_code: str) -> Optional[Dict]:
    """
    Get constraints for a specific currency.
    
    Args:
        currency_code: The currency code to get constraints for
        
    Returns:
        Dict with constraints or None if not found
    """
    return CURRENCY_CONSTRAINTS.get(currency_code)

def validate_price_amount(currency_code: str, amount: int) -> bool:
    """
    Validate that a price amount meets the constraints for a specific currency.
    
    Args:
        currency_code: The currency code
        amount: The price amount in smallest units (e.g., cents)
        
    Returns:
        True if valid, False otherwise
    """
    constraints = get_currency_constraints(currency_code)
    if not constraints:
        return False
    
    min_increment = constraints.get("min_increment", 1)
    return amount % min_increment == 0

def format_price(currency_code: str, amount: int) -> str:
    """
    Format a price amount according to the currency's conventions.
    
    Args:
        currency_code: The currency code
        amount: The price amount in smallest units (e.g., cents)
        
    Returns:
        Formatted price string
    """
    constraints = get_currency_constraints(currency_code)
    if not constraints:
        return f"{currency_code} {amount}"
    
    # For currencies like JPY where the smallest unit is the main unit
    if constraints.get("min_increment", 1) >= 100:
        main_unit = amount // constraints["min_increment"]
        return f"{currency_code} {main_unit}"
    
    # Standard format for most currencies
    main_unit = amount // 100
    sub_unit = amount % 100
    
    if sub_unit == 0:
        return f"{currency_code} {main_unit}"
    else:
        return f"{currency_code} {main_unit}.{sub_unit:02d}"