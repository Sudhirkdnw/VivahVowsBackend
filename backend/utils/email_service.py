"""Email helpers for password reset and verification."""
from __future__ import annotations

from django.conf import settings
from django.core.mail import send_mail


def send_verification_email(email: str, token: str) -> None:
    """Send a verification email to the user."""

    subject = "Verify your VivahVows account"
    message = (
        "Welcome to VivahVows!\n\n"
        "Please verify your account using the following token: {token}\n\n"
        "If you did not sign up for an account you can ignore this message."
    ).format(token=token)
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])


def send_password_reset_email(email: str, token: str) -> None:
    """Send a password reset email to the user."""

    subject = "Reset your VivahVows password"
    message = (
        "You requested a password reset. Use the token below to continue:\n\n"
        "{token}\n\n"
        "If you did not request this change please contact support immediately."
    ).format(token=token)
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
