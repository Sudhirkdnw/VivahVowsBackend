from __future__ import annotations

from rest_framework import serializers

from profiles.serializers import ProfileSerializer

from .models import ChatRoom, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "room", "sender", "content", "is_read", "created_at"]
        read_only_fields = ["id", "sender", "is_read", "created_at"]


class ChatRoomSerializer(serializers.ModelSerializer):
    partner = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ["id", "user_one", "user_two", "created_at", "partner"]
        read_only_fields = ["id", "user_one", "user_two", "created_at", "partner"]

    def get_partner(self, obj: ChatRoom):
        user = self.context["request"].user
        partner = obj.user_one if obj.user_two == user else obj.user_two
        return ProfileSerializer(partner.profile, context=self.context).data
