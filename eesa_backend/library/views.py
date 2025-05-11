from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Note
from .serializers import NoteSerializer
from users.permissions import IsAdminOrFaculty, IsStudent, IsOwnerOrAdminOrFaculty

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'subject']
    
    def get_queryset(self):
        # Public notes (approved ones) can be viewed by anyone
        if self.action == 'list' or self.action == 'retrieve':
            return Note.objects.filter(status='approved')
        
        # Admin and faculty can see all notes
        user = self.request.user
        if user.is_authenticated and (user.is_superuser or user.user_type in ['admin', 'faculty']):
            return Note.objects.all()
        
        # Students can see approved notes and their own notes
        if user.is_authenticated and user.user_type == 'student' and hasattr(user, 'student_profile'):
            return Note.objects.filter(
                status='approved'
            ) | Note.objects.filter(
                uploaded_by=user.student_profile
            )
        
        # Default: only approved notes
        return Note.objects.filter(status='approved')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [IsStudent]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrAdminOrFaculty]
        elif self.action in ['review']:
            permission_classes = [IsAdminOrFaculty]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user.student_profile)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        note = self.get_object()
        status = request.data.get('status')
        comment = request.data.get('review_comment', '')
        
        if status not in ['approved', 'rejected']:
            return Response({'error': 'Status must be either approved or rejected'}, 
                        status=400)
        
        # Check if user is faculty or admin
        if not request.user.is_superuser and not (hasattr(request.user, 'faculty_profile') or request.user.user_type in ['admin', 'faculty']):
            return Response({'error': 'Only faculty or admin can review notes'}, 
                        status=403)
        
        note.status = status
        note.review_comment = comment
        
        # Set the reviewer if the user is faculty
        if hasattr(request.user, 'faculty_profile'):
            note.reviewer = request.user.faculty_profile
        
        note.save()
        
        serializer = self.get_serializer(note)
        return Response(serializer.data)