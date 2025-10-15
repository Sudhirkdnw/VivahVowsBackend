"""Profiles app configuration."""
from __future__ import annotations

from django.apps import AppConfig


class ProfilesConfig(AppConfig):
    """Application configuration for matchmaking profiles."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.profiles"
    label = "profiles"
    verbose_name = "Profiles"
