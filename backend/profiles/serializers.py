from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Interest, Profile, ProfilePhoto

User = get_user_model()


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ["id", "name"]


class ProfilePhotoSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = ProfilePhoto
        fields = ["id", "image", "uploaded_at"]
        read_only_fields = ["id", "image", "uploaded_at"]


class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    interests = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Interest.objects.all(), required=False
    )
    age = serializers.SerializerMethodField()
    photos = ProfilePhotoSerializer(many=True, read_only=True)
    new_photos = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    remove_photo_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    clear_interests = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user",
            "name",
            "dob",
            "gender",
            "city",
            "religion",
            "education",
            "profession",
            "interests",
            "bio",
            "photos",
            "is_email_verified",
            "preferred_gender",
            "preferred_age_min",
            "preferred_age_max",
            "preferred_city",
            "preferred_religion",
            "age",
            "created_at",
            "updated_at",
            "new_photos",
            "remove_photo_ids",
            "clear_interests",
        ]
        read_only_fields = ["id", "is_email_verified", "age", "created_at", "updated_at"]

    def get_age(self, obj: Profile) -> int | None:
        return obj.age

    def update(self, instance: Profile, validated_data: dict) -> Profile:
        interests = validated_data.pop("interests", None)
        new_photos = validated_data.pop("new_photos", [])
        remove_photo_ids = validated_data.pop("remove_photo_ids", [])
        clear_interests = validated_data.pop("clear_interests", False)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if clear_interests:
            instance.interests.clear()
        elif interests is not None:
            instance.interests.set(interests)
        if remove_photo_ids:
            instance.photos.filter(id__in=remove_photo_ids).delete()
        for image in new_photos:
            ProfilePhoto.objects.create(profile=instance, image=image)
        return instance
