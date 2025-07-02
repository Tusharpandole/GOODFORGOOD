# backend/reports/views.py
from venv import logger
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Report
from .serializers import ReportSerializer
from .tasks import process_csv_upload
import uuid
from django.db.models import Sum
from django.core.cache import cache
import os
import tempfile
import logging

class ReportView(APIView):
    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportUploadView(APIView):
    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return Response({"error": "File must be a CSV"}, status=status.HTTP_400_BAD_REQUEST)
        job_id = str(uuid.uuid4())
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name
        # Pass file path to Celery task
        process_csv_upload.delay(temp_file_path, job_id)
        cache.set(f"job_{job_id}", {"status": "processing", "processed": 0, "total": 0, "errors": []}, timeout=3600)
        return Response({"job_id": job_id}, status=status.HTTP_202_ACCEPTED)

class JobStatusView(APIView):
    def get(self, request, job_id):
        try:
            job_status = cache.get(f"job_{job_id}")
            if job_status is None:
                logger.error(f"Job status not found for job_id {job_id}")
                return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
            logger.debug(f"Retrieved job status for job_id {job_id}: {job_status}")
            return Response(job_status, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to retrieve job status for job_id {job_id}: {str(e)}")
            return Response({"error": f"Status retrieval failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardView(APIView):
    def get(self, request):
        month = request.query_params.get('month')
        if not month:
            return Response({"error": "Month parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        reports = Report.objects.filter(month=month)
        total_ngos = reports.values('ngo_id').distinct().count()
        total_people = reports.aggregate(Sum('people_helped'))['people_helped__sum'] or 0
        total_events = reports.aggregate(Sum('events_conducted'))['events_conducted__sum'] or 0
        total_funds = reports.aggregate(Sum('funds_utilized'))['funds_utilized__sum'] or 0
        return Response({
            "total_ngos": total_ngos,
            "total_people_helped": total_people,
            "total_events": total_events,
            "total_funds": float(total_funds)
        })