from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. Custom User Model
class User(AbstractUser):
    email = models.EmailField(unique=True)
    max_workload_capacity = models.IntegerField(default=5) 
    
    # Hum email se login karwayenge
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

# 2. Task Model (The Core)
class Task(models.Model):  # Dhyan dein: models.Model likha hai
    # Dropdown choices
    STATUS_CHOICES = (
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    )
    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    )

    # Basic Task Info
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    # Tracking & Deadlines
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 🤖 AI / LLM Fields
    is_ai_processed = models.BooleanField(default=False)
    ai_priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, blank=True, null=True)
    ai_tags = models.JSONField(default=list, blank=True, null=True)
    ai_next_action = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title