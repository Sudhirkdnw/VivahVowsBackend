"""Users app configuration."""
from __future__ import annotations

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Application configuration for the custom user model."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.users"
    label = "users"
    verbose_name = "Users"
