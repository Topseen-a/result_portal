from django.db import models
from account.models import Staff


class Results(models.Model):
    score = models.IntegerField(default=0)
    grade = models.CharField(max_length=1, blank=False, null=False)
    grade_point = models.IntegerField(default=0.0, blank=False, null=False)
    is_published = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(Staff, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.grade} - {self.grade_point} - {self.uploaded_by}"