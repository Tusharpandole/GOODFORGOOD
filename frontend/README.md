# GOODFORGOOD NGO Reporting System

A web app for NGOs to submit monthly reports and view aggregated data.

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Django, Django REST Framework, Celery, Redis
- **Database**: PostgreSQL

## Setup Instructions
1. **Clone Repository**:
   ```bash
   git clone <your-repo-link>
   cd goodforgood

Redis Setup:
# Stop any existing Redis services
brew services stop redis
killall redis-server
# Create Redis configuration
mkdir -p ~/redis-data
chmod 775 ~/redis-data
echo "port 6379" > ~/redis-data/redis.conf
echo "bind 127.0.0.1" >> ~/redis-data/redis.conf
echo "dir /Users/tusharpandole/redis-data/" >> ~/redis-data/redis.conf
echo "dbfilename dump.rdb" >> ~/redis-data/redis.conf
echo "stop-writes-on-bgsave-error no" >> ~/redis-data/redis.conf
redis-server ~/redis-data/redis.conf
redis-cli ping  # Should return PONG


Backend Setup:
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install django-cors-headers django-redis
python manage.py migrate
python manage.py runserver

Start Celery in a separate terminal:
cd backend
source venv/bin/activate
celery -A goodforgood worker --loglevel=debug



Frontend Setup:

cd frontend
npm install axios
echo "REACT_APP_API_URL=http://localhost:8000" > .env
npm start

Docker Setup (Optional):
docker-compose up --build

Testing
Backend:
cd backend
echo "ngo_id,month,people_helped,events_conducted,funds_utilized" > test.csv
echo "NGO99913,2025-03,100,5,50000.00" >> test.csv
echo "NGO99914,2025-03,200,10,100000.00" >> test.csv
echo "NGO99915,2025-03,200,10,100000.00" >> test.csv
curl -X POST http://localhost:8000/api/report -H "Content-Type: application/json" -d '{"ngo_id": "NGO7777", "month": "2025-03", "people_helped": 300, "events_conducted": 15, "funds_utilized": 150000.00}'
curl -X POST http://localhost:8000/api/reports/upload -F "file=@test.csv"
curl http://localhost:8000/api/job-status/<job_id>
curl "http://localhost:8000/api/dashboard?month=2025-03"

Frontend: Open http://localhost:3000 and test all features (Submit Report, Bulk Upload, Dashboard).



Logs: Check backend/debug.log for Celery task issues.



Debug Redis: redis-cli KEYS job_*, redis-cli GET job_<job_id>, redis-cli monitor.





The app uses Django with Celery for scalable CSV processing and PostgreSQL for data integrity with unique constraints on (ngo_id, month). The React frontend uses Tailwind CSS and Axios. Fixed issues include Redis MISCONF error, Django 404 error, bulk upload EncodeError, frontend submission errors, stuck processing status, curl file path errors, Celery task execution failures, duplicate entry errors, multiple Redis instances, and Redis config errors by using an absolute dir path in redis.conf, ensuring a single Redis instance, retrying cache reads, and enhancing frontend error handling. Future improvements include retry logic, authentication, and observability tools.


## Step 9: Optional Docker Setup

Ensure `docker-compose.yml` is as provided in the previous artifact (version `78009d20-2fbc-43f5-8ca9-0430eed69dd7`):
```bash
cd goodforgood
cat docker-compose.yml

Run Docker:
docker-compose up --build



Writeup 

The GOODFORGOOD NGO Reporting System is a scalable web app using Django, React, and PostgreSQL. The backend leverages Django REST Framework for APIs and Celery with Redis for asynchronous CSV processing. PostgreSQL enforces idempotency with unique constraints on (ngo_id, month). The React frontend, styled with Tailwind CSS, provides a user-friendly interface for report submission, bulk uploads, and dashboard viewing.

The bulk upload issue (stuck at processing (0/0 rows processed)) was resolved by fixing a Redis configuration error where dir ~/redis-data/ caused a No such file or directory error. We used an absolute path (/Users/tusharpandole/redis-data/), disabled Homebrew’s Redis service, and ensured a single Redis instance at redis://127.0.0.1:6379/0. The job-status endpoint retries cache retrieval, and the frontend was updated with explicit Redis error messages. Previous issues (Redis MISCONF, Django 404, bulk upload EncodeError, frontend submission errors, curl file path errors, task execution failures, duplicate entries, multiple Redis instances) were fixed by configuring Redis, correcting URLs, saving CSV files temporarily, adding CORS, ensuring task registration, using unique ngo_id values, and handling directory case-sensitivity.

AI tools (e.g., GitHub Copilot) assisted in generating boilerplate code, with manual refinements for validation and error handling. Future improvements include retry logic for failed CSV rows, admin authentication, and an OpenAPI spec. Production enhancements would add structured logging (e.g., structlog), metrics (e.g., Prometheus), and CI/CD pipelines. Deployment on Render/Vercel requires CORS configuration.

This solution meets the assignment requirements, providing a functional, scalable system with clear setup and testing instructions.