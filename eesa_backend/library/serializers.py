from rest_framework import serializers
from .models import Note

class NoteSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.user.get_full_name')
    reviewer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = ['id', 'title', 'description', 'file', 'uploaded_by', 
                 'uploaded_by_name', 'subject', 'status', 'reviewer', 
                 'reviewer_name', 'review_comment', 'created_at', 'updated_at']
    
    def get_reviewer_name(self, obj):
        if obj.reviewer:
            return obj.reviewer.user.get_full_name()
        return None