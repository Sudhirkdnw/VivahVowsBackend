"""Notification viewset for listing and marking read."""
from __future__ import annotations

from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """List notifications and mark them as read."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        if self.request.user.is_staff:
            return Notification.objects.all()
        return Notification.objects.filter(user=self.request.user)

    @action(methods=["post"], detail=False)
    def mark_all_read(self, request):
        """Bulk mark notifications as read."""

        updated = self.get_queryset().update(is_read=True)
        return Response({"updated": updated})
