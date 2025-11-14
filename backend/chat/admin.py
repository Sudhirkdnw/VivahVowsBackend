# chat/admin.py

from django.contrib import admin

from .models import ChatRoom, Message


# --------- Custom actions for Message ---------

@admin.action(description="Mark selected messages as READ")
def mark_messages_read(modeladmin, request, queryset):
    queryset.update(is_read=True)


@admin.action(description="Mark selected messages as UNREAD")
def mark_messages_unread(modeladmin, request, queryset):
    queryset.update(is_read=False)


# --------- ChatRoom admin ---------

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    # List page columns
    list_display = (
        "id",
        "user_one",
        "user_two",
        "created_at",
        "messages_count",
        "last_message_preview",
    )

    # Filters
    list_filter = (
        "created_at",
    )

    # Search (User model me username/email hone assume kiya hai)
    search_fields = (
        "user_one__username",
        "user_one__email",
        "user_two__username",
        "user_two__email",
    )

    # Performance
    list_select_related = ("user_one", "user_two")

    # User fields ke liye autocomplete
    autocomplete_fields = ("user_one", "user_two")

    # Default ordering
    ordering = ("-created_at", "-id")

    list_per_page = 50

    readonly_fields = ("created_at",)

    # Helper methods

    def messages_count(self, obj: ChatRoom):
        return obj.messages.count()

    messages_count.short_description = "Total messages"

    def last_message_preview(self, obj: ChatRoom):
        last_msg = obj.messages.order_by("-created_at").first()
        if not last_msg:
            return "-"
        text = last_msg.content or ""
        return (text[:50] + "...") if len(text) > 50 else text

    last_message_preview.short_description = "Last message"


# --------- Message admin ---------

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    # List page columns
    list_display = (
        "id",
        "room",
        "sender",
        "short_content",
        "is_read",
        "created_at",
    )

    # Filters
    list_filter = (
        "is_read",
        "created_at",
        "room",
    )

    # Search (sender + content)
    search_fields = (
        "sender__username",
        "sender__email",
        "room__id",
        "content",
    )

    # Performance
    list_select_related = ("room", "sender")

    # Default ordering (Message model me already created_at ordering hai)
    ordering = ("-created_at", "-id")

    list_per_page = 50

    # Custom actions
    actions = [mark_messages_read, mark_messages_unread]

    readonly_fields = ("created_at",)

    # Helper method for small content preview
    def short_content(self, obj: Message):
        if not obj.content:
            return "-"
        text = obj.content
        return (text[:60] + "...") if len(text) > 60 else text

    short_content.short_description = "Content"
