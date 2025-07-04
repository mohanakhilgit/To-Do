from django.urls import path

from .views import (
    MyTokenObtainPairView,
    UserRegistrationAPIView,
    LogoutAndBlacklistRefreshTokenView,
    TaskListCreateAPIView,
    TaskRetrieveUpdateDeleteAPIView,
)


urlpatterns = [
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("register/", UserRegistrationAPIView.as_view(), name="user_registration"),
    path("logout/", LogoutAndBlacklistRefreshTokenView.as_view(), name="logout"),
    path("tasks/", TaskListCreateAPIView.as_view(), name="task_list_create"),
    path("tasks/<int:id>/", TaskRetrieveUpdateDeleteAPIView.as_view(), name="task_detail"),
]
