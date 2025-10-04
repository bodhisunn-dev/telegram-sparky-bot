FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY telethon-sync/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY telethon-sync/ ./

# Run the periodic sync with unbuffered output for Railway logs
CMD ["python3", "-u", "run_periodic.py"]
