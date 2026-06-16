from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.api.deps import get_current_user, get_db
from fulfillment.schemas.carrier import CarrierRateRequest, CarrierRateResponse
from fulfillment.services.order_service import OrderService

router = APIRouter()


@router.get("/rates", response_model=list[CarrierRateResponse])
async def get_carrier_rates(
    db: AsyncSession = Depends(get_db),
    _user: dict[str, str] = Depends(get_current_user),
) -> list[CarrierRateResponse]:
    service = OrderService(db)
    return await service.get_all_carrier_rates()


@router.post("/rates", response_model=list[CarrierRateResponse])
async def shop_carrier_rates(
    payload: CarrierRateRequest,
    db: AsyncSession = Depends(get_db),
    _user: dict[str, str] = Depends(get_current_user),
) -> list[CarrierRateResponse]:
    if not payload.origin_zip or not payload.destination_zip:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="origin_zip and destination_zip are required",
        )
    if payload.weight_kg <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="weight_kg must be positive",
        )
    service = OrderService(db)
    return await service.shop_rates(payload)
