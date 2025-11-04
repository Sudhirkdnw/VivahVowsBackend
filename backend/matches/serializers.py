from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from profiles.serializers import ProfileSerializer

from .models import MatchAction, MutualMatch

User = get_user_model()


class MatchActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchAction
        fields = ["id", "initiator", "target", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "initiator", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["initiator"] = self.context["request"].user
        return super().create(validated_data)


class MutualMatchSerializer(serializers.ModelSerializer):
    partner_profile = serializers.SerializerMethodField()

    class Meta:
        model = MutualMatch
        fields = ["id", "user_one", "user_two", "created_at", "partner_profile"]
        read_only_fields = ["id", "user_one", "user_two", "created_at", "partner_profile"]

    def get_partner_profile(self, obj: MutualMatch):
        request_user = self.context["request"].user
        partner = obj.user_one if obj.user_two == request_user else obj.user_two
        return ProfileSerializer(partner.profile, context=self.context).data
