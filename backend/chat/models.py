from __future__ import annotations

from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class ChatRoom(models.Model):
    user_one = models.ForeignKey(
        User, related_name="chatrooms_as_user_one", on_delete=models.CASCADE
    )
    user_two = models.ForeignKey(
        User, related_name="chatrooms_as_user_two", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user_one", "user_two"], name="unique_chat_pair"),
        ]
        indexes = [models.Index(fields=["user_one", "user_two"])]

    def __str__(self) -> str:  # pragma: no cover
        return f"ChatRoom({self.user_one} & {self.user_two})"

    @classmethod
    def get_or_create_room(cls, user_a, user_b):
        if user_a.id > user_b.id:
            user_a, user_b = user_b, user_a
        return cls.objects.get_or_create(user_one=user_a, user_two=user_b)


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["room", "created_at"])]

    def __str__(self) -> str:  # pragma: no cover
        return f"Message({self.sender} -> {self.room_id})"
