from rest_framework import viewsets, permissions
from .models import Event, Project
from .serializers import EventSerializer, ProjectSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    
    # Make GET requests public
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    
    # Make GET requests public
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]