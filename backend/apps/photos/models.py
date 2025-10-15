"""Models for managing user uploaded photos."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Photo(models.Model):
    """Represents a single profile photo stored in an external CDN."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="photos",
        on_delete=models.CASCADE,
    )
    image_url = models.URLField()
    is_primary = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "-created_at"]
        verbose_name = "photo"
        verbose_name_plural = "photos"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"Photo<{self.user_id}:{self.image_url}>"
