# notifications/admin.py

from django.contrib import admin

from .models import Notification


@admin.action(description="Mark selected notifications as READ")
def mark_as_read(modeladmin, request, queryset):
    queryset.update(is_read=True)


@admin.action(description="Mark selected notifications as UNREAD")
def mark_as_unread(modeladmin, request, queryset):
    queryset.update(is_read=False)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    # admin list page me columns
    list_display = (
        "id",
        "user",
        "event",
        "is_read",
        "short_payload",
        "created_at",
    )

    # right side filter
    list_filter = (
        "event",
        "is_read",
        "created_at",
    )

    # search bar
    # yahan pe apne User model ke fields ke hisaab se change kar sakta hai
    search_fields = (
        "user__username",
        "user__email",
        "payload",
    )

    # record detail page me read-only fields
    readonly_fields = ("created_at",)

    # list page me default ordering
    ordering = ("-created_at",)

    # user choose karne ke liye dropdown ke jagah search box aayega
    autocomplete_fields = ("user",)

    # per page kitne notifications dikhane hai
    list_per_page = 50

    # custom actions
    actions = [mark_as_read, mark_as_unread]

    # payload ko chota dikhane ke liye helper method
    def short_payload(self, obj):
        if not obj.payload:
            return "-"
        text = str(obj.payload)
        return (text[:75] + "...") if len(text) > 75 else text

    short_payload.short_description = "Payload"
