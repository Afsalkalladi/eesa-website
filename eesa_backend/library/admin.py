from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'uploaded_by', 'status', 'reviewer')
    list_filter = ('status', 'subject')
    search_fields = ('title', 'description', 'subject')