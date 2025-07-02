from django.urls import path
from . import views

urlpatterns = [
    path('api/health', views.health_check, name='health_check'),
    path('api/report', views.report_create, name='report_create'),
    path('api/job-status/<str:job_id>', views.job_status, name='job_status'),
    path('api/dashboard', views.dashboard_data, name='dashboard_data'),  # Add this
    path('api/reports/upload', views.bulk_upload, name='bulk_upload'),
]