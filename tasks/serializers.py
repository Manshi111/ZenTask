from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__' # Saare fields API mein dikhenge
        
        # In fields ko User change nahi kar sakta, sirf hum ya AI change karega
        read_only_fields = ['owner', 'is_ai_processed', 'ai_priority', 'ai_tags', 'ai_next_action']