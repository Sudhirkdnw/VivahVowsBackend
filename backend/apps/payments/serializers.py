"""Serializers for plans and payments."""
from __future__ import annotations

from rest_framework import serializers

from .models import PaymentTransaction, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Expose subscription plan data."""

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "description",
            "price_cents",
            "currency",
            "duration_days",
            "is_active",
        ]
        read_only_fields = ["id"]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serialize payment transactions."""

    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "plan",
            "amount_cents",
            "currency",
            "status",
            "gateway_transaction_id",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def create(self, validated_data: dict) -> PaymentTransaction:
        request = self.context["request"]
        validated_data.setdefault("amount_cents", validated_data["plan"].price_cents)
        validated_data.setdefault("currency", validated_data["plan"].currency)
        return PaymentTransaction.objects.create(user=request.user, **validated_data)
