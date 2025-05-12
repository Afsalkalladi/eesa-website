from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import CustomUser, Student, Faculty
from .serializers import (
    CustomUserSerializer, StudentSerializer, FacultySerializer,
    StudentCreateSerializer, FacultyCreateSerializer,
    StudentUpdateSerializer, FacultyUpdateSerializer
)
from .permissions import IsOwnerOrAdminOrReadOnly, IsAdmin, IsFaculty, IsStudent

# Register view
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract user type and profile data
        user_type = request.data.get('user_type', 'student')
        
        # Create user
        user_data = {
            'username': request.data.get('username'),
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name'),
            'phone_number': request.data.get('phone_number', ''),
            'user_type': user_type
        }
        
        user = CustomUser.objects.create_user(**user_data)
        
        # Create profile based on user type
        if user_type == 'student':
            student_profile = request.data.get('student_profile', {})
            Student.objects.create(
                user=user,
                student_id=student_profile.get('student_id'),
                enrollment_year=student_profile.get('enrollment_year', timezone.now().year),
                current_semester=student_profile.get('semester', 1),
                batch=student_profile.get('batch', f"{timezone.now().year}-{timezone.now().year + 4}"),
                course=student_profile.get('course', 'BTech'),
                branch=student_profile.get('branch', 'Not Specified')
            )
        elif user_type == 'faculty':
            faculty_profile = request.data.get('faculty_profile', {})
            Faculty.objects.create(
                user=user,
                faculty_id=faculty_profile.get('faculty_id'),
                department=faculty_profile.get('department'),
                designation=faculty_profile.get('designation'),
                joining_date=timezone.now().date()
            )
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {'message': f'{user_type.capitalize()} registered successfully'},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

