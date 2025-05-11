from django.contrib import admin
from .models import (Subject, FacultySubject, Attendance, 
                    InternalMark, Assignment, AssignmentSubmission, 
                    StudyMaterial)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'semester')
    search_fields = ('code', 'name')
    list_filter = ('semester',)

@admin.register(FacultySubject)
class FacultySubjectAdmin(admin.ModelAdmin):
    list_display = ('faculty', 'subject', 'batch')
    list_filter = ('batch',)

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'date', 'hour', 'present')
    list_filter = ('date', 'hour', 'present', 'subject')
    search_fields = ('student__user__username', 'subject__name')

@admin.register(InternalMark)
class InternalMarkAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'test_name', 'obtained_mark', 'max_mark')
    list_filter = ('subject', 'test_name')
    search_fields = ('student__user__username', 'subject__name')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'faculty', 'batch', 'due_date')
    list_filter = ('batch', 'subject')
    search_fields = ('title', 'description')

@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submission_date', 'status')
    list_filter = ('status', 'submission_date')
    search_fields = ('student__user__username', 'assignment__title')

@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'faculty', 'batch')
    list_filter = ('batch', 'subject')
    search_fields = ('title', 'description')