from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Student, Faculty

class StudentInline(admin.StackedInline):
    model = Student
    can_delete = False
    verbose_name_plural = 'Student Profile'

class FacultyInline(admin.StackedInline):
    model = Faculty
    can_delete = False
    verbose_name_plural = 'Faculty Profile'

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_verified')
    list_filter = ('user_type', 'is_verified', 'is_staff')
    
    # The issue is in the fieldsets configuration
    # You need to modify this to exclude date_joined from the form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('EESA Info', {'fields': ('user_type', 'phone_number', 'profile_picture', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        # Remove or modify this line if you have it - don't include date_joined
        # ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # If you're using add_fieldsets, check that one too
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'first_name', 'last_name', 'user_type'),
        }),
    )
    
    def get_inlines(self, request, obj=None):
        if obj:
            if obj.user_type == 'student':
                return [StudentInline]
            elif obj.user_type == 'faculty':
                return [FacultyInline]
        return []

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Student)
admin.site.register(Faculty)