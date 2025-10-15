"""Views related to user authentication and profile management."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import RegistrationSerializer, UserSerializer

User = get_user_model()


class UserViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """API endpoints for registering and managing users."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()

    def get_permissions(self):  # type: ignore[override]
        if self.action in {"create", "register"}:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_serializer_class(self):  # type: ignore[override]
        if self.action in {"create", "register"}:
            return RegistrationSerializer
        return super().get_serializer_class()

    def get_queryset(self):  # type: ignore[override]
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(methods=["get"], detail=False)
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(methods=["post"], detail=False, permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        response_serializer = UserSerializer(instance=user)
        data = response_serializer.data
        data.update({
            "access": serializer.context["tokens"]["access"],
            "refresh": serializer.context["tokens"]["refresh"],
        })
        return Response(data, status=201, headers=headers)
