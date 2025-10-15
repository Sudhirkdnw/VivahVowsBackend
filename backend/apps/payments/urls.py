"""Routes for payment endpoints."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import PaymentTransactionViewSet, SubscriptionPlanViewSet

router = DefaultRouter()
router.register("plans", SubscriptionPlanViewSet, basename="subscription-plan")
router.register("transactions", PaymentTransactionViewSet, basename="payment-transaction")

urlpatterns = router.urls
