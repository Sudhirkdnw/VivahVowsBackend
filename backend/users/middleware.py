from __future__ import annotations

from urllib.parse import parse_qs

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


class JWTAuthMiddleware:
    """Authenticate WebSocket connections using JWT access tokens."""

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query = parse_qs(query_string)
        token_list = query.get("token")
        if token_list:
            token = token_list[0]
            user = await self._get_user_from_token(token)
            scope["user"] = user or AnonymousUser()
        else:
            scope["user"] = AnonymousUser()
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def _get_user_from_token(self, token: str):
        try:
            validated = AccessToken(token)
            return User.objects.get(id=validated.get("user_id"))
        except Exception:  # pragma: no cover - invalid tokens simply yield anonymous
            return None


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
