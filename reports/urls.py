from django.urls import path
from .views import ReportView, ReportUploadView, JobStatusView, DashboardView

urlpatterns = [
    path('api/report', ReportView.as_view(), name='report'),
    path('api/reports/upload', ReportUploadView.as_view(), name='report-upload'),
    path('api/job-status/<str:job_id>', JobStatusView.as_view(), name='job-status'),
    path('api/dashboard', DashboardView.as_view(), name='dashboard'),
]