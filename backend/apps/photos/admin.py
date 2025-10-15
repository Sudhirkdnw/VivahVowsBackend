"""Admin integration for photos."""
from __future__ import annotations

from django.contrib import admin

from .models import Photo


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    """Manage user photos in the admin panel."""

    list_display = ("user", "image_url", "is_primary", "created_at")
    list_filter = ("is_primary",)
    search_fields = ("user__email",)
