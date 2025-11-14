from __future__ import annotations
from datetime import date
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.html import format_html  # for admin image preview
from urllib.parse import urljoin

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

    # photos = models.JSONField(default=list, blank=True)  # ❌ old JSON-based photos removed
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


# ✅ new model for multiple photo uploads
class ProfilePhoto(models.Model):
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField(upload_to="profile_photos/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at", "-id"]

    def __str__(self):
        return f"{self.profile.name or self.profile.user.username} - Photo"

    def get_image_url(self, request=None) -> str:
        """Return an absolute URL for this photo, handling CDN/base overrides."""
        if not self.image:
            return ""

        url = self.image.url
        if url.startswith("http://") or url.startswith("https://"):
            return url

        media_base = getattr(settings, "MEDIA_CDN_URL", "") or ""
        if media_base:
            return urljoin(media_base.rstrip("/") + "/", url.lstrip("/"))

        if request is not None:
            return request.build_absolute_uri(url)

        site_base = getattr(settings, "SITE_BASE_URL", "") or ""
        if site_base:
            return urljoin(site_base.rstrip("/") + "/", url.lstrip("/"))

        return url

    def image_tag(self):
        """Show thumbnail preview in Django admin"""
        image_url = self.get_image_url()
        if image_url:
            return format_html(
                '<img src="{}" width="80" height="80" style="border-radius:6px; object-fit:cover;"/>',
                image_url,
            )
        return ""

    image_tag.short_description = "Preview"
