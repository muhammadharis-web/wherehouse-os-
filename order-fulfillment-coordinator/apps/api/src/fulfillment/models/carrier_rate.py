from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from fulfillment.database import Base


class CarrierRate(Base):
    __tablename__ = "carrier_rates"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    carrier_name: Mapped[str] = mapped_column(String(100), nullable=False)
    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    origin_zip: Mapped[str] = mapped_column(String(20), nullable=False)
    destination_zip: Mapped[str] = mapped_column(String(20), nullable=False)
    weight_kg_min: Mapped[float] = mapped_column(Float, default=0.0)
    weight_kg_max: Mapped[float] = mapped_column(Float, default=100.0)
    base_rate: Mapped[float] = mapped_column(Float, nullable=False)
    rate_per_kg: Mapped[float] = mapped_column(Float, default=0.0)
    estimated_days_min: Mapped[int] = mapped_column(default=1)
    estimated_days_max: Mapped[int] = mapped_column(default=5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<CarrierRate {self.carrier_name} {self.service_name}>"
