from rest_framework import serializers
from .models import Report
import re

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'

    def validate_month(self, value):
        if not re.match(r'^\d{4}-\d{2}$', value):
            raise serializers.ValidationError("Month must be in YYYY-MM format")
        return value

    def validate_people_helped(self, value):
        if value < 0:
            raise serializers.ValidationError("People helped cannot be negative")
        return value

    def validate_events_conducted(self, value):
        if value < 0:
            raise serializers.ValidationError("Events conducted cannot be negative")
        return value

    def validate_funds_utilized(self, value):
        if value < 0:
            raise serializers.ValidationError("Funds utilized cannot be negative")
        return value