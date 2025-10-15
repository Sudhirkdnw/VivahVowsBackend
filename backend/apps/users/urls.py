"""URL routing for user-related endpoints."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import UserViewSet

router = DefaultRouter()
router.register("", UserViewSet, basename="user")

urlpatterns = router.urls
