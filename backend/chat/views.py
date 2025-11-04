from __future__ import annotations

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from matches.models import MutualMatch
from notifications.utils import push_notification

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer


class ChatRoomListView(generics.ListAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(Q(user_one=user) | Q(user_two=user)).order_by("-created_at")


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room = self._get_room()
        return room.messages.select_related("sender")

    def perform_create(self, serializer):
        room = self._get_room()
        sender = self.request.user
        serializer.save(room=room, sender=sender)
        partner = room.user_one if room.user_two == sender else room.user_two
        push_notification(partner, "message", {"room_id": room.id, "sender_id": sender.id})

    def _get_room(self):
        room = get_object_or_404(ChatRoom, pk=self.kwargs["room_id"])
        user = self.request.user
        if user not in {room.user_one, room.user_two}:
            raise PermissionDenied("You are not allowed to access this chat room.")
        MutualMatch.get_or_create_mutual(room.user_one, room.user_two)
        return room
