from django.contrib import admin
from results.models import Result


@admin.register(Result)
class ResultsAdmin(admin.ModelAdmin):
    list_display = ("registration", "score", "grade", "grade_point", "is_published", "uploaded_by", "created_at", "updated_at")
    search_fields = ("registration",)