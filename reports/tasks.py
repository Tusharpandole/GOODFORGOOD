# backend/reports/tasks.py
from celery import shared_task
from .models import Report
from .serializers import ReportSerializer
from django.core.cache import cache
import csv
import os
import logging
from redis.exceptions import ConnectionError

logger = logging.getLogger('reports.tasks')

@shared_task
def process_csv_upload(file_path, job_id):
    errors = []
    processed = 0
    total = 0

    def update_cache(status, processed, total, errors):
        try:
            cache.set(f"job_{job_id}", {
                "status": status,
                "processed": processed,
                "total": total,
                "errors": errors
            }, timeout=3600)
            logger.debug(f"Cache updated for job_id {job_id}: {status}, {processed}/{total}")
        except ConnectionError as e:
            logger.error(f"Failed to update cache for job_id {job_id}: {str(e)}")
            errors.append(f"Cache update error: {str(e)}")

    logger.info(f"Starting CSV processing for job_id: {job_id}, file_path: {file_path}")
    update_cache("processing", 0, 0, [])

    try:
        if not os.path.exists(file_path):
            errors.append(f"File not found: {file_path}")
            logger.error(f"Job {job_id}: File not found: {file_path}")
            update_cache("failed", 0, 0, errors)
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            if not lines:
                errors.append("Empty CSV file")
                logger.error(f"Job {job_id}: Empty CSV file")
                update_cache("failed", 0, 0, errors)
                raise ValueError("Empty CSV file")
            total = len(lines) - 1
            logger.info(f"Total rows to process (excluding header): {total}")
            update_cache("processing", 0, total, [])

            file.seek(0)
            reader = csv.DictReader(file)
            expected_fields = {'ngo_id', 'month', 'people_helped', 'events_conducted', 'funds_utilized'}
            if not expected_fields.issubset(reader.fieldnames):
                missing = expected_fields - set(reader.fieldnames)
                errors.append(f"Missing required columns: {missing}")
                logger.error(f"Job {job_id}: Missing columns {missing}")
                update_cache("failed", 0, total, errors)
                raise ValueError(f"Missing columns: {missing}")

            for row_num, row in enumerate(reader, 1):
                logger.debug(f"Processing row {row_num}: {row}")
                try:
                    row['people_helped'] = int(row['people_helped'])
                    row['events_conducted'] = int(row['events_conducted'])
                    row['funds_utilized'] = float(row['funds_utilized'])
                except (ValueError, KeyError) as e:
                    errors.append(f"Row {row_num}: Invalid numeric value - {str(e)}")
                    logger.error(f"Job {job_id}: Row {row_num} invalid - {str(e)}")
                    update_cache("processing", processed, total, errors)
                    continue

                serializer = ReportSerializer(data=row)
                if serializer.is_valid():
                    try:
                        serializer.save()
                        processed += 1
                        logger.debug(f"Job {job_id}: Row {row_num} saved successfully")
                    except Exception as e:
                        errors.append(f"Row {row_num}: Database error - {str(e)}")
                        logger.error(f"Job {job_id}: Row {row_num} database error - {str(e)}")
                else:
                    errors.append(f"Row {row_num}: {serializer.errors}")
                    logger.error(f"Job {job_id}: Row {row_num} failed - {serializer.errors}")
                update_cache("processing", processed, total, errors)

    except Exception as e:
        logger.error(f"Error processing CSV for job_id {job_id}: {str(e)}")
        errors.append(f"Processing error: {str(e)}")
        update_cache("failed", processed, total, errors)
    finally:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Temporary file {file_path} deleted")
            else:
                logger.warning(f"Temporary file {file_path} not found for deletion")
        except Exception as e:
            logger.error(f"Error deleting temporary file {file_path}: {str(e)}")
            errors.append(f"File deletion error: {str(e)}")

    status = "completed" if processed == total and not errors else "failed"
    update_cache(status, processed, total, errors)
    logger.info(f"Completed CSV processing for job_id: {job_id}, status: {status}, processed: {processed}/{total}, errors: {errors}")