"""Admin registrations for notifications."""
from __future__ import annotations

from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Expose notifications in the Django admin."""

    list_display = ("user", "type", "is_read", "created_at")
    list_filter = ("type", "is_read")
    search_fields = ("user__email",)
