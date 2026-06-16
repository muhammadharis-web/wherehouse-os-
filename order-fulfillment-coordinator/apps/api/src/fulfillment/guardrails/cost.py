from __future__ import annotations

from fulfillment.config import settings


def cost_cap(current_cost: float, new_cost: float) -> bool:
    if current_cost <= 0:
        return True

    increase_pct = ((new_cost - current_cost) / current_cost) * 100
    return increase_pct <= settings.max_allowed_cost_increase_pct
