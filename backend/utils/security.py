"""Security utilities for token management and hashing."""
from __future__ import annotations

import hashlib
import hmac
from typing import Final

from django.conf import settings
from django.utils.crypto import get_random_string

_SECRET: Final[str] = settings.SECRET_KEY


def generate_secure_token(length: int = 48) -> str:
    """Generate a cryptographically secure random token."""

    return get_random_string(length=length)


def verify_signature(message: str, signature: str) -> bool:
    """Verify that the provided signature matches the message."""

    digest = hmac.new(_SECRET.encode(), msg=message.encode(), digestmod=hashlib.sha256)
    expected = digest.hexdigest()
    return hmac.compare_digest(expected, signature)
