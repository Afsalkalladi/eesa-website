from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_superuser or request.user.user_type == 'admin')

class IsFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'faculty'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'student'

class IsAdminOrFaculty(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.user_type in ['admin', 'faculty']

class IsOwnerOrAdminOrFaculty(permissions.BasePermission):
    """
    Custom permission to only allow owners of a resource to edit it.
    Admins and faculty can view all.
    """
    def has_object_permission(self, request, view, obj):
        # Allow admin and faculty to view any resource
        if request.method in permissions.SAFE_METHODS:
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