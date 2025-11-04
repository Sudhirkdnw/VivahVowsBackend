from django.urls import path

from .views import (
    BlockProfileView,
    LikeProfileView,
    MatchSuggestionView,
    MutualMatchListView,
    RejectProfileView,
)

urlpatterns = [
    path("suggestions/", MatchSuggestionView.as_view(), name="match-suggestions"),
    path("like/<int:user_id>/", LikeProfileView.as_view(), name="like-profile"),
    path("reject/<int:user_id>/", RejectProfileView.as_view(), name="reject-profile"),
    path("block/<int:user_id>/", BlockProfileView.as_view(), name="block-profile"),
    path("mutual/", MutualMatchListView.as_view(), name="mutual-matches"),
]
