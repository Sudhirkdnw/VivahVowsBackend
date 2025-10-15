"""Custom user model for the VivahVows platform."""
from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


class User(AbstractUser):
    """Extend Django's user model with matchmaking specific fields."""

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("non_binary", "Non-binary"),
        ("prefer_not_to_say", "Prefer not to say"),
    ]

    email = models.EmailField("email address", unique=True)
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r"^[0-9+()\-\s]+$",
                message="Enter a valid phone number.",
            )
        ],
    )
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
    )
    onboarding_completed = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.get_full_name() or self.email
