from __future__ import annotations

import django.db.models.deletion
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Interest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, unique=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Profile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(blank=True, max_length=150)),
                ("dob", models.DateField(blank=True, null=True)),
                (
                    "gender",
                    models.CharField(
                        blank=True,
                        choices=[("male", "Male"), ("female", "Female"), ("non_binary", "Non-binary")],
                        max_length=20,
                    ),
                ),
                ("city", models.CharField(blank=True, max_length=100)),
                ("religion", models.CharField(blank=True, max_length=100)),
                ("education", models.CharField(blank=True, max_length=200)),
                ("profession", models.CharField(blank=True, max_length=200)),
                ("bio", models.TextField(blank=True)),
                ("photos", models.JSONField(blank=True, default=list)),
                ("is_email_verified", models.BooleanField(default=False)),
                ("preferred_gender", models.CharField(blank=True, max_length=20)),
                (
                    "preferred_age_min",
                    models.PositiveIntegerField(
                        default=21,
                        validators=[MinValueValidator(18), MaxValueValidator(100)],
                    ),
                ),
                (
                    "preferred_age_max",
                    models.PositiveIntegerField(
                        default=40,
                        validators=[MinValueValidator(18), MaxValueValidator(100)],
                    ),
                ),
                ("preferred_city", models.CharField(blank=True, max_length=100)),
                ("preferred_religion", models.CharField(blank=True, max_length=100)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "interests",
                    models.ManyToManyField(blank=True, related_name="profiles", to="profiles.interest"),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.AddIndex(
            model_name="profile",
            index=models.Index(fields=["city"], name="profiles_pr_city_7cd829_idx"),
        ),
        migrations.AddIndex(
            model_name="profile",
            index=models.Index(fields=["religion"], name="profiles_pr_religi_25d4b9_idx"),
        ),
        migrations.AddIndex(
            model_name="profile",
            index=models.Index(fields=["gender"], name="profiles_pr_gender_759fa7_idx"),
        ),
    ]
