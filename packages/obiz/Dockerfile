FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN groupadd -g 1001 appuser && \
    useradd -r -u 1001 -g appuser appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

USER 1001

COPY --chown=1001:1001 config/ ./config/
COPY --chown=1001:1001 finders/ ./finders/
COPY --chown=1001:1001 parsers/ ./parsers/
COPY --chown=1001:1001 importer.py .

ENV TZ=Europe/Paris
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python3", "importer.py"]
