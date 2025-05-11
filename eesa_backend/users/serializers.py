from rest_framework import serializers
from .models import CustomUser, Student, Faculty
from django.contrib.auth.password_validation import validate_password

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'student_id', 'batch', 'semester']

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'faculty_id', 'department', 'designation']

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    student_profile = StudentSerializer(required=False)
    faculty_profile = FacultySerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 
                  'profile_picture', 'user_type', 'is_verified', 'password', 
                  'confirm_password', 'student_profile', 'faculty_profile']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user_type = validated_data.get('user_type')
        student_data = None
        faculty_data = None
        
        if 'student_profile' in validated_data:
            student_data = validated_data.pop('student_profile')
        
        if 'faculty_profile' in validated_data:
            faculty_data = validated_data.pop('faculty_profile')
        
        user = CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            profile_picture=validated_data.get('profile_picture', None),
            user_type=user_type
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        if user_type == 'student' and student_data:
            Student.objects.create(user=user, **student_data)
        elif user_type == 'faculty' and faculty_data:
            Faculty.objects.create(user=user, **faculty_data)
        
        return user