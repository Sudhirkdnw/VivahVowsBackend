from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from profiles.models import Profile

from .models import EmailVerificationToken, PasswordResetToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "email"]

    def update(self, instance, validated_data):
        username = validated_data.get("username")
        if username and User.objects.exclude(pk=instance.pk).filter(
            username__iexact=username
        ):
            raise serializers.ValidationError(
                {"username": _("A user with that username already exists.")}
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if validated_data:
            instance.save(update_fields=list(validated_data.keys()))

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.save()
        Profile.objects.get_or_create(user=user)
        self._send_verification_email(user)
        return user

    def _send_verification_email(self, user: User) -> None:
        token = EmailVerificationToken.objects.create(user=user)
        request = self.context.get("request")
        context = {
            "user": user,
            "token": token.token,
            "request_scheme": getattr(request, "scheme", "https"),
            "request_domain": getattr(request, "get_host", lambda: "vivahvows.com")(),
        }
        subject = "Verify your VivahVows account"
        message = render_to_string(
            "emails/verify_email.txt",
            context,
        )
        send_mail(subject, message, None, [user.email], fail_silently=True)


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.UUIDField()

    def validate(self, attrs: dict) -> dict:
        try:
            token = EmailVerificationToken.objects.select_related("user").get(
                token=attrs["token"], is_used=False
            )
        except EmailVerificationToken.DoesNotExist as exc:  # pragma: no cover
            raise serializers.ValidationError({"token": _("Invalid token")}) from exc

        if token.has_expired():
            raise serializers.ValidationError({"token": _("Token has expired")})

        attrs["token_obj"] = token
        return attrs

    def save(self, **kwargs) -> User:
        token: EmailVerificationToken = self.validated_data["token_obj"]
        profile = Profile.objects.get(user=token.user)
        profile.is_email_verified = True
        profile.save(update_fields=["is_email_verified"])
        token.mark_used()
        return token.user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs: dict) -> dict:
        try:
            attrs["user"] = User.objects.get(email__iexact=attrs["email"])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"email": _("User not found")}) from exc
        return attrs

    def save(self, **kwargs) -> None:
        user = self.validated_data["user"]
        token = PasswordResetToken.objects.create(user=user)
        subject = "VivahVows password reset"
        message = render_to_string(
            "emails/password_reset.txt",
            {"user": user, "token": token.token},
        )
        send_mail(subject, message, None, [user.email], fail_silently=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True)

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate(self, attrs: dict) -> dict:
        try:
            token = PasswordResetToken.objects.select_related("user").get(
                token=attrs["token"], is_used=False
            )
        except PasswordResetToken.DoesNotExist as exc:
            raise serializers.ValidationError({"token": _("Invalid token")}) from exc
        if token.has_expired():
            raise serializers.ValidationError({"token": _("Token has expired")})
        attrs["token_obj"] = token
        return attrs

    def save(self, **kwargs) -> User:
        token: PasswordResetToken = self.validated_data["token_obj"]
        password = self.validated_data["password"]
        user = token.user
        user.set_password(password)
        user.save(update_fields=["password"])
        token.mark_used()
        return user
