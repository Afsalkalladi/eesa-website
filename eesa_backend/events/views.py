from rest_framework import viewsets, permissions
from .models import Event, Project
from .serializers import EventSerializer, ProjectSerializer
from users.permissions import IsAdmin, IsAdminOrFaculty

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrFaculty]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrFaculty]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]