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
        user = self.request.user
        
        # Check if we have a status filter from query parameters
        status_filter = self.request.query_params.get('status', None)
        
        # For list and retrieve actions
        if self.action in ['list', 'retrieve']:
            # If user is admin or faculty
            if user.is_authenticated and (user.is_superuser or user.user_type in ['admin', 'faculty']):
                queryset = Note.objects.all()
                # Apply status filter if provided
                if status_filter:
                    queryset = queryset.filter(status=status_filter)
                return queryset
            
            # For students - can see approved notes and their own notes
            if user.is_authenticated and user.user_type == 'student' and hasattr(user, 'student_profile'):
                if status_filter:
                    if status_filter == 'approved':
                        return Note.objects.filter(status='approved')
                    else:
                        # For other statuses, only show their own notes
                        return Note.objects.filter(
                            uploaded_by=user.student_profile,
                            status=status_filter
                        )
                else:
                    # No filter - show approved notes and their own
                    return Note.objects.filter(
                        status='approved'
                    ) | Note.objects.filter(
                        uploaded_by=user.student_profile
                    )
            
            # For unauthenticated users - only approved notes
            return Note.objects.filter(status='approved')
        
        # For other actions (create, update, delete, etc.)
        if user.is_authenticated and (user.is_superuser or user.user_type in ['admin', 'faculty']):
            return Note.objects.all()
        
        # Students can only interact with approved notes and their own notes
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
        elif self.action in ['review', 'pending', 'dashboard_stats']:
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
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending notes for admin/faculty review"""
        # No need to check permissions here as it's handled by get_permissions
        pending_notes = Note.objects.filter(status='pending')
        serializer = self.get_serializer(pending_notes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for admin"""
        # Calculate statistics
        stats = {
            'total_notes': Note.objects.count(),
            'pending_notes': Note.objects.filter(status='pending').count(),
            'approved_notes': Note.objects.filter(status='approved').count(),
            'rejected_notes': Note.objects.filter(status='rejected').count(),
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def my_notes(self, request):
        """Get notes uploaded by the current student"""
        if request.user.user_type == 'student' and hasattr(request.user, 'student_profile'):
            my_notes = Note.objects.filter(uploaded_by=request.user.student_profile)
            serializer = self.get_serializer(my_notes, many=True)
            return Response(serializer.data)
        return Response({'error': 'Only students can access their notes'}, status=403)