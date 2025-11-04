"""ASGI config for VivahVows project with Django Channels."""
from __future__ import annotations

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from chat.routing import websocket_urlpatterns as chat_urlpatterns
from notifications.routing import websocket_urlpatterns as notification_urlpatterns
from users.middleware import JWTAuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vivahvows.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JWTAuthMiddlewareStack(
            URLRouter(chat_urlpatterns + notification_urlpatterns)
        ),
    }
)
