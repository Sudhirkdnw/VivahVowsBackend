from rest_framework.routers import DefaultRouter

from .views import InterestViewSet, ProfileViewSet

router = DefaultRouter()
router.register(r"profiles", ProfileViewSet, basename="profile")
router.register(r"interests", InterestViewSet, basename="interest")

urlpatterns = router.urls
