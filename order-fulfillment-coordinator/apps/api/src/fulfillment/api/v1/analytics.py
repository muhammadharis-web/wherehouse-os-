from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.api.deps import get_current_user, get_db
from fulfillment.schemas.analytics import KPIsResponse, CarrierAnalyticsResponse
from fulfillment.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/kpis", response_model=KPIsResponse)
async def get_kpis(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: dict[str, str] = Depends(get_current_user),
) -> KPIsResponse:
    service = AnalyticsService(db)
    return await service.compute_kpis(start_date=start_date, end_date=end_date)


@router.get("/carriers", response_model=list[CarrierAnalyticsResponse])
async def get_carrier_analytics(
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: dict[str, str] = Depends(get_current_user),
) -> list[CarrierAnalyticsResponse]:
    service = AnalyticsService(db)
    return await service.carrier_performance(start_date=start_date, end_date=end_date)
