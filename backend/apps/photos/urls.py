"""Routes for photo endpoints."""
from __future__ import annotations

from rest_framework.routers import DefaultRouter

from .views import PhotoViewSet

router = DefaultRouter()
router.register("", PhotoViewSet, basename="photo")

urlpatterns = router.urls
