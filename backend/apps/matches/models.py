"""Models representing matchmaking outcomes and suggestions."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class MatchStatus(models.TextChoices):
    """Enumerate the states of a match request."""

    PENDING = "pending", "Pending"
    ACCEPTED = "accepted", "Accepted"
    DECLINED = "declined", "Declined"
    BLOCKED = "blocked", "Blocked"


class Match(models.Model):
    """Persist mutual matches between two users."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="initiated_matches",
        on_delete=models.CASCADE,
    )
    matched_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="received_matches",
        on_delete=models.CASCADE,
    )
    status = models.CharField(
        max_length=20,
        choices=MatchStatus.choices,
        default=MatchStatus.PENDING,
    )
    compatibility_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="AI generated compatibility score from 0-100",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "matched_user")
        verbose_name = "match"
        verbose_name_plural = "matches"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"Match<{self.user_id}->{self.matched_user_id}>"


class MatchInteraction(models.Model):
    """Track likes, passes and other engagement signals."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="match_interactions",
        on_delete=models.CASCADE,
    )
    target = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="target_interactions",
        on_delete=models.CASCADE,
    )
    liked = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "target")
        verbose_name = "match interaction"
        verbose_name_plural = "match interactions"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"MatchInteraction<{self.user_id}->{self.target_id}>"
