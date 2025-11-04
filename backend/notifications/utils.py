from __future__ import annotations

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification


def push_notification(user, event: str, payload: dict | None = None) -> Notification:
    payload = payload or {}
    notification = Notification.objects.create(user=user, event=event, payload=payload)

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{user.id}",
        {
            "type": "notification.send",
            "event": event,
            "payload": payload,
        },
    )
    return notification
