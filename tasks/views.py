from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer
from .ai_service import get_ai_suggestions

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated] 

    #naye Filters aur Search
    filterset_fields = ['status', 'ai_priority', 'is_ai_processed']
    search_fields = ['title', 'description', 'ai_tags']
    ordering_fields = ['created_at', 'due_date']

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # 1. Pehle task ko save karo
        task = serializer.save(owner=self.request.user)

        # 2. AI Service ko call karo
        ai_data = get_ai_suggestions(task.title, task.description)

        # 3. Agar AI ne result diya hai, toh Task ko update kar do
        if ai_data:
            task.ai_priority = ai_data.get('priority', 'MEDIUM')
            task.ai_tags = ai_data.get('tags', [])
            task.ai_next_action = ai_data.get('next_action', '')
            task.is_ai_processed = True
            task.save()