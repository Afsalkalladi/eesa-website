from rest_framework import serializers
from .models import (Subject, FacultySubject, Attendance, InternalMark, 
                    Assignment, AssignmentSubmission, StudyMaterial)

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'code', 'name', 'semester', 'description']

class FacultySubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    faculty_name = serializers.ReadOnlyField(source='faculty.user.get_full_name')
    
    class Meta:
        model = FacultySubject
        fields = ['id', 'faculty', 'faculty_name', 'subject', 'subject_name', 'batch']

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.user.get_full_name')
    subject_name = serializers.ReadOnlyField(source='subject.name')
    faculty_name = serializers.ReadOnlyField(source='faculty.user.get_full_name')
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name', 
                 'faculty', 'faculty_name', 'date', 'hour', 'present']

class InternalMarkSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.user.get_full_name')
    subject_name = serializers.ReadOnlyField(source='subject.name')
    faculty_name = serializers.ReadOnlyField(source='faculty.user.get_full_name')
    
    class Meta:
        model = InternalMark
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name', 
                 'faculty', 'faculty_name', 'test_name', 'max_mark', 
                 'obtained_mark', 'remarks']

class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    faculty_name = serializers.ReadOnlyField(source='faculty.user.get_full_name')
    
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'subject', 'subject_name', 
                 'faculty', 'faculty_name', 'batch', 'due_date', 'file', 'created_at']

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.user.get_full_name')
    assignment_title = serializers.ReadOnlyField(source='assignment.title')
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'assignment_title', 'student', 
                 'student_name', 'file', 'submission_date', 'status', 'comments']

class StudyMaterialSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    faculty_name = serializers.ReadOnlyField(source='faculty.user.get_full_name')
    
    class Meta:
        model = StudyMaterial
        fields = ['id', 'title', 'description', 'subject', 'subject_name', 
                 'faculty', 'faculty_name', 'batch', 'file', 'created_at']