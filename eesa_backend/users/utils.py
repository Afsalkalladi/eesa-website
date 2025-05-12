# users/utils.py
from django.utils import timezone
from datetime import datetime
import string
import random
import csv
import io
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, Student, Faculty

def calculate_current_semester(enrollment_year, course='BTech'):
    """
    Calculate current semester based on enrollment year
    """
    current_year = timezone.now().year
    current_month = timezone.now().month
    
    # Assuming academic year starts in August
    if current_month >= 8:
        academic_year = current_year
    else:
        academic_year = current_year - 1
    
    years_enrolled = academic_year - enrollment_year
    # 2 semesters per year
    calculated_sem = (years_enrolled * 2) + (2 if current_month >= 1 else 1)
    
    # Cap at maximum semesters based on course
    max_semesters = {
        'BTech': 8,
        'MTech': 4,
        'MSc': 4,
        'PhD': 10,
    }
    
    return min(calculated_sem, max_semesters.get(course, 8))

def generate_student_id(enrollment_year, course, branch, sequence_number=None):
    """
    Generate student ID based on enrollment year, course, and branch
    Format: YEAR_COURSE_BRANCH_SEQUENCE
    Example: 2022_BT_CS_001
    """
    year_code = str(enrollment_year)[-2:]  # Last 2 digits of year
    
    course_codes = {
        'BTech': 'BT',
        'MTech': 'MT',
        'MSc': 'MS',
        'PhD': 'PH',
    }
    course_code = course_codes.get(course, 'XX')
    
    # Simple branch code (first 2 letters)
    branch_code = branch[:2].upper() if branch else 'XX'
    
    if sequence_number is None:
        # Generate random sequence if not provided
        sequence_number = random.randint(1, 999)
    
    return f"{year_code}{course_code}{branch_code}{sequence_number:03d}"

def generate_faculty_id(department, joining_year, sequence_number=None):
    """
    Generate faculty ID based on department and joining year
    Format: DEPT_YEAR_SEQUENCE
    Example: CS_22_001
    """
    dept_code = department[:2].upper() if department else 'XX'
    year_code = str(joining_year)[-2:]  # Last 2 digits of year
    
    if sequence_number is None:
        sequence_number = random.randint(1, 999)
    
    return f"{dept_code}{year_code}{sequence_number:03d}"

def generate_random_password(length=12):
    """
    Generate a random password
    """
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(random.choice(characters) for _ in range(length))
    return password

def bulk_create_students_from_csv(csv_file):
    """
    Create multiple students from a CSV file
    Expected CSV format: first_name,last_name,email,phone,enrollment_year,course,branch
    """
    created_students = []
    errors = []
    
    csv_reader = csv.DictReader(csv_file)
    for row_num, row in enumerate(csv_reader, start=2):  # Start from 2 (header is 1)
        try:
            # Generate username and password
            username = f"{row['first_name'].lower()}.{row['last_name'].lower()}"
            username = username.replace(' ', '')
            
            # Ensure unique username
            base_username = username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            password = generate_random_password()
            
            # Create user
            user = CustomUser.objects.create_user(
                username=username,
                email=row['email'],
                first_name=row['first_name'],
                last_name=row['last_name'],
                phone_number=row.get('phone', ''),
                user_type='student'
            )
            user.set_password(password)
            user.save()
            
            # Generate student ID
            student_id = generate_student_id(
                int(row['enrollment_year']),
                row['course'],
                row['branch']
            )
            
            # Ensure unique student ID
            while Student.objects.filter(student_id=student_id).exists():
                student_id = generate_student_id(
                    int(row['enrollment_year']),
                    row['course'],
                    row['branch']
                )
            
            # Create student profile
            student = Student.objects.create(
                user=user,
                student_id=student_id,
                enrollment_year=int(row['enrollment_year']),
                current_semester=calculate_current_semester(
                    int(row['enrollment_year']),
                    row['course']
                ),
                course=row['course'],
                branch=row['branch'],
                batch=f"{row['enrollment_year']}-{int(row['enrollment_year'])+4}",
                cgpa=float(row.get('cgpa', 0)) if row.get('cgpa') else None,
                father_name=row.get('father_name', ''),
                mother_name=row.get('mother_name', ''),
                parent_phone=row.get('parent_phone', ''),
                permanent_address=row.get('permanent_address', ''),
                current_address=row.get('current_address', '')
            )
            
            created_students.append({
                'student': student,
                'username': username,
                'password': password,
                'row_num': row_num
            })
            
        except Exception as e:
            errors.append({
                'row_num': row_num,
                'error': str(e),
                'data': row
            })
    
    return created_students, errors

