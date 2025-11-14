from __future__ import annotations

from datetime import date

from rest_framework import permissions, status, viewsets
from rest_framework.permissions import SAFE_METHODS
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import Interest, Profile
from .serializers import InterestSerializer, ProfileSerializer


class InterestViewSet(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = (
        Profile.objects.select_related("user").prefetch_related("interests", "photos")
    )
    http_method_names = ["get", "put", "patch", "delete", "head", "options"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = (
            Profile.objects.select_related("user").prefetch_related("interests", "photos")
        )
        if self.action == "list":
            queryset = queryset.exclude(user=self.request.user)
            params = self.request.query_params
            gender = params.get("gender")
            city = params.get("city")
            religion = params.get("religion")
            age_min = params.get("age_min")
            age_max = params.get("age_max")
            interest_ids = params.getlist("interests")

            if gender:
                queryset = queryset.filter(gender=gender)
            if city:
                queryset = queryset.filter(city__iexact=city)
            if religion:
                queryset = queryset.filter(religion__iexact=religion)
            if age_min or age_max:
                today = date.today()

                def _subtract_years(years: int) -> date:
                    try:
                        return today.replace(year=today.year - years)
                    except ValueError:
                        return today.replace(month=2, day=28, year=today.year - years)

                if age_min:
                    max_birthdate = _subtract_years(int(age_min))
                    queryset = queryset.filter(dob__lte=max_birthdate)
                if age_max:
                    min_birthdate = _subtract_years(int(age_max))
                    queryset = queryset.filter(dob__gte=min_birthdate)
            if interest_ids:
                queryset = queryset.filter(interests__id__in=interest_ids).distinct()
        return queryset

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user and self.action in {"update", "partial_update"}:
            self.permission_denied(self.request, message="Cannot edit another user's profile")
        return obj

    @action(detail=False, methods=["get", "put", "patch", "delete"], url_path="me")
    def me(self, request):
        profile = request.user.profile
        if request.method.lower() in {"put", "patch"}:
            serializer = self.get_serializer(
                profile, data=request.data, partial=request.method.lower() == "patch"
            )
            serializer.is_valid(raise_exception=True)
            updated_profile = serializer.save()
            refreshed = (
                Profile.objects.select_related("user")
                .prefetch_related("interests", "photos")
                .get(pk=updated_profile.pk)
            )
            output = self.get_serializer(refreshed)
            return Response(output.data)
        if request.method.lower() == "delete":
            user = request.user
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

