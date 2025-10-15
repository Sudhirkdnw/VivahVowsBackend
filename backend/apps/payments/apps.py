"""Configuration for payments app."""
from __future__ import annotations

from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    """App configuration for premium membership and billing."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.apps.payments"
    label = "payments"
    verbose_name = "Payments"
