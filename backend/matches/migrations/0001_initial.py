from __future__ import annotations

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="MatchAction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "status",
                    models.CharField(
                        choices=[("liked", "Liked"), ("rejected", "Rejected"), ("blocked", "Blocked")],
                        max_length=10,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "initiator",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="initiated_matches",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "target",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="received_matches",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"unique_together": {("initiator", "target")}},
        ),
        migrations.CreateModel(
            name="MutualMatch",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(default=timezone.now)),
                (
                    "user_one",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mutual_matches_as_user_one",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "user_two",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mutual_matches_as_user_two",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AddIndex(
            model_name="matchaction",
            index=models.Index(fields=["initiator", "status"], name="matches_ma_initia_0a03b9_idx"),
        ),
        migrations.AddIndex(
            model_name="matchaction",
            index=models.Index(fields=["target", "status"], name="matches_ma_target_d97ab0_idx"),
        ),
        migrations.AddConstraint(
            model_name="mutualmatch",
            constraint=models.UniqueConstraint(fields=["user_one", "user_two"], name="unique_user_pair"),
        ),
        migrations.AddIndex(
            model_name="mutualmatch",
            index=models.Index(fields=["user_one", "user_two"], name="matches_mu_user_on_8f1a4a_idx"),
        ),
    ]
