"""Utility functions for AI driven match recommendations."""
from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model

User = get_user_model()


def generate_mock_recommendations(user: User) -> list[dict[str, Any]]:
    """Return placeholder recommendations until ML model is integrated."""

    base_score = 75
    recommendations = []
    for index in range(1, 6):
        recommendations.append(
            {
                "rank": index,
                "user_id": index,
                "compatibility_score": base_score - index,
                "reason": "Shared interests and matching preferences.",
            }
        )
    return recommendations
