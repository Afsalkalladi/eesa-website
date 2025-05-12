from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'faculty', views.FacultyViewSet, basename='faculty')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    
    # Custom student endpoints (these are now handled by viewset actions)
    # path('students/by-year/', ...),  # Use /students/by_year/ instead
    # path('students/by-semester/', ...),  # Use /students/by_semester/ instead
    # path('students/statistics/', ...),  # Use /students/statistics/ instead
]

# The router automatically creates these endpoints:
# /students/ - List all students (GET) or create new (POST)
# /students/{id}/ - Retrieve (GET), update (PUT/PATCH), or delete (DELETE) a student
# /students/by_year/ - Get students grouped by enrollment year
# /students/by_semester/ - Get students grouped by semester
# /students/by_branch/ - Get students grouped by branch
# /students/update_semesters/ - Update all student semesters
# /students/{id}/promote/ - Promote a specific student
# /students/statistics/ - Get student statistics

# Similar endpoints for faculty:
# /faculty/ - List all faculty (GET) or create new (POST)
# /faculty/{id}/ - Retrieve (GET), update (PUT/PATCH), or delete (DELETE) faculty
# /faculty/by_department/ - Get faculty grouped by department
# /faculty/by_designation/ - Get faculty grouped by designation
# /faculty/statistics/ - Get faculty statistics