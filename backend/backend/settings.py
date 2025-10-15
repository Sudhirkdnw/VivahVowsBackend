"""Django settings for the VivahVows backend project."""
from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path
from typing import Iterable, List


def _load_env_file(env_path: Path) -> None:
    """Populate ``os.environ`` with variables from a simple ``.env`` file."""

    if not env_path.exists():
        return

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _env(key: str, default: str | None = None) -> str | None:
    return os.environ.get(key, default)


def _env_bool(key: str, default: bool = False) -> bool:
    value = os.environ.get(key)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(key: str, default: int) -> int:
    value = os.environ.get(key)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def _env_list(key: str, default: Iterable[str] | None = None) -> List[str]:
    value = os.environ.get(key)
    if value is None:
        return list(default) if default is not None else []
    return [item.strip() for item in value.split(",") if item.strip()]


BASE_DIR = Path(__file__).resolve().parent.parent

ENV_PATH = BASE_DIR / ".." / ".env"
_load_env_file(ENV_PATH)

SECRET_KEY = _env(
    "DJANGO_SECRET_KEY",
    default="django-insecure-please-change-me-very-quickly",
) or "django-insecure-please-change-me-very-quickly"
DEBUG = _env_bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = _env_list("DJANGO_ALLOWED_HOSTS", default=["*"])

SITE_DOMAIN = _env("SITE_DOMAIN", default="localhost") or "localhost"
SITE_NAME = _env("SITE_NAME", default="VivahVows") or "VivahVows"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "backend.apps.users",
    "backend.apps.profiles",
    "backend.apps.matches",
    "backend.apps.photos",
    "backend.apps.notifications",
    "backend.apps.payments",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = "backend.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": _env(
            "POSTGRES_ENGINE",
            default="django.db.backends.postgresql",
        )
        or "django.db.backends.postgresql",
        "NAME": _env("POSTGRES_DB", default="vivahvows") or "vivahvows",
        "USER": _env("POSTGRES_USER", default="vivahvows") or "vivahvows",
        "PASSWORD": _env("POSTGRES_PASSWORD", default="changeme") or "changeme",
        "HOST": _env("POSTGRES_HOST", default="localhost") or "localhost",
        "PORT": _env("POSTGRES_PORT", default="5432") or "5432",
        "CONN_MAX_AGE": _env_int("POSTGRES_CONN_MAX_AGE", default=300),
        "OPTIONS": {
            "sslmode": _env("POSTGRES_SSL_MODE", default="prefer") or "prefer",
        },
    }
}

MONGODB_CONFIG = {
    "NAME": _env("MONGO_DB_NAME", default="vivahvows") or "vivahvows",
    "URI": _env("MONGO_DB_URI", default="mongodb://localhost:27017")
    or "mongodb://localhost:27017",
    "USER_COLLECTION": _env(
        "MONGO_USER_COLLECTION", default="user_search_profiles"
    )
    or "user_search_profiles",
    "MATCH_COLLECTION": _env(
        "MONGO_MATCH_COLLECTION", default="match_recommendations"
    )
    or "match_recommendations",
}

REDIS_URL = _env("REDIS_URL", default="redis://localhost:6379/0") or "redis://localhost:6379/0"
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "users.User"
SITE_ID = 1

LANGUAGE_CODE = "en-us"
TIME_ZONE = _env("DJANGO_TIME_ZONE", default="UTC") or "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "static"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
}

EMAIL_BACKEND = (
    _env("DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
    or "django.core.mail.backends.console.EmailBackend"
)
DEFAULT_FROM_EMAIL = _env("DEFAULT_FROM_EMAIL", default="no-reply@vivahvows.com") or "no-reply@vivahvows.com"

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = _env_list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:3000",
        "https://localhost:3000",
    ],
)
CSRF_TRUSTED_ORIGINS = _env_list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:3000",
        "https://localhost:3000",
    ],
)

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = _env_bool("SESSION_COOKIE_SECURE", default=True)
CSRF_COOKIE_SECURE = _env_bool("CSRF_COOKIE_SECURE", default=True)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

PASSWORD_RESET_TIMEOUT = 60 * 60  # 1 hour

FILE_STORAGE_BACKEND = _env(
    "FILE_STORAGE_BACKEND",
    default="cloudinary",
) or "cloudinary"

AWS_S3_BUCKET_NAME = _env("AWS_S3_BUCKET_NAME", default="vivahvows-media") or "vivahvows-media"
CLOUDINARY_FOLDER = _env("CLOUDINARY_FOLDER", default="vivahvows") or "vivahvows"

CELERY_BROKER_URL = _env("CELERY_BROKER_URL", default=REDIS_URL) or REDIS_URL
CELERY_RESULT_BACKEND = _env("CELERY_RESULT_BACKEND", default=REDIS_URL) or REDIS_URL

NOTIFICATION_CHANNELS = ["email", "push", "sms"]
MATCH_RECOMMENDATION_BATCH_SIZE = _env_int(
    "MATCH_RECOMMENDATION_BATCH_SIZE", default=10
)
