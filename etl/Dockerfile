FROM python:3.11-slim

WORKDIR /usr/src/app

# Variables de ambiente pro Python não escrever bytecode .pyc e não bufferizar stdout
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instala ferramentas base do sistema (gcc pode ser usado para compilar certas libs pip)
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip
# In case it doesn't exist yet, ignore error or create dummy
RUN if [ -f "requirements.txt" ]; then pip install -r requirements.txt; fi

COPY . .

# Na produção rodaríamos o Celery Worker
# CMD ["celery", "-A", "tasks", "worker", "--loglevel=INFO"]
CMD ["python", "main.py"]
