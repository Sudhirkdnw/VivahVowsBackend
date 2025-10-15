"""Configuration for the matches app."""
from __future__ import annotations

from django.apps import AppConfig


class MatchesConfig(AppConfig):
    """App configuration for matchmaking logic."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.matches"
    label = "matches"
    verbose_name = "Matches"
