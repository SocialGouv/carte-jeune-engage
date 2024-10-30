FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY config/ ./config/
COPY finders/ ./finders/
COPY inputs/ ./inputs/
COPY parsers/ ./parsers/
COPY importer.py .

ENV TZ=Europe/Paris
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python3", "importer.py"]