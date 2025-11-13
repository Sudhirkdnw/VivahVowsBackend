from django.contrib import admin
from django.utils.html import format_html
from django.contrib.auth import get_user_model

from .models import Interest, Profile, ProfilePhoto

User = get_user_model()


# --------------------------- #
#  Interest Admin
# --------------------------- #
@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    ordering = ("name",)


# --------------------------- #
#  ProfilePhoto Inline (for Profile)
# --------------------------- #
class ProfilePhotoInline(admin.TabularInline):
    model = ProfilePhoto
    extra = 1  # how many empty forms to show by default
    fields = ("image", "image_tag", "uploaded_at")
    readonly_fields = ("image_tag", "uploaded_at")

    def has_add_permission(self, request, obj=None):
        """Allow adding only if profile exists"""
        return True

    def has_change_permission(self, request, obj=None):
        return True


# --------------------------- #
#  Profile Admin
# --------------------------- #
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user_link",
        "name",
        "gender",
        "city",
        "religion",
        "is_email_verified",
        "created_at",
        "updated_at",
    )
    list_filter = ("gender", "city", "religion", "is_email_verified")
    search_fields = (
        "user__username",
        "name",
        "city",
        "religion",
        "education",
        "profession",
    )
    ordering = ("-updated_at",)
    readonly_fields = ("created_at", "updated_at")
    filter_horizontal = ("interests",)
    inlines = [ProfilePhotoInline]

    fieldsets = (
        ("Basic Info", {
            "fields": (
                "user",
                "name",
                "dob",
                "gender",
                "bio",
            )
        }),
        ("Location & Education", {
            "fields": (
                "city",
                "religion",
                "education",
                "profession",
            )
        }),
        ("Preferences", {
            "fields": (
                "preferred_gender",
                ("preferred_age_min", "preferred_age_max"),
                "preferred_city",
                "preferred_religion",
            )
        }),
        ("Other Info", {
            "fields": (
                "is_email_verified",
                "interests",
                "created_at",
                "updated_at",
            )
        }),
    )

    def user_link(self, obj):
        """Clickable link to related User in admin"""
        if obj.user:
            return format_html(
                '<a href="/admin/{}/{}/{}/change/">{}</a>',
                obj.user._meta.app_label,
                obj.user._meta.model_name,
                obj.user.pk,
                obj.user.username,
            )
        return "-"
    user_link.short_description = "User"
    user_link.admin_order_field = "user__username"


# --------------------------- #
#  ProfilePhoto Admin (optional)
# --------------------------- #
@admin.register(ProfilePhoto)
class ProfilePhotoAdmin(admin.ModelAdmin):
    list_display = ("profile", "image_tag", "uploaded_at")
    search_fields = ("profile__name", "profile__user__username")
    readonly_fields = ("image_tag", "uploaded_at")
    list_select_related = ("profile",)
    ordering = ("-uploaded_at",)

    def image_tag(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="70" height="70" style="border-radius:8px;object-fit:cover;"/>',
                obj.image.url,
            )
        return "-"
    image_tag.short_description = "Preview"


# --------------------------- #
#  Attach Profile inline to User (for full edit access)
# --------------------------- #
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"
    readonly_fields = ("created_at", "updated_at")
    fields = (
        "name",
        "dob",
        "gender",
        "city",
        "religion",
        "education",
        "profession",
        "bio",
        "is_email_verified",
        "preferred_gender",
        ("preferred_age_min", "preferred_age_max"),
        "preferred_city",
        "preferred_religion",
        "created_at",
        "updated_at",
    )


# unregister the default User admin and re-register it with Profile inline
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    """Extended User admin with Profile inline"""
    inlines = (ProfileInline,)
    list_display = ("username", "email", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email")
    ordering = ("username",)
