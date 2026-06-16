from __future__ import annotations

import re


def validate_address(address: str, zip_code: str) -> dict:
    errors: list[str] = []

    if not address or len(address.strip()) < 10:
        errors.append("Address must be at least 10 characters")

    if not re.match(r"^\d{5}(-\d{4})?$", zip_code.strip()):
        errors.append("Invalid ZIP code format (expected: 12345 or 12345-6789)")

    if not any(c.isdigit() for c in address):
        errors.append("Address must contain a street number")

    street_indicators = ["st", "ave", "blvd", "dr", "ln", "rd", "way", "street", "avenue", "boulevard", "drive", "lane", "road"]
    if not any(indicator in address.lower() for indicator in street_indicators):
        errors.append("Address must contain a valid street type (St, Ave, Blvd, etc.)")

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
    }
