from __future__ import annotations

import asyncio
import logging

from celery import Celery

from fulfillment.config import settings
from fulfillment.database import async_session_factory
from fulfillment.agents.orchestrator import FulfillmentOrchestrator

logger = logging.getLogger(__name__)

celery_app = Celery(
    "fulfillment",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "monitor-cycle-every-15-min": {
            "task": "fulfillment.tasks.monitor_cycle.run_monitor_cycle",
            "schedule": settings.shipment_poll_interval_seconds,
        },
    },
)


@celery_app.task(bind=True, max_retries=3, acks_late=True, default_retry_delay=60)
def run_monitor_cycle(self) -> dict:
    logger.info("Starting monitor cycle task")

    async def _run() -> dict:
        async with async_session_factory() as db:
            orchestrator = FulfillmentOrchestrator(db)
            result = await orchestrator.run_monitor_cycle()
            await db.commit()
            return result.model_dump()

    loop = None
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_run())
        logger.info(
            "Monitor cycle complete: %d shipments checked, %d delays detected",
            result.get("shipments_checked", 0),
            result.get("delays_detected", 0),
        )
        return result
    except Exception as exc:
        logger.error("Monitor cycle failed: %s", exc)
        try:
            raise self.retry(exc=exc, countdown=60)
        except Exception as retry_exc:
            logger.error("All retries exhausted for monitor cycle: %s", retry_exc)
            raise
    finally:
        if loop is not None:
            loop.close()
