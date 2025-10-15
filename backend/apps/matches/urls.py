"""Routes for matchmaking endpoints."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import MatchInteractionViewSet, MatchViewSet

router = DefaultRouter()
router.register("", MatchViewSet, basename="match")
router.register("interactions", MatchInteractionViewSet, basename="match-interaction")

urlpatterns = router.urls
