from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'subjects', views.SubjectViewSet)
router.register(r'faculty-subjects', views.FacultySubjectViewSet)
router.register(r'attendance', views.AttendanceViewSet, basename='attendance')
router.register(r'internal-marks', views.InternalMarkViewSet, basename='internal-mark')
router.register(r'assignments', views.AssignmentViewSet, basename='assignment')
router.register(r'assignment-submissions', views.AssignmentSubmissionViewSet, basename='assignment-submission')
router.register(r'study-materials', views.StudyMaterialViewSet, basename='study-material')

urlpatterns = [
    path('', include(router.urls)),
]