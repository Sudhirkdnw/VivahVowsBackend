"""Serializers powering the matchmaking APIs."""
from __future__ import annotations

from rest_framework import serializers

from .models import Match, MatchInteraction


class MatchSerializer(serializers.ModelSerializer):
    """Serialize mutual matches."""

    user = serializers.PrimaryKeyRelatedField(read_only=True)
    matched_user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "user",
            "matched_user",
            "status",
            "compatibility_score",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "matched_user",
            "created_at",
            "updated_at",
            "compatibility_score",
        ]


class MatchInteractionSerializer(serializers.ModelSerializer):
    """Capture like / pass interactions between users."""

    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = MatchInteraction
        fields = ["id", "user", "target", "liked", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

    def create(self, validated_data: dict) -> MatchInteraction:
        request = self.context["request"]
        validated_data["user"] = request.user
        return super().create(validated_data)
