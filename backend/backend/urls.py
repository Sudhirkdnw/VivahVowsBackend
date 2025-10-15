"""Core URL configuration for the VivahVows backend."""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path
from rest_framework import permissions
from rest_framework.documentation import include_docs_urls

API_TITLE = "VivahVows API"
API_DESCRIPTION = "REST endpoints for authentication, profiles, matches, and notifications."

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("backend.apps.users.urls")),
    path("api/profiles/", include("backend.apps.profiles.urls")),
    path("api/matches/", include("backend.apps.matches.urls")),
    path("api/photos/", include("backend.apps.photos.urls")),
    path("api/notifications/", include("backend.apps.notifications.urls")),
    path("api/payments/", include("backend.apps.payments.urls")),
    path(
        "docs/",
        include_docs_urls(
            title=API_TITLE,
            description=API_DESCRIPTION,
            permission_classes=[permissions.AllowAny],
        ),
    ),
]
