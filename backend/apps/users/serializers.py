"""Serializers for authentication and user management."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Lightweight representation of a user profile."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "gender",
            "onboarding_completed",
            "is_premium",
        ]
        read_only_fields = ["id", "is_premium", "onboarding_completed"]


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer used for new account registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "gender",
            "access",
            "refresh",
        ]
        read_only_fields = ["id", "access", "refresh"]

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        refresh = RefreshToken.for_user(user)
        self.context["tokens"] = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        return user

    def to_representation(self, instance: User) -> dict:
        data = super().to_representation(instance)
        tokens = self.context.get("tokens", {})
        data.update(tokens)
        return data
