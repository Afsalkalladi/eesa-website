from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import datetime

# Define phone_regex at the module level
phone_regex = RegexValidator(regex=r'^\d{10}$', message="Phone number must be 10 digits")

def current_year():
    """Get current year - used as default for enrollment_year"""
    return timezone.now().year

def default_batch():
    """Generate default batch string"""
    year = timezone.now().year
    return f"{year}-{year + 4}"

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(validators=[phone_regex], max_length=10, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    
    # Common fields
    is_verified = models.BooleanField(default=False)
    # Changed from auto_now_add=True to default=timezone.now to make it editable
    date_joined = models.DateTimeField(default=timezone.now)
    last_active = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

class Student(models.Model):
    COURSE_CHOICES = (
        ('BTech', 'B.Tech'),
        ('MTech', 'M.Tech'),
        ('MSc', 'M.Sc'),
        ('PhD', 'Ph.D'),
    )
    
    # User connection
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    
    # Student specific fields with defaults
    student_id = models.CharField(max_length=20, unique=True)
    enrollment_year = models.IntegerField(default=current_year)
    current_semester = models.IntegerField(default=1)
    
    # Course details with defaults
    course = models.CharField(max_length=10, choices=COURSE_CHOICES, default='BTech')
    branch = models.CharField(max_length=100, default='Not Specified')
    batch = models.CharField(max_length=10, default=default_batch)
    
    # Academic performance
    cgpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Parent/Guardian details
    father_name = models.CharField(max_length=100, blank=True, default='')
    mother_name = models.CharField(max_length=100, blank=True, default='')
    parent_phone = models.CharField(validators=[phone_regex], max_length=10, blank=True, default='')
    
    # Address
    permanent_address = models.TextField(blank=True, default='')
    current_address = models.TextField(blank=True, default='')
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def calculated_semester(self):
        """Calculate current semester based on enrollment year"""
        current_year = timezone.now().year
        current_month = timezone.now().month
        
        # Assuming academic year starts in August
        if current_month >= 8:
            academic_year = current_year
        else:
            academic_year = current_year - 1
        
        years_enrolled = academic_year - self.enrollment_year
        # 2 semesters per year
        calculated_sem = (years_enrolled * 2) + (2 if current_month >= 1 else 1)
        
        # Cap at maximum semesters based on course
        max_semesters = {
            'BTech': 8,
            'MTech': 4,
            'MSc': 4,
            'PhD': 10,
        }
        
        return min(calculated_sem, max_semesters.get(self.course, 8))
    
    def update_semester(self):
        """Update current semester based on calculation"""
        old_semester = self.current_semester
        self.current_semester = self.calculated_semester
        if old_semester != self.current_semester:
            self.save()
        return self.current_semester
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"
    
    class Meta:
        ordering = ['-enrollment_year', 'student_id']
        indexes = [
            models.Index(fields=['enrollment_year']),
            models.Index(fields=['current_semester']),
            models.Index(fields=['student_id']),
            models.Index(fields=['branch']),
        ]

class Faculty(models.Model):
    DESIGNATION_CHOICES = (
        ('Assistant Professor', 'Assistant Professor'),
        ('Associate Professor', 'Associate Professor'),
        ('Professor', 'Professor'),
        ('HOD', 'Head of Department'),
        ('Dean', 'Dean'),
    )
    
    # User connection
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='faculty_profile')
    
    # Faculty specific fields with defaults
    faculty_id = models.CharField(max_length=20, unique=True)
    
    # Professional details with defaults
    department = models.CharField(max_length=100, default='Not Specified')
    designation = models.CharField(max_length=100, choices=DESIGNATION_CHOICES, default='Assistant Professor')
    joining_date = models.DateField(default=timezone.now)
    
    # Qualifications with defaults
    qualification = models.CharField(max_length=200, default='M.Tech')
    specialization = models.CharField(max_length=200, default='Not Specified')
    experience_years = models.IntegerField(default=0)
    
    # Research
    research_interests = models.TextField(blank=True, default='')
    publications = models.TextField(blank=True, default='')
    
    # Contact
    office_room = models.CharField(max_length=20, blank=True, default='')
    office_phone = models.CharField(max_length=10, blank=True, default='')
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.designation}"
    
    class Meta:
        ordering = ['department', 'designation', 'faculty_id']
        indexes = [
            models.Index(fields=['department']),
            models.Index(fields=['designation']),
            models.Index(fields=['faculty_id']),
        ]