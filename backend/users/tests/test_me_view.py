from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from profiles.models import Profile


class MeViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="initialuser",
            email="user@example.com",
            password="password123",
            first_name="Initial",
            last_name="User",
        )
        Profile.objects.create(user=self.user)
        self.client.force_authenticate(self.user)
        self.url = reverse("me")

    def test_retrieve_authenticated_user(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "user@example.com")
        self.assertEqual(response.data["username"], "initialuser")

    def test_update_account_details(self):
        payload = {
            "username": "refineduser",
            "first_name": "Refined",
            "last_name": "Member",
            "email": "new-email@example.com",
        }

        response = self.client.patch(self.url, payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "refineduser")
        self.assertEqual(self.user.first_name, "Refined")
        self.assertEqual(self.user.last_name, "Member")
        # email should remain unchanged because it is read-only
        self.assertEqual(self.user.email, "user@example.com")
        self.assertEqual(response.data["email"], "user@example.com")
