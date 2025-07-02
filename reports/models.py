from django.db import models

class Report(models.Model):
    ngo_id = models.CharField(max_length=100)
    month = models.CharField(max_length=7)  # YYYY-MM
    people_helped = models.IntegerField()
    events_conducted = models.IntegerField()
    funds_utilized = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.ngo_id} - {self.month}"