from __future__ import annotations

from datetime import date

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

User = settings.AUTH_USER_MODEL


class Interest(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Profile(models.Model):
    GENDER_CHOICES = (
        ("male", "Male"),
        ("female", "Female"),
        ("non_binary", "Non-binary"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    name = models.CharField(max_length=150, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    city = models.CharField(max_length=100, blank=True)
    religion = models.CharField(max_length=100, blank=True)
    education = models.CharField(max_length=200, blank=True)
    profession = models.CharField(max_length=200, blank=True)
    interests = models.ManyToManyField(Interest, related_name="profiles", blank=True)
    bio = models.TextField(blank=True)
    photos = models.JSONField(default=list, blank=True)
    is_email_verified = models.BooleanField(default=False)

    preferred_gender = models.CharField(max_length=20, blank=True)
    preferred_age_min = models.PositiveIntegerField(
        default=21, validators=[MinValueValidator(18), MaxValueValidator(100)]
    )
    preferred_age_max = models.PositiveIntegerField(
        default=40, validators=[MinValueValidator(18), MaxValueValidator(100)]
    )
    preferred_city = models.CharField(max_length=100, blank=True)
    preferred_religion = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["religion"]),
            models.Index(fields=["gender"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Profile({self.user.username})"

    @property
    def age(self) -> int | None:
        if not self.dob:
            return None
        today = date.today()
        return today.year - self.dob.year - (
            (today.month, today.day) < (self.dob.month, self.dob.day)
        )
