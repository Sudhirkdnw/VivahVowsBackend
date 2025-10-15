"""Profile models capturing matchmaking preferences and details."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Preference(models.Model):
    """Store a user's high-level partner preferences."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name="preference",
        on_delete=models.CASCADE,
    )
    preferred_age_min = models.PositiveSmallIntegerField(default=18)
    preferred_age_max = models.PositiveSmallIntegerField(default=60)
    preferred_locations = models.JSONField(default=list, blank=True)
    preferred_professions = models.JSONField(default=list, blank=True)
    preferred_religions = models.JSONField(default=list, blank=True)
    interests = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"Preference<{self.user_id}>"


class Profile(models.Model):
    """Extend the core user model with detailed matchmaking data."""

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("non_binary", "Non-binary"),
        ("prefer_not_to_say", "Prefer not to say"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name="profile",
        on_delete=models.CASCADE,
    )
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
    )
    city = models.CharField(max_length=128, blank=True)
    country = models.CharField(max_length=128, blank=True)
    religion = models.CharField(max_length=128, blank=True)
    profession = models.CharField(max_length=128, blank=True)
    about = models.TextField(blank=True)
    height_cm = models.PositiveSmallIntegerField(null=True, blank=True)
    education = models.CharField(max_length=128, blank=True)
    languages_spoken = models.JSONField(default=list, blank=True)
    hobbies = models.JSONField(default=list, blank=True)
    horoscope_sign = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"Profile<{self.user_id}>"
