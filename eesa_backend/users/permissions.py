from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Only allow admins"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.user_type == 'admin'
        )

class IsFaculty(permissions.BasePermission):
    """Only allow faculty users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'faculty'

class IsStudent(permissions.BasePermission):
    """Only allow student users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'student'

class IsAdminOrFaculty(permissions.BasePermission):
    """Allow admin or faculty users"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.user_type in ['admin', 'faculty']
        )

class IsOwnerOrAdminOrFaculty(permissions.BasePermission):
    """
    Custom permission to only allow owners of a resource to edit it.
    Admins and faculty can view/edit all.
    """
    def has_object_permission(self, request, view, obj):
        # Admin and faculty have full access
        if request.user.is_superuser or request.user.user_type in ['admin', 'faculty']:
            return True
        
        # Check if the object has a user attribute and if it matches the request user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if the object has an uploaded_by attribute and if it matches the request user's student profile
        if hasattr(obj, 'uploaded_by') and hasattr(request.user, 'student_profile'):
            return obj.uploaded_by == request.user.student_profile
        
        # Check if the object has a student attribute and if it matches the request user's student profile
        if hasattr(obj, 'student') and hasattr(request.user, 'student_profile'):
            return obj.student == request.user.student_profile
        
        return False

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Admins can edit anything.
    Everyone else can only read.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner or admin
        if request.user.is_superuser or request.user.user_type == 'admin':
            return True
        
        # Check if the object has a user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit.
    Everyone else can only read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_superuser or request.user.user_type == 'admin'

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners or admin to view/edit.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.user_type == 'admin':
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False

class IsFacultyOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow faculty or admin users.
    Same as IsAdminOrFaculty but with a different name for clarity.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.user_type in ['admin', 'faculty']
        )