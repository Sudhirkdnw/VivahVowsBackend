"""API endpoints for matchmaking interactions and recommendations."""
from __future__ import annotations

from django.db import models
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.utils.ai_matcher import generate_mock_recommendations

from .models import Match, MatchInteraction
from .serializers import MatchInteractionSerializer, MatchSerializer


class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    """Expose read-only access to matches and AI recommendations."""

    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # type: ignore[override]
        user = self.request.user
        return Match.objects.filter(models.Q(user=user) | models.Q(matched_user=user))

    @action(methods=["get"], detail=False)
    def recommendations(self, request):
        """Return AI generated match recommendations."""

        matches = generate_mock_recommendations(request.user)
        return Response(matches)


class MatchInteractionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Record likes and passes for matchmaking."""

    serializer_class = MatchInteractionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = MatchInteraction.objects.all()

    def create(self, request, *args, **kwargs):  # type: ignore[override]
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            request.user.onboarding_completed = True
            request.user.save(update_fields=["onboarding_completed"])
        return response
