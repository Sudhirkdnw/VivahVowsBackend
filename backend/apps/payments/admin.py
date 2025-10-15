"""Admin integration for subscription plans and payments."""
from __future__ import annotations

from django.contrib import admin

from .models import PaymentTransaction, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    """Manage subscription plans in admin."""

    list_display = ("name", "price_cents", "currency", "duration_days", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    """Inspect payment transactions."""

    list_display = (
        "user",
        "plan",
        "amount_cents",
        "currency",
        "status",
        "created_at",
    )
    list_filter = ("status", "currency")
    search_fields = ("user__email", "gateway_transaction_id")
