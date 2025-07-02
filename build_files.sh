#!/bin/bash
cd backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
cd ../frontend
npm install
npm run build