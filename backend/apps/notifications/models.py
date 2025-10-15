"""Notification models for real-time alerts."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    """Supported notification categories."""

    MATCH = "match", "Match"
    MESSAGE = "message", "Message"
    LIKE = "like", "Like"
    SYSTEM = "system", "System"


class Notification(models.Model):
    """Store notification payloads before dispatching."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="notifications",
        on_delete=models.CASCADE,
    )
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    payload = models.JSONField(default=dict)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "notification"
        verbose_name_plural = "notifications"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"Notification<{self.user_id}:{self.type}>"
