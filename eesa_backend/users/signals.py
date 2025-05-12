# users/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
from .models import CustomUser, Student, Faculty
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create profile when user is created
    """
    if created:
        try:
            if instance.user_type == 'student':
                # Check if student profile doesn't already exist
                if not hasattr(instance, 'student_profile'):
                    Student.objects.create(
                        user=instance,
                        student_id=f"TEMP_{instance.id}",  # Temporary ID
                        enrollment_year=timezone.now().year,
                        current_semester=1,
                        course='BTech',
                        branch='Not Assigned',
                        batch=f"{timezone.now().year}-{timezone.now().year + 4}"
                    )
                    logger.info(f"Created student profile for user {instance.username}")
                    
            elif instance.user_type == 'faculty':
                # Check if faculty profile doesn't already exist
                if not hasattr(instance, 'faculty_profile'):
                    Faculty.objects.create(
                        user=instance,
                        faculty_id=f"TEMP_{instance.id}",  # Temporary ID
                        department='Not Assigned',
                        designation='Assistant Professor',
                        joining_date=timezone.now().date()
                    )
                    logger.info(f"Created faculty profile for user {instance.username}")
                    
        except Exception as e:
            logger.error(f"Error creating profile for user {instance.username}: {str(e)}")

@receiver(pre_save, sender=Student)
def validate_student_data(sender, instance, **kwargs):
    """
    Validate student data before saving
    """
    # Validate CGPA
    if instance.cgpa is not None:
        if instance.cgpa < 0 or instance.cgpa > 10:
            raise ValidationError("CGPA must be between 0 and 10")
    
    # Validate semester
    max_semesters = {
        'BTech': 8,
        'MTech': 4,
        'MSc': 4,
        'PhD': 10,
    }
    
    max_sem = max_semesters.get(instance.course, 8)
    if instance.current_semester < 1 or instance.current_semester > max_sem:
        raise ValidationError(f"Semester must be between 1 and {max_sem} for {instance.course}")
    
    # Auto-generate student ID if it's temporary
    if instance.student_id.startswith('TEMP_'):
        from .utils import generate_student_id
        instance.student_id = generate_student_id(
            instance.enrollment_year,
            instance.course,
            instance.branch
        )

@receiver(pre_save, sender=Faculty)
def validate_faculty_data(sender, instance, **kwargs):
    """
    Validate faculty data before saving
    """
    # Auto-generate faculty ID if it's temporary
    if instance.faculty_id.startswith('TEMP_'):
        from .utils import generate_faculty_id
        instance.faculty_id = generate_faculty_id(
            instance.department,
            instance.joining_date.year if instance.joining_date else timezone.now().year
        )

# Register signals in apps.py
# Add this to your users/apps.py file:
"""
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    
    def ready(self):
        import users.signals
"""