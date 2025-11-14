# matches/admin.py

from django.contrib import admin

from .models import MatchAction, MutualMatch


# ---------- Custom actions for MatchAction ----------

@admin.action(description="Mark selected actions as LIKED")
def mark_as_liked(modeladmin, request, queryset):
    queryset.update(status="liked")


@admin.action(description="Mark selected actions as REJECTED")
def mark_as_rejected(modeladmin, request, queryset):
    queryset.update(status="rejected")


@admin.action(description="Mark selected actions as BLOCKED")
def mark_as_blocked(modeladmin, request, queryset):
    queryset.update(status="blocked")


@admin.register(MatchAction)
class MatchActionAdmin(admin.ModelAdmin):
    # List page columns
    list_display = (
        "id",
        "initiator",
        "target",
        "status",
        "created_at",
        "updated_at",
    )

    # Right side filters
    list_filter = (
        "status",
        "created_at",
        "updated_at",
    )

    # Search bar (User model me username/email honi chahiye)
    search_fields = (
        "initiator__username",
        "initiator__email",
        "target__username",
        "target__email",
    )

    # Performance ke liye related user ko select_related se laayenge
    list_select_related = ("initiator", "target")

    # Default ordering
    ordering = ("-created_at", "-id")

    # User fields ke liye autocomplete dropdown
    autocomplete_fields = ("initiator", "target")

    # Per page rows
    list_per_page = 50

    # Custom actions
    actions = [mark_as_liked, mark_as_rejected, mark_as_blocked]


@admin.register(MutualMatch)
class MutualMatchAdmin(admin.ModelAdmin):
    # List page columns
    list_display = (
        "id",
        "user_one",
        "user_two",
        "created_at",
    )

    # Filters
    list_filter = (
        "created_at",
    )

    # Search by users
    search_fields = (
        "user_one__username",
        "user_one__email",
        "user_two__username",
        "user_two__email",
    )

    # Performance
    list_select_related = ("user_one", "user_two")

    # Default ordering (models me bhi ye hi ordering hai)
    ordering = ("-created_at", "id")

    # User fields autocomplete
    autocomplete_fields = ("user_one", "user_two")

    # created_at ko readonly rakhenge
    readonly_fields = ("created_at",)

    list_per_page = 50
