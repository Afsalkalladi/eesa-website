from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import CustomUser, Student, Faculty
from .serializers import CustomUserSerializer, StudentSerializer, FacultySerializer

# Register view
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomUserSerializer

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
                'student_id': student.student_id,
                'batch': student.batch,
                'semester': student.semester
            }
        elif user.user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            faculty = user.faculty_profile
            response_data['profile'] = {
                'faculty_id': faculty.faculty_id,
                'department': faculty.department,
                'designation': faculty.designation
            }
        
        return Response(response_data)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Student viewset
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.user_type == 'admin':
            return Student.objects.all()
        elif user.user_type == 'faculty':
            # Faculty can see students, but we might want to limit this to students in their courses
            return Student.objects.all()
        elif user.user_type == 'student':
            # Students can only see their own profile
            return Student.objects.filter(user=user)
        return Student.objects.none()

# Faculty viewset
class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.user_type == 'admin':
            return Faculty.objects.all()
        elif user.user_type == 'faculty':
            # Faculty can only see their own profile
            return Faculty.objects.filter(user=user)
        elif user.user_type == 'student':
            # Students can see all faculty
            return Faculty.objects.all()
        return Faculty.objects.none()