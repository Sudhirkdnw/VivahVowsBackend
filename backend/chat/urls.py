from django.urls import path

from .views import ChatRoomListView, MessageListCreateView

urlpatterns = [
    path("rooms/", ChatRoomListView.as_view(), name="chat-rooms"),
    path("rooms/<int:room_id>/messages/", MessageListCreateView.as_view(), name="chat-messages"),
]
