"""Configuration for notifications."""
from __future__ import annotations

from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    """App configuration for system notifications."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.notifications"
    label = "notifications"
    verbose_name = "Notifications"
