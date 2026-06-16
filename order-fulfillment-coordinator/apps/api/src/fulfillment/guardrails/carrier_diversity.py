from __future__ import annotations


MONOPOLY_CARRIERS: set[str] = set()


def carrier_diversity(current_carrier: str, new_carrier: str) -> bool:
    if current_carrier.lower() == new_carrier.lower():
        return False

    if current_carrier.lower() in MONOPOLY_CARRIERS and new_carrier.lower() in MONOPOLY_CARRIERS:
        return False

    return True


def register_monopoly_carrier(carrier_name: str) -> None:
    MONOPOLY_CARRIERS.add(carrier_name.lower())
