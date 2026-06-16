from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.api.deps import get_db
from fulfillment.schemas.webhook import OrderPlacedWebhook, ShipmentEventWebhook, WebhookResponse
from fulfillment.services.order_service import OrderService
from fulfillment.services.shipment_service import ShipmentService

router = APIRouter()


@router.post("/order-placed", response_model=WebhookResponse)
async def webhook_order_placed(
    payload: OrderPlacedWebhook,
    db: AsyncSession = Depends(get_db),
) -> WebhookResponse:
    service = OrderService(db)
    try:
        order = await service.create_order_from_webhook(payload)
        return WebhookResponse(success=True, message="Order created", order_id=str(order.id))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process webhook: {exc}",
        )


@router.post("/shipment-event", response_model=WebhookResponse)
async def webhook_shipment_event(
    payload: ShipmentEventWebhook,
    db: AsyncSession = Depends(get_db),
) -> WebhookResponse:
    service = ShipmentService(db)
    try:
        shipment = await service.update_from_event(payload)
        return WebhookResponse(
            success=True,
            message="Shipment event processed",
            order_id=str(shipment.id),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process shipment event: {exc}",
        )
