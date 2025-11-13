from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class MatchAction(models.Model):
    STATUS_CHOICES = (
        ("liked", "Liked"),
        ("rejected", "Rejected"),
        ("blocked", "Blocked"),
    )

    initiator = models.ForeignKey(
        User, related_name="initiated_matches", on_delete=models.CASCADE
    )
    target = models.ForeignKey(User, related_name="received_matches", on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("initiator", "target")
        indexes = [
            models.Index(fields=["initiator", "status"]),
            models.Index(fields=["target", "status"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.initiator} -> {self.target} ({self.status})"


class MutualMatchQuerySet(models.QuerySet):
    def involving(self, user: User):
        return (
            self.filter(models.Q(user_one=user) | models.Q(user_two=user))
            .order_by("-created_at", "id")
        )


class MutualMatch(models.Model):
    user_one = models.ForeignKey(
        User, related_name="mutual_matches_as_user_one", on_delete=models.CASCADE
    )
    user_two = models.ForeignKey(
        User, related_name="mutual_matches_as_user_two", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(default=timezone.now)

    objects = MutualMatchQuerySet.as_manager()

    class Meta:
        ordering = ("-created_at", "id")
        constraints = [
            models.UniqueConstraint(
                fields=["user_one", "user_two"], name="unique_user_pair"
            ),
        ]
        indexes = [
            models.Index(fields=["user_one", "user_two"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Match({self.user_one} & {self.user_two})"

    @classmethod
    def get_or_create_mutual(cls, user_a, user_b):
        if user_a.id > user_b.id:
            user_a, user_b = user_b, user_a
        match, created = cls.objects.get_or_create(user_one=user_a, user_two=user_b)
        return match, created