def export_students_to_csv(queryset, include_passwords=False):
    """
    Export students to CSV format
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    headers = [
        'Student ID', 'Username', 'First Name', 'Last Name', 'Email', 'Phone',
        'Enrollment Year', 'Current Semester', 'Course', 'Branch', 'Batch',
        'CGPA', 'Father Name', 'Mother Name', 'Parent Phone',
        'Permanent Address', 'Current Address', 'Status'
    ]
    
    if include_passwords:
        headers.append('Password')
    
    writer.writerow(headers)
    
    # Data rows
    for student in queryset:
        row = [
            student.student_id,
            student.user.username,
            student.user.first_name,
            student.user.last_name,
            student.user.email,
            student.user.phone_number,
            student.enrollment_year,
            student.current_semester,
            student.course,
            student.branch,
            student.batch,
            student.cgpa or '',
            student.father_name,
            student.mother_name,
            student.parent_phone,
            student.permanent_address,
            student.current_address,
            'Active' if student.is_active else 'Inactive'
        ]
        
        writer.writerow(row)
    
    output.seek(0)
    return output

def send_welcome_email(user, password=None):
    """
    Send welcome email to new user
    """
    subject = 'Welcome to EESA System'
    message = f"""
    Dear {user.get_full_name()},
    
    Welcome to the EESA (Electrical Engineering Students Association) system!
    
    Your account has been created successfully.
    
    Username: {user.username}
    {'Password: ' + password if password else ''}
    
    Please login to the system and change your password if needed.
    
    Thank you,
    EESA Team
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

def get_academic_year():
    """
    Get current academic year in format "2024-2025"
    """
    now = timezone.now()
    year = now.year
    month = now.month
    
    # Academic year starts in August
    if month >= 8:
        return f"{year}-{year + 1}"
    else:
        return f"{year - 1}-{year}"

def get_current_academic_semester():
    """
    Get current academic semester (Odd or Even)
    """
    now = timezone.now()
    month = now.month
    
    # August to December - Odd semester (1, 3, 5, 7)
    # January to July - Even semester (2, 4, 6, 8)
    
    if month >= 8 or month <= 12:
        return "Odd"
    else:
        return "Even"

def update_all_student_semesters(dry_run=False, enrollment_year=None):
    """
    Update all student semesters based on their enrollment year
    Used as a management command function
    """
    # Get students to update
    students = Student.objects.filter(is_active=True)
    if enrollment_year:
        students = students.filter(enrollment_year=enrollment_year)
    
    total_students = students.count()
    updated_count = 0
    error_count = 0
    results = []
    
    for student in students:
        try:
            old_semester = student.current_semester
            calculated_semester = student.calculated_semester
            
            if old_semester != calculated_semester:
                if not dry_run:
                    student.current_semester = calculated_semester
                    student.save()
                
                updated_count += 1
                results.append({
                    'student': student,
                    'old_semester': old_semester,
                    'new_semester': calculated_semester,
                    'status': 'updated' if not dry_run else 'would_update'
                })
                
        except Exception as e:
            error_count += 1
            results.append({
                'student': student,
                'error': str(e),
                'status': 'error'
            })
    
    return {
        'total_students': total_students,
        'updated_count': updated_count,
        'error_count': error_count,
        'unchanged_count': total_students - updated_count - error_count,
        'results': results,
        'dry_run': dry_run
    }

# Management command functionality (to be used in views or as cron job)
class UpdateSemestersCommand:
    """
    This can be called from views or as a scheduled task
    """
    @staticmethod
    def execute(dry_run=False, enrollment_year=None):
        return update_all_student_semesters(dry_run=dry_run, enrollment_year=enrollment_year)