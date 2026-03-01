# ==============================================================
#  Fincup ☕️ — Multi-Stage Dockerfile
#  Financial Market Analysis & PDF Report Generator
# ==============================================================
#
#  Stage 1: Build the React/Vite frontend
#  Stage 2: Python production image with Playwright + Chromium
#
#  Build:  docker build -t fincup .
#  Run:    docker run --env-file backend/.env -p 5173:5173 fincup
# ==============================================================


# ─────────────────────────────────────────────
#  STAGE 1 — Frontend Build (Node 20 Alpine)
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package manifests first for better layer caching
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy frontend source files
COPY frontend/*.ts frontend/*.tsx frontend/*.html frontend/*.json ./
COPY frontend/components/ ./components/
COPY frontend/services/ ./services/
COPY frontend/public/ ./public/

# Build production bundle
RUN npm run build


# ─────────────────────────────────────────────
#  STAGE 2 — Production (Python 3.11 Slim)
# ─────────────────────────────────────────────
FROM python:3.11-slim AS production

# Metadata
LABEL maintainer="Fincup Team"
LABEL description="Fincup — Financial Market Analysis & Report Generator"
LABEL version="1.0"

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# ── System Dependencies ──
# Install Node.js (needed for Vite dev server at runtime),
# plus Playwright/Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    # Playwright Chromium dependencies
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    fonts-liberation \
    libxfixes3 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x for Vite dev server
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── Python Dependencies ──
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r backend/requirements.txt

# ── Install Playwright Chromium ──
RUN playwright install chromium

# ── Copy Backend Source ──
COPY backend/fetch_data.py backend/fetch_data_v2.py backend/fetch_data_v3.py backend/fetch_data_v3_backup.py ./backend/
COPY backend/metadata.json ./backend/
COPY backend/scripts/ ./backend/scripts/
COPY backend/public/ ./backend/public/
COPY backend/opt-expiry.json ./backend/

# ── Copy Root-Level Files ──
COPY generate_pdf_report.py ./
COPY run_report.sh ./
RUN chmod +x run_report.sh

# ── Copy Frontend (source + built output) ──
# Source is needed for Vite dev server; dist is the production build
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm ci --prefer-offline --no-audit --omit=dev 2>/dev/null || npm ci --prefer-offline --no-audit

COPY frontend/*.ts frontend/*.tsx frontend/*.html frontend/*.json ./frontend/
COPY frontend/components/ ./frontend/components/
COPY frontend/services/ ./frontend/services/
COPY frontend/public/ ./frontend/public/

# Copy pre-built frontend from Stage 1
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# ── Create Directories ──
RUN mkdir -p generated_reports

# ── Expose Ports ──
# Vite dev server
EXPOSE 5173

# ── Health Check ──
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5173/ || exit 1

# ── Entrypoint ──
CMD ["bash", "run_report.sh"]