# Login view
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        # Create or get token
        token, _ = Token.objects.get_or_create(user=user)
        
        # Prepare response data
        response_data = {
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user.user_type,
            'is_verified': user.is_verified
        }
        
        # Add profile data based on user_type
        if user.user_type == 'student' and hasattr(user, 'student_profile'):
            student = user.student_profile
            response_data['profile'] = {
                'id': student.id,
                'student_id': student.student_id,
                'enrollment_year': student.enrollment_year,
                'current_semester': student.current_semester,
                'course': student.course,
                'branch': student.branch,
                'batch': student.batch,
                'cgpa': str(student.cgpa) if student.cgpa else None
            }
        elif user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            faculty = user.faculty_profile
            response_data['profile'] = {
                'id': faculty.id,
                'faculty_id': faculty.faculty_id,
                'department': faculty.department,
                'designation': faculty.designation,
                'joining_date': faculty.joining_date.isoformat() if faculty.joining_date else None
            }
        
        return Response(response_data)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Student viewset
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return StudentSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Student.objects.select_related('user').all()
        
        # Filter by enrollment year
        enrollment_year = self.request.query_params.get('enrollment_year', None)
        if enrollment_year:
            queryset = queryset.filter(enrollment_year=enrollment_year)
        
        # Filter by semester  
        semester = self.request.query_params.get('semester', None)
        if semester:
            queryset = queryset.filter(current_semester=semester)
        
        # Filter by course
        course = self.request.query_params.get('course', None)
        if course:
            queryset = queryset.filter(course=course)
        
        # Filter by branch
        branch = self.request.query_params.get('branch', None)
        if branch:
            queryset = queryset.filter(branch__icontains=branch)
        
        # Filter by batch
        batch = self.request.query_params.get('batch', None)
        if batch:
            queryset = queryset.filter(batch=batch)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(student_id__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__username__icontains=search)
            )
        
        # Permission-based filtering
        if user.is_superuser or user.user_type in ['admin', 'faculty']:
            return queryset
        elif user.user_type == 'student':
            # Students can only see their own profile
            return queryset.filter(user=user)
        
        return queryset.none()
    
    def list(self, request, *args, **kwargs):
        """Override list to return data as a list for compatibility"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current student's profile"""
        if request.user.user_type != 'student':
            return Response(
                {'error': 'Not a student user'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            student = Student.objects.select_related('user').get(user=request.user)
            serializer = self.get_serializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for current student"""
        if request.user.user_type != 'student':
            return Response(
                {'error': 'Not a student user'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            student = Student.objects.get(user=request.user)
            
            # Initialize stats with default values
            stats = {
                'profile': StudentSerializer(student).data,
                'attendance': {
                    'total': 0,
                    'present': 0,
                    'percentage': 0
                },
                'assignments': {
                    'total': 0,
                    'submitted': 0,
                    'pending': 0
                },
                'notes': {
                    'approved': 0
                },
                'internals': {
                    'total': 0,
                    'subjects': []
                }
            }
            
            # Try to get attendance stats
            try:
                from academics.models import Attendance
                total_attendance = Attendance.objects.filter(student=student).count()
                present_count = Attendance.objects.filter(student=student, present=True).count()
                attendance_percentage = (present_count / total_attendance * 100) if total_attendance > 0 else 0
                
                stats['attendance'] = {
                    'total': total_attendance,
                    'present': present_count,
                    'percentage': round(attendance_percentage, 2)
                }
            except Exception as e:
                print(f"Error fetching attendance: {e}")
            
            # Try to get assignment stats
            try:
                from academics.models import Assignment, AssignmentSubmission
                assignments = Assignment.objects.filter(batch=student.batch)
                submitted = AssignmentSubmission.objects.filter(student=student).count()
                pending = assignments.count() - submitted
                
                stats['assignments'] = {
                    'total': assignments.count(),
                    'submitted': submitted,
                    'pending': max(0, pending)
                }
            except Exception as e:
                print(f"Error fetching assignments: {e}")
            
            # Try to get notes count
            try:
                from library.models import Note
                approved_notes = Note.objects.filter(status='approved').count()
                stats['notes']['approved'] = approved_notes
            except Exception as e:
                print(f"Error fetching notes: {e}")
            
            # Try to get internal marks
            try:
                from academics.models import InternalMark
                internal_marks = InternalMark.objects.filter(student=student)
                stats['internals']['total'] = internal_marks.count()
            except Exception as e:
                print(f"Error fetching internal marks: {e}")
            
            return Response(stats)
            
        except Student.DoesNotExist:
            return Response(
                {'error': 'Student profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# Faculty viewset
class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FacultyCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return FacultyUpdateSerializer
        return FacultySerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Faculty.objects.select_related('user').all()
        
        # Filter by department
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department__icontains=department)
        
        # Filter by designation
        designation = self.request.query_params.get('designation', None)
        if designation:
            queryset = queryset.filter(designation=designation)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(faculty_id__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(department__icontains=search)
            )
        
        # Permission-based filtering
        if user.is_superuser or user.user_type == 'admin':
            return queryset
        elif user.user_type == 'faculty':
            return queryset  # Faculty can see all faculty
        elif user.user_type == 'student':
            return queryset  # Students can see all faculty
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to return data as a list for compatibility"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current faculty's profile"""
        if request.user.user_type != 'faculty':
            return Response(
                {'error': 'Not a faculty user'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            faculty = Faculty.objects.select_related('user').get(user=request.user)
            serializer = self.get_serializer(faculty)
            return Response(serializer.data)
        except Faculty.DoesNotExist:
            return Response(
                {'error': 'Faculty profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for current faculty"""
        if request.user.user_type != 'faculty':
            return Response(
                {'error': 'Not a faculty user'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            faculty = Faculty.objects.get(user=request.user)
            
            # Initialize stats with default values
            stats = {
                'profile': FacultySerializer(faculty).data,
                'subjects': {
                    'total': 0,
                    'list': []
                },
                'students': {
                    'total': 0
                },
                'assignments': {
                    'total': 0,
                    'active': 0
                },
                'notes': {
                    'pending_review': 0
                },
                'study_materials': {
                    'total': 0
                }
            }
            
            # Try to get subjects taught
            try:
                from academics.models import FacultySubject
                from academics.serializers import FacultySubjectSerializer
                subjects = FacultySubject.objects.filter(faculty=faculty)
                
                stats['subjects'] = {
                    'total': subjects.count(),
                    'list': FacultySubjectSerializer(subjects, many=True).data
                }
                
                # Get students count (students in batches faculty teaches)
                batches = subjects.values_list('batch', flat=True).distinct()
                students_count = Student.objects.filter(batch__in=batches).count()
                stats['students']['total'] = students_count
                
            except Exception as e:
                print(f"Error fetching subjects: {e}")
            
            # Try to get assignments created
            try:
                from academics.models import Assignment
                assignments = Assignment.objects.filter(faculty=faculty)
                active_assignments = assignments.filter(due_date__gte=timezone.now())
                
                stats['assignments'] = {
                    'total': assignments.count(),
                    'active': active_assignments.count()
                }
            except Exception as e:
                print(f"Error fetching assignments: {e}")
            
            # Try to get pending notes for review
            try:
                from library.models import Note
                pending_notes = Note.objects.filter(status='pending').count()
                stats['notes']['pending_review'] = pending_notes
            except Exception as e:
                print(f"Error fetching pending notes: {e}")
            
            # Try to get study materials
            try:
                from academics.models import StudyMaterial
                study_materials = StudyMaterial.objects.filter(faculty=faculty)
                stats['study_materials']['total'] = study_materials.count()
            except Exception as e:
                print(f"Error fetching study materials: {e}")
            
            return Response(stats)
            
        except Faculty.DoesNotExist:
            return Response(
                {'error': 'Faculty profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# Admin dashboard stats
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard_stats(request):
    """Get dashboard statistics for admin"""
    try:
        stats = {
            'students': Student.objects.count(),
            'faculty': Faculty.objects.count(),
            'subjects': 0,
            'notes': 0,
            'events': 0,
            'pending_notes': 0
        }
        
        # Try to get additional stats
        try:
            from academics.models import Subject
            stats['subjects'] = Subject.objects.count()
        except:
            pass
        
        try:
            from library.models import Note
            stats['notes'] = Note.objects.count()
            stats['pending_notes'] = Note.objects.filter(status='pending').count()
        except:
            pass
        
        try:
            from events.models import Event
            stats['events'] = Event.objects.count()
        except:
            pass
        
        return Response(stats)
    except Exception as e:
        return Response(
            {'error': f'Error fetching stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )