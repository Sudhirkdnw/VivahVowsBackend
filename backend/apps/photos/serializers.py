"""Serializers for handling photo uploads and updates."""
from __future__ import annotations

from rest_framework import serializers

from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    """Serialize photo metadata."""

    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Photo
        fields = ["id", "user", "image_url", "is_primary", "metadata", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

    def create(self, validated_data: dict) -> Photo:
        request = self.context["request"]
        photo = Photo.objects.create(user=request.user, **validated_data)
        if photo.is_primary:
            Photo.objects.filter(user=request.user).exclude(id=photo.id).update(
                is_primary=False
            )
        return photo

    def update(self, instance: Photo, validated_data: dict) -> Photo:
        was_primary = instance.is_primary
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if instance.is_primary and not was_primary:
            Photo.objects.filter(user=instance.user).exclude(id=instance.id).update(
                is_primary=False
            )
        return instance
