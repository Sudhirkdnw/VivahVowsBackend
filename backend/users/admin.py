from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import EmailVerificationToken, PasswordResetToken

User = get_user_model()

# ✅ Unregister default User admin first (to avoid AlreadyRegistered error)
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced UserAdmin that allows editing, adding, and managing users."""

    form = UserChangeForm
    add_form = UserCreationForm

    # Columns visible in user list page
    list_display = (
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )

    # Filters on right sidebar
    list_filter = ("is_active", "is_staff", "is_superuser", "groups")

    # Search bar fields
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)

    # Read-only info
    readonly_fields = ("last_login", "date_joined")

    # Fields shown when editing an existing user
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    # Fields shown when adding a new user
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )


# ✅ Email verification token admin
@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "token", "is_used", "created_at", "expires_at")
    list_filter = ("is_used",)
    search_fields = ("user__username", "user__email", "token")
    readonly_fields = ("token", "created_at", "expires_at")


# ✅ Password reset token admin
@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "token", "is_used", "created_at", "expires_at")
    list_filter = ("is_used",)
    search_fields = ("user__username", "user__email", "token")
    readonly_fields = ("token", "created_at", "expires_at")
