from django.db import models
from django.contrib.auth.models import User

class LostFoundItem(models.Model):
    STATUS_CHOICES = [
        ("LOST", "Lost"),
        ("FOUND", "Found"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    image_url = models.URLField(blank=True, null=True)

    posted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.status})"
