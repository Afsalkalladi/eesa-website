from rest_framework import serializers
from .models import CustomUser, Student, Faculty
from django.contrib.auth.password_validation import validate_password

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 
                  'profile_picture', 'user_type', 'is_verified', 'password', 'confirm_password']
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
        password = validated_data.pop('password')
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class StudentCreateSerializer(serializers.ModelSerializer):
    # User fields
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(required=True)
    
    class Meta:
        model = Student
        fields = [
            # User fields
            'username', 'password', 'confirm_password', 'first_name', 'last_name', 
            'email', 'phone_number',
            # Student fields
            'student_id', 'enrollment_year', 'current_semester', 'course', 'branch', 
            'batch', 'cgpa', 'father_name', 'mother_name', 'parent_phone',
            'permanent_address', 'current_address', 'is_active'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if username already exists
        if CustomUser.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})
        
        # Check if email already exists
        if CustomUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        
        return attrs
    
    def create(self, validated_data):
        # Extract user fields
        user_data = {
            'username': validated_data.pop('username'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'phone_number': validated_data.pop('phone_number'),
            'user_type': 'student'
        }
        password = validated_data.pop('password')
        
        # Create user
        user = CustomUser.objects.create(**user_data)
        user.set_password(password)
        user.save()
        
        # Create student profile
        student = Student.objects.create(user=user, **validated_data)
        
        return student

class StudentSerializer(serializers.ModelSerializer):
    # User fields (read-only)
    username = serializers.ReadOnlyField(source='user.username')
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    email = serializers.ReadOnlyField(source='user.email')
    phone_number = serializers.ReadOnlyField(source='user.phone_number')
    full_name = serializers.SerializerMethodField()
    calculated_semester = serializers.ReadOnlyField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'user', 'username', 'first_name', 'last_name', 'full_name',
            'email', 'phone_number', 'student_id', 'enrollment_year', 
            'current_semester', 'calculated_semester', 'course', 'branch', 
            'batch', 'cgpa', 'father_name', 'mother_name', 'parent_phone',
            'permanent_address', 'current_address', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'calculated_semester']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()

class StudentUpdateSerializer(serializers.ModelSerializer):
    # Allow updating some user fields
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    phone_number = serializers.CharField(source='user.phone_number', required=False)
    
    class Meta:
        model = Student
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'current_semester', 'cgpa', 'father_name', 'mother_name', 
            'parent_phone', 'permanent_address', 'current_address', 'is_active'
        ]
    
    def update(self, instance, validated_data):
        # Update user fields if provided
        user_data = validated_data.pop('user', {})
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        
        # Update student fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class FacultyCreateSerializer(serializers.ModelSerializer):
    # User fields
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(required=True)
    
    class Meta:
        model = Faculty
        fields = [
            # User fields
            'username', 'password', 'confirm_password', 'first_name', 'last_name', 
            'email', 'phone_number',
            # Faculty fields
            'faculty_id', 'department', 'designation', 'joining_date',
            'qualification', 'specialization', 'experience_years',
            'research_interests', 'publications', 'office_room', 'office_phone',
            'is_active'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if username already exists
        if CustomUser.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists."})
        
        # Check if email already exists
        if CustomUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        
        return attrs
    
    def create(self, validated_data):
        # Extract user fields
        user_data = {
            'username': validated_data.pop('username'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'phone_number': validated_data.pop('phone_number'),
            'user_type': 'faculty'
        }
        password = validated_data.pop('password')
        
        # Create user
        user = CustomUser.objects.create(**user_data)
        user.set_password(password)
        user.save()
        
        # Create faculty profile
        faculty = Faculty.objects.create(user=user, **validated_data)
        
        return faculty

class FacultySerializer(serializers.ModelSerializer):
    # User fields (read-only)
    username = serializers.ReadOnlyField(source='user.username')
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')
    email = serializers.ReadOnlyField(source='user.email')
    phone_number = serializers.ReadOnlyField(source='user.phone_number')
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Faculty
        fields = [
            'id', 'user', 'username', 'first_name', 'last_name', 'full_name',
            'email', 'phone_number', 'faculty_id', 'department', 'designation',
            'joining_date', 'qualification', 'specialization', 'experience_years',
            'research_interests', 'publications', 'office_room', 'office_phone',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()

class FacultyUpdateSerializer(serializers.ModelSerializer):
    # Allow updating some user fields
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    phone_number = serializers.CharField(source='user.phone_number', required=False)
    
    class Meta:
        model = Faculty
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'department', 'designation', 'qualification', 'specialization',
            'experience_years', 'research_interests', 'publications',
            'office_room', 'office_phone', 'is_active'
        ]
    
    def update(self, instance, validated_data):
        # Update user fields if provided
        user_data = validated_data.pop('user', {})
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        
        # Update faculty fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

# Simplified list serializers for better performance
class StudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = Student
        fields = ['id', 'student_id', 'full_name', 'email', 'enrollment_year', 
                 'current_semester', 'course', 'branch', 'is_active']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()

class FacultyListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = Faculty
        fields = ['id', 'faculty_id', 'full_name', 'email', 'department', 
                 'designation', 'is_active']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()