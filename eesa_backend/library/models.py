from django.db import models
from users.models import CustomUser, Student, Faculty

class Note(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    file = models.FileField(upload_to='notes/')
    uploaded_by = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='uploaded_notes')
    subject = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reviewer = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_notes')
    review_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.status}"