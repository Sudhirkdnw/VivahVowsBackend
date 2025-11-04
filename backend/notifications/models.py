from __future__ import annotations

from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class Notification(models.Model):
    EVENT_CHOICES = (
        ("like", "Like"),
        ("match", "Match"),
        ("message", "Message"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    event = models.CharField(max_length=20, choices=EVENT_CHOICES)
    payload = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"Notification({self.user}, {self.event})"
