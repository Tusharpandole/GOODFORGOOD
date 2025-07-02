from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Report
from .serializers import ReportSerializer
import uuid
from .tasks import process_bulk_upload

@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok"})

@api_view(['POST'])
def report_create(request):
    serializer = ReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def job_status(request, job_id):
    return Response({"job_id": job_id, "status": "pending", "processed": 0, "total": 0})

@api_view(['GET'])
def dashboard_data(request):
    month = request.query_params.get('month', None)
    if not month:
        return Response({"error": "Month parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if not len(month) == 7 or month[4] != '-':
            raise ValueError("Invalid month format")
        year, month_num = map(int, month.split('-'))
        if not (1 <= month_num <= 12):
            raise ValueError("Invalid month number")
    except ValueError:
        return Response({"error": "Month must be in YYYY-MM format (e.g., 2025-07)"}, status=status.HTTP_400_BAD_REQUEST)

    reports = Report.objects.filter(month=month)
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def bulk_upload(request):
    if 'file' not in request.FILES:
        return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
    file = request.FILES['file']
    job_id = str(uuid.uuid4())
    process_bulk_upload.delay(job_id, file.read().decode('utf-8'))
    return Response({"job_id": job_id}, status=status.HTTP_202_ACCEPTED)