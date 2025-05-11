from django.db import models
from users.models import Student, Faculty

class Subject(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    semester = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class FacultySubject(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='assigned_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assigned_faculty')
    batch = models.CharField(max_length=10)  # e.g., "2022-2026"
    
    class Meta:
        unique_together = ('faculty', 'subject', 'batch')
    
    def __str__(self):
        return f"{self.faculty.user.username} - {self.subject.name} - {self.batch}"

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='attendance_records')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='marked_attendance')
    date = models.DateField()
    hour = models.IntegerField(choices=[(i, i) for i in range(1, 7)])  # Hours 1-6
    present = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('student', 'subject', 'date', 'hour')
    
    def __str__(self):
        status = "Present" if self.present else "Absent"
        return f"{self.student.user.username} - {self.subject.name} - Hour {self.hour} - {status}"

class InternalMark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='internal_marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='internal_marks')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='given_marks')
    test_name = models.CharField(max_length=100)  # e.g., "Internal 1", "Assignment 2"
    max_mark = models.FloatField()
    obtained_mark = models.FloatField()
    remarks = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.student.user.username} - {self.subject.name} - {self.test_name}"

class Assignment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('not_submitted', 'Not Submitted'),
        ('redo', 'Redo'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='created_assignments')
    batch = models.CharField(max_length=10)
    due_date = models.DateTimeField()
    file = models.FileField(upload_to='assignments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.subject.name}"

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignment_submissions')
    file = models.FileField(upload_to='assignment_submissions/')
    submission_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=15, choices=Assignment.STATUS_CHOICES, default='submitted')
    comments = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.student.user.username} - {self.assignment.title}"

class StudyMaterial(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='study_materials')
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='uploaded_materials')
    batch = models.CharField(max_length=10)  # Only visible to this batch
    file = models.FileField(upload_to='study_materials/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.subject.name} - {self.batch}"