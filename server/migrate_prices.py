#!/usr/bin/env python3
"""
Migration script wrapper to convert product prices from float dollars to integer cents.
This script should be run once to update all existing products in the database.
"""
import asyncio
import sys
import os

# Add project root to sys.path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.api.scripts.migrate_prices_to_cents import main

if __name__ == "__main__":
    asyncio.run(main())