# backend/goodforgood/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'goodforgood.settings')

app = Celery('goodforgood')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(['reports']) 