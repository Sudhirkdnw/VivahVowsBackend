"""Models for premium subscriptions and transactions."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class SubscriptionPlan(models.Model):
    """Define pricing tiers for premium access."""

    name = models.CharField(max_length=64, unique=True)
    description = models.TextField(blank=True)
    price_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=8, default="USD")
    duration_days = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.name


class PaymentTransaction(models.Model):
    """Record payment gateway transactions."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="payment_transactions",
        on_delete=models.CASCADE,
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        related_name="transactions",
        on_delete=models.PROTECT,
    )
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=8, default="USD")
    status = models.CharField(max_length=16, choices=STATUS_CHOICES)
    gateway_transaction_id = models.CharField(max_length=128, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"Payment<{self.user_id}:{self.plan_id}:{self.status}>"
