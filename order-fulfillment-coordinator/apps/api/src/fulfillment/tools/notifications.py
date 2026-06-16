from __future__ import annotations

import logging
from typing import Any
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from fulfillment.config import settings
from fulfillment.models.notification import Notification

logger = logging.getLogger(__name__)


async def send_email_notification(
    db: AsyncSession,
    recipient: str,
    subject: str,
    body: str,
    order_id: str | None = None,
    shipment_id: str | None = None,
) -> dict[str, Any]:
    if not settings.sendgrid_api_key:
        logger.info("SendGrid not configured. Email to %s: %s", recipient, subject)
        notif = _create_notif(db, recipient, "email", body, order_id, shipment_id, subject=subject)
        return {"channel": "email", "recipient": recipient, "notification_id": notif.id, "simulated": True}

    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content

        sg = sendgrid.SendGridAPIClient(api_key=settings.sendgrid_api_key)
        mail = Mail(
            from_email=Email(settings.sendgrid_from_email),
            to_emails=To(recipient),
            subject=subject,
            plain_text_content=Content("text/plain", body),
        )
        response = sg.client.mail.send.post(request_body=mail.get())
        provider_id = str(response.status_code)
        notif = _create_notif(db, recipient, "email", body, order_id, shipment_id, subject=subject, provider_id=provider_id)
        return {"channel": "email", "recipient": recipient, "provider_id": provider_id, "notification_id": notif.id}
    except Exception as exc:
        logger.error("Email send failed: %s", exc)
        return {"channel": "email", "recipient": recipient, "error": str(exc)}


async def send_sms_notification(
    db: AsyncSession,
    recipient: str,
    body: str,
    order_id: str | None = None,
    shipment_id: str | None = None,
) -> dict[str, Any]:
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        logger.info("Twilio not configured. SMS to %s: %s", recipient, body)
        notif = _create_notif(db, recipient, "sms", body, order_id, shipment_id)
        return {"channel": "sms", "recipient": recipient, "notification_id": notif.id, "simulated": True}

    try:
        from twilio.rest import Client

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        message = client.messages.create(body=body, from_=settings.twilio_phone_number, to=recipient)
        notif = _create_notif(db, recipient, "sms", body, order_id, shipment_id, provider_id=message.sid)
        return {"channel": "sms", "recipient": recipient, "provider_id": message.sid, "notification_id": notif.id}
    except Exception as exc:
        logger.error("SMS send failed: %s", exc)
        return {"channel": "sms", "recipient": recipient, "error": str(exc)}


def _create_notif(
    db: AsyncSession,
    recipient: str,
    channel: str,
    body: str,
    order_id: str | None,
    shipment_id: str | None,
    subject: str | None = None,
    provider_id: str | None = None,
) -> Notification:
    notif = Notification(
        id=str(uuid4()),
        order_id=order_id,
        shipment_id=shipment_id,
        recipient=recipient,
        channel=channel,
        subject=subject,
        body=body,
        status="sent" if provider_id or not provider_id else "failed",
        provider_message_id=provider_id,
    )
    db.add(notif)
    return notif
