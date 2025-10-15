"""Admin registrations for matchmaking profiles and preferences."""
from __future__ import annotations

from django.contrib import admin

from .models import Preference, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Display core profile information in the admin."""

    list_display = ("user", "city", "country", "profession", "religion")
    search_fields = ("user__email", "city", "profession")
    list_filter = ("religion", "profession", "city")


@admin.register(Preference)
class PreferenceAdmin(admin.ModelAdmin):
    """Admin configuration for partner preferences."""

    list_display = (
        "user",
        "preferred_age_min",
        "preferred_age_max",
    )
    search_fields = ("user__email",)
