from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Interest, Profile

User = get_user_model()


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ["id", "name"]


class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    interests = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Interest.objects.all(), required=False
    )
    age = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "name",
            "dob",
            "gender",
            "city",
            "religion",
            "education",
            "profession",
            "interests",
            "bio",
            "photos",
            "is_email_verified",
            "preferred_gender",
            "preferred_age_min",
            "preferred_age_max",
            "preferred_city",
            "preferred_religion",
            "age",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_email_verified", "age", "created_at", "updated_at"]

    def get_age(self, obj: Profile) -> int | None:
        return obj.age

    def update(self, instance: Profile, validated_data: dict) -> Profile:
        interests = validated_data.pop("interests", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if interests is not None:
            instance.interests.set(interests)
        return instance
