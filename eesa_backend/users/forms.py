# users/forms.py
from django import forms
from django.core.exceptions import ValidationError
from .models import Student, Faculty, CustomUser
import csv
import io

class StudentRegistrationForm(forms.ModelForm):
    # User fields
    username = forms.CharField(required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)
    confirm_password = forms.CharField(widget=forms.PasswordInput, required=True)
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)
    email = forms.EmailField(required=True)
    phone_number = forms.CharField(max_length=10, required=True)
    
    class Meta:
        model = Student
        fields = ['student_id', 'enrollment_year', 'current_semester', 'course', 
                 'branch', 'batch', 'cgpa', 'father_name', 'mother_name', 
                 'parent_phone', 'permanent_address', 'current_address']
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        
        if password != confirm_password:
            raise ValidationError("Passwords don't match")
        
        # Check if username already exists
        username = cleaned_data.get('username')
        if CustomUser.objects.filter(username=username).exists():
            raise ValidationError("Username already exists")
        
        # Check if email already exists
        email = cleaned_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            raise ValidationError("Email already exists")
        
        return cleaned_data

class BulkStudentUploadForm(forms.Form):
    csv_file = forms.FileField(
        label='Select CSV file',
        help_text='CSV should contain: first_name, last_name, email, phone, enrollment_year, course, branch'
    )
    send_welcome_email = forms.BooleanField(
        required=False,
        initial=True,
        label='Send welcome email to students'
    )
    
    def clean_csv_file(self):
        csv_file = self.cleaned_data['csv_file']
        
        # Check file extension
        if not csv_file.name.endswith('.csv'):
            raise ValidationError('File must be a CSV')
        
        # Check file size (limit to 5MB)
        if csv_file.size > 5 * 1024 * 1024:
            raise ValidationError('File size must be less than 5MB')
        
        # Validate CSV structure
        try:
            # Read and decode file
            csv_file.seek(0)
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            # Check required columns
            required_columns = ['first_name', 'last_name', 'email', 'enrollment_year', 'course', 'branch']
            if not all(col in reader.fieldnames for col in required_columns):
                missing = [col for col in required_columns if col not in reader.fieldnames]
                raise ValidationError(f'Missing required columns: {", ".join(missing)}')
            
            # Reset file position
            csv_file.seek(0)
            
        except Exception as e:
            raise ValidationError(f'Error reading CSV file: {str(e)}')
        
        return csv_file

class StudentSearchForm(forms.Form):
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'placeholder': 'Search by name, ID, email...',
            'class': 'form-control'
        })
    )
    enrollment_year = forms.ChoiceField(
        required=False,
        choices=[],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    semester = forms.ChoiceField(
        required=False,
        choices=[('', 'All Semesters')] + [(i, f'Semester {i}') for i in range(1, 9)],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    course = forms.ChoiceField(
        required=False,
        choices=[('', 'All Courses')] + Student.COURSE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    branch = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'placeholder': 'Branch',
            'class': 'form-control'
        })
    )
    is_active = forms.ChoiceField(
        required=False,
        choices=[('', 'All'), ('true', 'Active'), ('false', 'Alumni/Inactive')],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Populate enrollment years dynamically
        years = Student.objects.values_list('enrollment_year', flat=True).distinct().order_by('-enrollment_year')
        year_choices = [('', 'All Years')] + [(year, str(year)) for year in years]
        self.fields['enrollment_year'].choices = year_choices