"""Admin registrations for the users app."""
from __future__ import annotations

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Customize the Django admin for the custom user model."""

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Matchmaking profile",
            {
                "fields": (
                    "phone_number",
                    "gender",
                    "onboarding_completed",
                    "is_premium",
                )
            },
        ),
    )
    list_display = (
        "email",
        "username",
        "gender",
        "onboarding_completed",
        "is_premium",
        "is_staff",
    )
    search_fields = ("email", "username", "phone_number")
    ordering = ("email",)
