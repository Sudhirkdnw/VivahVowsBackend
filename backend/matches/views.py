from __future__ import annotations

from hashlib import md5

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import ChatRoom
from notifications.utils import push_notification
from profiles.models import Profile
from profiles.serializers import ProfileSerializer

from .models import MatchAction, MutualMatch
from .serializers import MutualMatchSerializer

User = get_user_model()


class MatchSuggestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile = request.user.profile
        params = request.query_params
        cache_key_raw = (
            f"suggestions:{request.user.id}:"
            + str(sorted((key, params.getlist(key)) for key in params))
        )
        cache_key = md5(force_bytes(cache_key_raw)).hexdigest()

        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        interest_ids = list(profile.interests.values_list("id", flat=True))

        queryset = (
            Profile.objects.select_related("user")
            .prefetch_related("interests")
            .exclude(user=request.user)
        )

        blocked_users = MatchAction.objects.filter(
            Q(initiator=request.user, status="blocked")
            | Q(target=request.user, status="blocked")
        ).values_list("initiator", "target")
        blocked_ids = {uid for pair in blocked_users for uid in pair if uid != request.user.id}
        if blocked_ids:
            queryset = queryset.exclude(user__id__in=blocked_ids)

        negative_targets = MatchAction.objects.filter(
            initiator=request.user, status__in=["rejected", "blocked"]
        ).values_list("target", flat=True)
        if negative_targets:
            queryset = queryset.exclude(user__id__in=list(negative_targets))

        if profile.preferred_gender:
            queryset = queryset.filter(gender=profile.preferred_gender)
        if profile.preferred_city:
            queryset = queryset.filter(city__iexact=profile.preferred_city)
        if profile.preferred_religion:
            queryset = queryset.filter(religion__iexact=profile.preferred_religion)
        age_min = params.get("age_min", profile.preferred_age_min)
        age_max = params.get("age_max", profile.preferred_age_max)
        gender = params.get("gender")
        city = params.get("city")
        religion = params.get("religion")

        if gender:
            queryset = queryset.filter(gender=gender)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if religion:
            queryset = queryset.filter(religion__iexact=religion)

        if age_min or age_max:
            from datetime import date

            today = date.today()

            def _subtract_years(years: int):
                try:
                    return today.replace(year=today.year - years)
                except ValueError:
                    return today.replace(month=2, day=28, year=today.year - years)

            if age_min:
                queryset = queryset.filter(dob__lte=_subtract_years(int(age_min)))
            if age_max:
                queryset = queryset.filter(dob__gte=_subtract_years(int(age_max)))

        query_interests = params.getlist("interests")
        if query_interests:
            queryset = queryset.filter(interests__id__in=query_interests)

        queryset = queryset.annotate(
            shared_interests=Count(
                "interests", filter=Q(interests__id__in=interest_ids)
            )
        ).order_by(
            "-shared_interests", "-updated_at"
        )

        data = ProfileSerializer(queryset[:20], many=True, context={"request": request}).data
        cache.set(cache_key, data, 60)
        return Response(data)


class BaseMatchActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    action = None

    def post(self, request, user_id, *args, **kwargs):
        if self.action is None:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        target = get_object_or_404(User, pk=user_id)
        if target == request.user:
            return Response({"detail": "Cannot target yourself."}, status=status.HTTP_400_BAD_REQUEST)

        match_action, created = MatchAction.objects.update_or_create(
            initiator=request.user,
            target=target,
            defaults={"status": self.action},
        )
        response = {"detail": f"{self.action.title()} action recorded."}

        if self.action == "liked":
            reciprocal = MatchAction.objects.filter(
                initiator=target, target=request.user, status="liked"
            ).exists()
            if reciprocal:
                mutual, _ = MutualMatch.get_or_create_mutual(request.user, target)
                ChatRoom.get_or_create_room(request.user, target)
                push_notification(target, "match", {"user_id": request.user.id})
                push_notification(request.user, "match", {"user_id": target.id})
                response["match"] = True
            else:
                push_notification(target, "like", {"user_id": request.user.id})
        elif self.action == "blocked":
            MutualMatch.objects.filter(
                Q(user_one=request.user, user_two=target)
                | Q(user_one=target, user_two=request.user)
            ).delete()
        return Response(response)


class LikeProfileView(BaseMatchActionView):
    action = "liked"


class RejectProfileView(BaseMatchActionView):
    action = "rejected"


class BlockProfileView(BaseMatchActionView):
    action = "blocked"


class MutualMatchListView(generics.ListAPIView):
    serializer_class = MutualMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MutualMatch.objects.involving(user)
