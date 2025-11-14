"""Django settings for VivahVows project."""
from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
APPS_DIR = Path(__file__).resolve().parent

# Environment configuration
env = environ.Env(
    DEBUG=(bool, True),
    SECRET_KEY=(str, "2n=u%lp5beui7ti%r(!u556j$@4_jvn_-*)9(o-mn8-t-=m251"),
    ALLOWED_HOSTS=(list, ["*"]),
)
env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY")

DEBUG = env("DEBUG")
ALLOWED_HOSTS = env("ALLOWED_HOSTS")

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "channels",
    "cloudinary",
    "cloudinary_storage",
    "users.apps.UsersConfig",
    "profiles.apps.ProfilesConfig",
    "matches.apps.MatchesConfig",
    "chat.apps.ChatConfig",
    "notifications.apps.NotificationsConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

]

ROOT_URLCONF = "vivahvows.urls"

FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"

template_dirs = [FRONTEND_DIST_DIR] if FRONTEND_DIST_DIR.exists() else []

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

WSGI_APPLICATION = "vivahvows.wsgi.application"
ASGI_APPLICATION = "vivahvows.asgi.application"

# Database configuration
DATABASES = {
    "default": {
        "ENGINE": env(
            "POSTGRES_ENGINE",
            default="django.db.backends.postgresql",
        ),
        "NAME": env("POSTGRES_DB", default="vivahvows"),
        "USER": env("POSTGRES_USER", default="postgres"),
        "PASSWORD": env("POSTGRES_PASSWORD", default="admin"),
        "HOST": env("POSTGRES_HOST", default="localhost"),
        "PORT": env("POSTGRES_PORT", default="5432"),
        "CONN_MAX_AGE": env.int("POSTGRES_CONN_MAX_AGE", default=300),
        "OPTIONS": {
            "sslmode": env("POSTGRES_SSL_MODE", default="prefer"),
        },
    }
}

# DATABASES = {
#     "default": dj_database_url.parse(
#         env(
#             "DATABASE_URL",
#             default="sqlite:///" + str(BASE_DIR / "db.sqlite3"),
#         ),
#         conn_max_age=600,
#     )
# }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',  # You can create this folder manually
]

FRONTEND_DIST_DIR = BASE_DIR / 'frontend' / 'dist'
if FRONTEND_DIST_DIR.exists():
    STATICFILES_DIRS.append(FRONTEND_DIST_DIR)


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

SITE_BASE_URL = env("SITE_BASE_URL", default="")
MEDIA_CDN_URL = env("MEDIA_CDN_URL", default="")



DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# REST Framework configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Cloudinary configuration
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME", default=""),
    "API_KEY": env("CLOUDINARY_API_KEY", default=""),
    "API_SECRET": env("CLOUDINARY_API_SECRET", default=""),
}
if CLOUDINARY_STORAGE["CLOUD_NAME"]:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
else:  # pragma: no cover - local development fallback
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

# Email configuration - console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'Shreyankapatil.in@gmail.com'
EMAIL_HOST_PASSWORD = 'npil zuse eemz vtde'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Channels configuration
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# Caching for frequently accessed data (match suggestions etc.)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "vivahvows-cache",
    }
}

LOGIN_REDIRECT_URL = "/"
