from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

# Router apne aap saari APIs (Create, Read, Update, Delete) ke URLs bana dega!
router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]