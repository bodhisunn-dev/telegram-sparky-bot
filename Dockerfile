FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY telethon-sync/requirements.txt telethon-sync/
RUN cd telethon-sync && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY telethon-sync/ telethon-sync/

# Run the periodic sync
CMD ["python3", "telethon-sync/run_periodic.py"]
