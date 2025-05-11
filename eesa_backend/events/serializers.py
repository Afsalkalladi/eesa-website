from rest_framework import serializers
from .models import Event, Project

class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.ReadOnlyField(source='organizer.get_full_name')
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 
                 'image', 'organizer', 'organizer_name', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    contributors_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'contributors', 
                 'contributors_names', 'image', 'github_link', 
                 'created_at', 'updated_at']
    
    def get_contributors_names(self, obj):
        return [user.get_full_name() for user in obj.contributors.all()]