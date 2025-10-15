"""Viewsets for photo management."""
from __future__ import annotations

from rest_framework import permissions, viewsets

from .models import Photo
from .serializers import PhotoSerializer


class PhotoViewSet(viewsets.ModelViewSet):
    """Allow users to manage their photo library."""

    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        if self.request.user.is_staff:
            return Photo.objects.all()
        return Photo.objects.filter(user=self.request.user)
