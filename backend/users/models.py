from __future__ import annotations

import uuid
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

User = get_user_model()


class ExpiringTokenMixin(models.Model):
    """Abstract base model for expiring tokens."""

    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def mark_used(self) -> None:
        self.is_used = True
        self.save(update_fields=["is_used"])

    def has_expired(self) -> bool:
        return timezone.now() > self.expires_at


class EmailVerificationToken(ExpiringTokenMixin):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_tokens")

    def save(self, *args, **kwargs) -> None:
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=2)
        super().save(*args, **kwargs)


class PasswordResetToken(ExpiringTokenMixin):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_tokens")

    def save(self, *args, **kwargs) -> None:
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)
