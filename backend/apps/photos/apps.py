"""Configuration for the photos app."""
from __future__ import annotations

from django.apps import AppConfig


class PhotosConfig(AppConfig):
    """App configuration for user photo management."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.photos"
    label = "photos"
    verbose_name = "Photos"
