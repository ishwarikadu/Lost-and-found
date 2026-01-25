from django.db import models
from django.contrib.auth.models import User

#created class profile for 2 diff users student and staff
class Profile(models.Model):
    ROLE_CHOICES = [
        ("STUDENT", "Student"),
        ("STAFF", "Staff"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

# created class report to report lost and found items
class Report(models.Model):
    STATUS_CHOICES = [
        ("LOST", "Lost"),
        ("FOUND", "Found"),
    ]

    item_name = models.CharField(max_length=200, blank=True, null=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    location = models.CharField(max_length=200)
    image_url = models.URLField(blank=True, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    is_matched = models.BooleanField(default=False)


    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.status}"

# created class match for admin approval system
class Match(models.Model):
    MATCH_STATUS = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    lost_report = models.ForeignKey(
        Report, on_delete=models.CASCADE, related_name="lost_matches"
    )
    found_report = models.ForeignKey(
        Report, on_delete=models.CASCADE, related_name="found_matches"
    )

    match_score = models.FloatField(default=0.0)
    status = models.CharField(max_length=10, choices=MATCH_STATUS, default="PENDING")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match {self.lost_report.id} ↔ {self.found_report.id} ({self.match_score})"

