from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import (Subject, FacultySubject, Attendance, InternalMark, 
                    Assignment, AssignmentSubmission, StudyMaterial)
from .serializers import (SubjectSerializer, FacultySubjectSerializer, 
                         AttendanceSerializer, InternalMarkSerializer,
                         AssignmentSerializer, AssignmentSubmissionSerializer, 
                         StudyMaterialSerializer)
from users.permissions import IsAdmin, IsAdminOrFaculty, IsStudent, IsOwnerOrAdminOrFaculty

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class FacultySubjectViewSet(viewsets.ModelViewSet):
    queryset = FacultySubject.objects.all()
    serializer_class = FacultySubjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all
        if user.is_superuser or user.user_type == 'admin':
            return FacultySubject.objects.all()
        
        # Faculty can see their assigned subjects
        if user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            return FacultySubject.objects.filter(faculty=user.faculty_profile)
        
        # Students can see subjects for their batch
        if user.user_type == 'student' and hasattr(user, 'student_profile'):
            return FacultySubject.objects.filter(batch=user.student_profile.batch)
        
        return FacultySubject.objects.none()

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_mark']:
            permission_classes = [IsAdminOrFaculty]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all
        if user.is_superuser or user.user_type == 'admin':
            return Attendance.objects.all()
        
        # Faculty can see attendance they've marked
        if user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            return Attendance.objects.filter(faculty=user.faculty_profile)
        
        # Students can see their own attendance
        if user.user_type == 'student' and hasattr(user, 'student_profile'):
            return Attendance.objects.filter(student=user.student_profile)
        
        return Attendance.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.user_type == 'faculty':
            serializer.save(faculty=self.request.user.faculty_profile)
        else:
            serializer.save()
    
    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        faculty = request.user.faculty_profile if hasattr(request.user, 'faculty_profile') else None
        if not faculty:
            return Response({'error': 'Only faculty can mark attendance'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        subject_id = request.data.get('subject')
        date = request.data.get('date')
        hour = request.data.get('hour')
        attendance_data = request.data.get('attendance', [])
        
        if not all([subject_id, date, hour, attendance_data]):
            return Response({'error': 'Missing required fields'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        subject = get_object_or_404(Subject, pk=subject_id)
        
        # Check if faculty is assigned to this subject
        if not FacultySubject.objects.filter(faculty=faculty, subject=subject).exists():
            return Response({'error': 'You are not assigned to this subject'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        results = []
        for item in attendance_data:
            student_id = item.get('student')
            present = item.get('present', False)
            
            # Create or update attendance record
            attendance, created = Attendance.objects.update_or_create(
                student_id=student_id,
                subject=subject,
                faculty=faculty,
                date=date,
                hour=hour,
                defaults={'present': present}
            )
            
            results.append({
                'id': attendance.id,
                'student': student_id,
                'present': attendance.present,
                'created': created
            })
        
        return Response({'message': 'Attendance marked successfully', 'results': results})

class InternalMarkViewSet(viewsets.ModelViewSet):
    serializer_class = InternalMarkSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_mark']:
            permission_classes = [IsAdminOrFaculty]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all
        if user.is_superuser or user.user_type == 'admin':
            return InternalMark.objects.all()
        
        # Faculty can see marks they've given
        if user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            return InternalMark.objects.filter(faculty=user.faculty_profile)
        
        # Students can see their own marks
        if user.user_type == 'student' and hasattr(user, 'student_profile'):
            return InternalMark.objects.filter(student=user.student_profile)
        
        return InternalMark.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.user_type == 'faculty':
            serializer.save(faculty=self.request.user.faculty_profile)
        else:
            serializer.save()
    
    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        faculty = request.user.faculty_profile if hasattr(request.user, 'faculty_profile') else None
        if not faculty:
            return Response({'error': 'Only faculty can mark internal scores'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        subject_id = request.data.get('subject')
        test_name = request.data.get('test_name')
        max_mark = request.data.get('max_mark')
        marks_data = request.data.get('marks', [])
        
        if not all([subject_id, test_name, max_mark, marks_data]):
            return Response({'error': 'Missing required fields'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        subject = get_object_or_404(Subject, pk=subject_id)
        
        # Check if faculty is assigned to this subject
        if not FacultySubject.objects.filter(faculty=faculty, subject=subject).exists():
            return Response({'error': 'You are not assigned to this subject'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        results = []
        for item in marks_data:
            student_id = item.get('student')
            obtained_mark = item.get('obtained_mark')
            remarks = item.get('remarks', '')
            
            # Create or update mark record
            mark, created = InternalMark.objects.update_or_create(
                student_id=student_id,
                subject=subject,
                faculty=faculty,
                test_name=test_name,
                defaults={
                    'max_mark': max_mark,
                    'obtained_mark': obtained_mark,
                    'remarks': remarks
                }
            )
            
            results.append({
                'id': mark.id,
                'student': student_id,
                'obtained_mark': mark.obtained_mark,
                'created': created
            })
        
        return Response({'message': 'Marks added successfully', 'results': results})

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrFaculty]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all
        if user.is_superuser or user.user_type == 'admin':
            return Assignment.objects.all()
        
        # Faculty can see assignments they've created
        if user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            return Assignment.objects.filter(faculty=user.faculty_profile)
        
        # Students can see assignments for their batch
        if user.user_type == 'student' and hasattr(user, 'student_profile'):
            return Assignment.objects.filter(batch=user.student_profile.batch)
        
        return Assignment.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.user_type == 'faculty':
            serializer.save(faculty=self.request.user.faculty_profile)
        else:
            serializer.save()

class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsStudent]
        elif self.action in ['update_status']:
            permission_classes = [IsAdminOrFaculty]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrAdminOrFaculty]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all
        if user.is_superuser or user.user_type == 'admin':
            return AssignmentSubmission.objects.all()
        
        # Faculty can see submissions for assignments they created
        if user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            return AssignmentSubmission.objects.filter(
                assignment__faculty=user.faculty_profile
            )
        
        # Students can see their own submissions
        if user.user_type == 'student' and hasattr(user, 'student_profile'):
            return AssignmentSubmission.objects.filter(
                student=user.student_profile
            )
        
        return AssignmentSubmission.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user.student_profile)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        submission = self.get_object()
        status = request.data.get('status')
        comments = request.data.get('comments', '')
        
        if status not in dict(Assignment.STATUS_CHOICES).keys():
            return Response({'error': 'Invalid status'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        submission.status = status
        submission.comments = comments
        submission.save()
        
        serializer = self.get_serializer(submission)
        return Response(serializer.data)

class StudyMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = StudyMaterialSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrFaculty]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all
        if user.is_superuser or user.user_type == 'admin':
            return StudyMaterial.objects.all()
        
        # Faculty can see materials they've uploaded
        if user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            return StudyMaterial.objects.filter(faculty=user.faculty_profile)
        
        # Students can see materials for their batch
        if user.user_type == 'student' and hasattr(user, 'student_profile'):
            return StudyMaterial.objects.filter(batch=user.student_profile.batch)
        
        return StudyMaterial.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.user_type == 'faculty':
            serializer.save(faculty=self.request.user.faculty_profile)
        else:
            serializer.save()