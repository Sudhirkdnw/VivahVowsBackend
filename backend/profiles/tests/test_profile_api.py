from __future__ import annotations

import shutil
import tempfile

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile

from profiles.models import Interest, ProfilePhoto


def _build_image_file(name: str = "avatar.gif") -> SimpleUploadedFile:
    # 1x1 pixel transparent gif
    pixel = (
        b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00"
        b"\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00"
        b"\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b"
    )
    return SimpleUploadedFile(name, pixel, content_type="image/gif")


class ProfileAPITests(TestCase):
    def setUp(self) -> None:
        self._temp_media = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self._temp_media)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.addCleanup(lambda: shutil.rmtree(self._temp_media, ignore_errors=True))
        self.user = get_user_model().objects.create_user(
            username="tester",
            email="tester@example.com",
            password="strong-pass-123",
        )
        self.profile = self.user.profile
        self.profile.name = "Tester"
        self.profile.city = "Delhi"
        self.profile.bio = "Bio text"
        self.profile.save()
        self.client = APIClient()
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_retrieve_me_returns_profile_details(self) -> None:
        interest = Interest.objects.create(name="Music")
        self.profile.interests.add(interest)
        photo = ProfilePhoto.objects.create(profile=self.profile, image=_build_image_file("photo.gif"))

        response = self.client.get(reverse("profile-me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Tester")
        self.assertIn(interest.id, response.data["interests"])
        self.assertEqual(len(response.data["photos"]), 1)
        self.assertEqual(response.data["photos"][0]["id"], photo.id)
        self.assertTrue(response.data["photos"][0]["image"].startswith("http"))
        self.assertTrue(response.data["photos"][0]["image_path"].startswith("/"))

    def test_patch_profile_updates_fields_and_interests(self) -> None:
        old_interest = Interest.objects.create(name="Dancing")
        new_interest = Interest.objects.create(name="Reading")
        self.profile.interests.add(old_interest)

        payload = {
            "bio": "Updated Bio",
            "city": "Mumbai",
            "interests": [new_interest.id],
        }

        response = self.client.patch(reverse("profile-me"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.bio, "Updated Bio")
        self.assertEqual(self.profile.city, "Mumbai")
        self.assertListEqual(list(self.profile.interests.values_list("id", flat=True)), [new_interest.id])

    def test_patch_profile_handles_photo_upload_and_removal(self) -> None:
        interest = Interest.objects.create(name="Travel")
        self.profile.interests.add(interest)
        existing_photo = ProfilePhoto.objects.create(
            profile=self.profile,
            image=_build_image_file("existing.gif"),
        )

        payload = {
            "bio": "New Bio",
            "remove_photo_ids": [str(existing_photo.id)],
            "new_photos": [_build_image_file("new.gif")],
            "clear_interests": "true",
        }

        response = self.client.patch(reverse("profile-me"), payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.bio, "New Bio")
        self.assertEqual(self.profile.interests.count(), 0)
        self.assertEqual(self.profile.photos.count(), 1)
        new_photo = self.profile.photos.first()
        assert new_photo is not None
        self.assertNotEqual(new_photo.id, existing_photo.id)
        self.assertEqual(response.data["photos"][0]["id"], new_photo.id)

    def test_photo_urls_use_cdn_base_when_configured(self) -> None:
        cdn_base = "https://media.example.com"
        with override_settings(MEDIA_CDN_URL=cdn_base):
            photo = ProfilePhoto.objects.create(
                profile=self.profile,
                image=_build_image_file("cdn.gif"),
            )

            response = self.client.get(reverse("profile-me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["photos"][0]["id"], photo.id)
        self.assertTrue(response.data["photos"][0]["image"].startswith(cdn_base))

    def test_delete_profile_removes_user_account(self) -> None:
        response = self.client.delete(reverse("profile-me"))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        User = get_user_model()
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())
