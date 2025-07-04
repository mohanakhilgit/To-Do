from rest_framework import generics, status, views, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import AllowAny
import logging

from .models import Task
from .serializers import (
    TaskSerializer, 
    UserRegistrationSerializer, 
    MyTokenObtainPairSerializer, 
    BlacklistRefreshSerializer
)
from .response import GlobalApiResponse


#   ##### Authentication Views #####
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                tokens = serializer.validated_data
                
                user = serializer.user
                
                response_data = {
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'tokens': {
                        'refresh': tokens['refresh'],
                        'access': tokens['access'],
                    }
                }
                
                return GlobalApiResponse(
                    response_data,
                    "Login successful",
                    status.HTTP_200_OK
                )
                
            except Exception as e:
                logging.exception(f"Error during login: {repr(e)}")
                return GlobalApiResponse(
                    message="Login failed",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    success=False
                )
        else:
            return GlobalApiResponse(
                message=serializer.errors,
                status_code=status.HTTP_401_UNAUTHORIZED,
                success=False
            )


class UserRegistrationAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                refresh = MyTokenObtainPairSerializer.get_token(user)
                access_token = refresh.access_token
                
                # Prepare response data
                response_data = {
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(access_token),
                    }
                }
                
                return GlobalApiResponse(
                    response_data,
                    "User registered successfully",
                    status.HTTP_201_CREATED
                )
                
            except Exception as e:
                logging.exception(f"Error creating user: {repr(e)}")
                return GlobalApiResponse(
                    message="Unable to register user",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    success=False
                )
        else:
            return GlobalApiResponse(
                message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )


class LogoutAndBlacklistRefreshTokenView(views.APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = BlacklistRefreshSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save()
            return GlobalApiResponse(
                message="Logout successful, token blacklisted.",
                status_code=status.HTTP_205_RESET_CONTENT
            )
        except TokenError:
            return GlobalApiResponse(
                message="Token is already blacklisted or invalid.",
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
        except Exception as e:
            return GlobalApiResponse(
                message="An error occurred while blacklisting the token.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                success=False
            )


#   ##### Task Views #####
class TaskListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(created_by=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return GlobalApiResponse(
            serializer.data,
            "Tasks fetched successfully",
            status.HTTP_200_OK
        )
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(created_by=self.request.user)
                return GlobalApiResponse(
                    serializer.data,
                    "Task created successfully",
                    status.HTTP_201_CREATED
                )
            except serializers.ValidationError as e:
                return GlobalApiResponse(
                    message=e.detail,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            except Exception as e:
                logging.exception(f"Error creating task: {repr(e)}")
                return GlobalApiResponse(
                    message="Unable to create task",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    success=False
                )
        else:
            return GlobalApiResponse(
                message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )


class TaskRetrieveUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_object(self):
        try:
            return Task.objects.get(id=self.kwargs['id'], created_by=self.request.user)
        except Task.DoesNotExist:
            return GlobalApiResponse(
                message="Task not found",
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
        
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if isinstance(instance, GlobalApiResponse):
            return instance
        serializer = self.get_serializer(instance)
        return GlobalApiResponse(
            serializer.data,
            "Task fetched successfully",
            status.HTTP_200_OK
        )
        
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
                return GlobalApiResponse(
                    serializer.data,
                    "Task updated successfully",
                    status.HTTP_200_OK
                )
            except serializers.ValidationError as e:
                return GlobalApiResponse(
                    message=e.detail,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    success=False
                )
            except Exception as e:
                logging.exception(f"Error updating task: {repr(e)}")
                return GlobalApiResponse(
                    message="Unable to update task",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    success=False
                )
        else:
            return GlobalApiResponse(
                message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
                success=False
            )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance:
            instance.delete()
            return GlobalApiResponse(
                message="Task deleted successfully",
                status_code=status.HTTP_200_OK
            )
