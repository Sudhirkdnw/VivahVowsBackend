"""Serializers for notifications."""
from __future__ import annotations

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serialize notification payloads."""

    class Meta:
        model = Notification
        fields = ["id", "type", "payload", "is_read", "created_at"]
        read_only_fields = ["id", "type", "payload", "created_at"]
