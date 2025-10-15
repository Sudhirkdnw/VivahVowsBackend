"""Serializers for profile and preference management."""
from __future__ import annotations

from rest_framework import serializers

from .models import Preference, Profile


class PreferenceSerializer(serializers.ModelSerializer):
    """Serialize preference objects."""

    class Meta:
        model = Preference
        fields = [
            "preferred_age_min",
            "preferred_age_max",
            "preferred_locations",
            "preferred_professions",
            "preferred_religions",
            "interests",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    """Serialize profile data with nested preferences."""

    user = serializers.PrimaryKeyRelatedField(read_only=True)
    preference = PreferenceSerializer(required=False)

    class Meta:
        model = Profile
        fields = [
            "user",
            "date_of_birth",
            "gender",
            "city",
            "country",
            "religion",
            "profession",
            "about",
            "height_cm",
            "education",
            "languages_spoken",
            "hobbies",
            "horoscope_sign",
            "preference",
        ]

    def update(self, instance: Profile, validated_data: dict) -> Profile:
        preference_data = validated_data.pop("preference", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if preference_data is not None:
            Preference.objects.update_or_create(
                user=instance.user, defaults=preference_data
            )
        return instance

    def create(self, validated_data: dict) -> Profile:
        preference_data = validated_data.pop("preference", None)
        profile = Profile.objects.create(**validated_data)
        if preference_data:
            Preference.objects.update_or_create(
                user=profile.user, defaults=preference_data
            )
        return profile
