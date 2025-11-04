from __future__ import annotations

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model

from matches.models import MutualMatch
from notifications.utils import push_notification

from .models import ChatRoom, Message

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return

        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        room = await self._get_room()
        if room is None:
            await self.close()
            return

        self.room_group_name = f"chat_{self.room_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):  # pragma: no cover - websocket teardown
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message = content.get("message")
        if not message:
            return
        user = self.scope["user"]
        message_obj = await self._create_message(user, message)
        payload = {
            "id": message_obj.id,
            "room": message_obj.room_id,
            "sender": user.id,
            "content": message_obj.content,
            "created_at": message_obj.created_at.isoformat(),
        }
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": payload}
        )

    async def chat_message(self, event):
        await self.send_json(event["message"])

    @database_sync_to_async
    def _get_room(self):
        try:
            room = ChatRoom.objects.select_related("user_one", "user_two").get(
                pk=self.room_id
            )
        except ChatRoom.DoesNotExist:
            return None
        user = self.scope["user"]
        if user not in {room.user_one, room.user_two}:
            return None
        MutualMatch.get_or_create_mutual(room.user_one, room.user_two)
        return room

    @database_sync_to_async
    def _create_message(self, user, content: str):
        room = ChatRoom.objects.get(pk=self.room_id)
        message = Message.objects.create(room=room, sender=user, content=content)
        partner = room.user_one if room.user_two == user else room.user_two
        push_notification(partner, "message", {"room_id": room.id, "sender_id": user.id})
        return message
