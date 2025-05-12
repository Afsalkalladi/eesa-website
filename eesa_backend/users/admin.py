from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django import forms
from django.utils import timezone
from .models import CustomUser, Student, Faculty

class StudentInline(admin.StackedInline):
    model = Student
    can_delete = False
    verbose_name_plural = 'Student Profile'

class FacultyInline(admin.StackedInline):
    model = Faculty
    can_delete = False
    verbose_name_plural = 'Faculty Profile'

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_verified', 'date_joined')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # Now date_joined can be included in the fieldsets
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('EESA Info', {'fields': ('user_type', 'phone_number', 'profile_picture', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Define fieldsets for adding new users
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'first_name', 'last_name', 'user_type', 'phone_number'),
        }),
    )
    
    def get_inlines(self, request, obj=None):
        if obj:
            if obj.user_type == 'student' and hasattr(obj, 'student_profile'):
                return [StudentInline]
            elif obj.user_type == 'faculty' and hasattr(obj, 'faculty_profile'):
                return [FacultyInline]
        return []
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        
        # Create profile if it doesn't exist
        if obj.user_type == 'student' and not hasattr(obj, 'student_profile'):
            Student.objects.create(
                user=obj,
                student_id=f'TEMP_{obj.id}',
                enrollment_year=timezone.now().year,
                current_semester=1,
                course='BTech',
                branch='Not Assigned',
                batch=f"{timezone.now().year}-{timezone.now().year + 4}"
            )
        elif obj.user_type == 'faculty' and not hasattr(obj, 'faculty_profile'):
            Faculty.objects.create(
                user=obj,
                faculty_id=f'TEMP_{obj.id}',
                department='Not Assigned',
                designation='Assistant Professor',
                joining_date=timezone.now().date()
            )

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'get_full_name', 'enrollment_year', 'current_semester', 
                   'course', 'branch', 'get_email', 'is_active')
    list_filter = ('enrollment_year', 'current_semester', 'course', 'branch', 'is_active')
    search_fields = ('student_id', 'user__first_name', 'user__last_name', 'user__email')
    ordering = ['-enrollment_year', 'student_id']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Student Information', {
            'fields': ('student_id', 'enrollment_year', 'current_semester', 'course', 'branch', 'batch')
        }),
        ('Academic Information', {
            'fields': ('cgpa',)
        }),
        ('Family Information', {
            'fields': ('father_name', 'mother_name', 'parent_phone'),
            'classes': ('collapse',)
        }),
        ('Address', {
            'fields': ('permanent_address', 'current_address'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        })
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'user__first_name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'
    
    actions = ['update_semesters', 'mark_as_alumni', 'mark_as_active']
    
    def update_semesters(self, request, queryset):
        updated = 0
        for student in queryset:
            old_sem = student.current_semester
            student.update_semester()
            if old_sem != student.current_semester:
                updated += 1
        self.message_user(request, f'{updated} students had their semesters updated.')
    update_semesters.short_description = 'Update semesters based on enrollment year'
    
    def mark_as_alumni(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} students marked as alumni.')
    mark_as_alumni.short_description = 'Mark as alumni (inactive)'
    
    def mark_as_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} students marked as active.')
    mark_as_active.short_description = 'Mark as active'

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('faculty_id', 'get_full_name', 'department', 'designation',
                   'get_email', 'get_phone', 'joining_date', 'is_active')
    list_filter = ('department', 'designation', 'is_active')
    search_fields = ('faculty_id', 'user__first_name', 'user__last_name', 'user__email', 'department')
    ordering = ['department', 'designation']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Faculty Information', {
            'fields': ('faculty_id', 'department', 'designation', 'joining_date')
        }),
        ('Professional Information', {
            'fields': ('qualification', 'specialization', 'experience_years')
        }),
        ('Research & Publications', {
            'fields': ('research_interests', 'publications'),
            'classes': ('collapse',)
        }),
        ('Contact Information', {
            'fields': ('office_room', 'office_phone'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        })
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'user__first_name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'
    
    def get_phone(self, obj):
        return obj.user.phone_number
    get_phone.short_description = 'Phone'
    get_phone.admin_order_field = 'user__phone_number'