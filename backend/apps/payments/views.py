"""Viewsets for plans and transactions."""
from __future__ import annotations

from rest_framework import mixins, permissions, viewsets

from .models import PaymentTransaction, SubscriptionPlan
from .serializers import PaymentTransactionSerializer, SubscriptionPlanSerializer


class SubscriptionPlanViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Expose active subscription plans."""

    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]
    queryset = SubscriptionPlan.objects.filter(is_active=True)


class PaymentTransactionViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """Allow users to inspect and create payment transactions."""

    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        if self.request.user.is_staff:
            return PaymentTransaction.objects.all()
        return PaymentTransaction.objects.filter(user=self.request.user)
