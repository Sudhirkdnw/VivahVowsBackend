"""Admin configuration for matches."""
from __future__ import annotations

from django.contrib import admin

from .models import Match, MatchInteraction


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """Display key match attributes in the admin."""

    list_display = (
        "user",
        "matched_user",
        "status",
        "compatibility_score",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("user__email", "matched_user__email")


@admin.register(MatchInteraction)
class MatchInteractionAdmin(admin.ModelAdmin):
    """Manage match interactions."""

    list_display = ("user", "target", "liked", "created_at")
    list_filter = ("liked",)
    search_fields = ("user__email", "target__email")
