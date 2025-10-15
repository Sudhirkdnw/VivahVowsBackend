"""Profile viewsets for managing personal information and preferences."""
from __future__ import annotations

from rest_framework import mixins, permissions, viewsets

from .models import Profile
from .serializers import ProfileSerializer


class ProfileViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Allow authenticated users to view and update their profile."""

    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        if self.request.user.is_staff:
            return Profile.objects.select_related("user")
        return Profile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):  # type: ignore[override]
        serializer.save(user=self.request.user)
