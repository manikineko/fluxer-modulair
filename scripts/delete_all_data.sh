#!/bin/bash

# Delete all Fluxer data - WARNING: This is destructive!
# This script removes all Docker volumes, MinIO buckets, and database data

set -e

cd "$(dirname "$0")/.."

echo "WARNING: This will delete ALL Fluxer data including:"
echo "  - Docker volumes"
echo "  - MinIO buckets"
echo "  - Database data"
echo "  - Redis data"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo "Stopping all containers..."
docker compose down

echo "Removing Docker volumes..."
docker volume rm fluxer-modulair_minio_data 2>/dev/null || true
docker volume rm fluxer-modulair_postgres_data 2>/dev/null || true
docker volume rm fluxer-modulair_valkey_data 2>/dev/null || true
docker volume rm fluxer-modulair_nats_data 2>/dev/null || true

echo "Deleting MinIO buckets..."
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 rb s3://proxcord --force 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 rb s3://proxcord-uploads --force 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 rb s3://proxcord-downloads --force 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 rb s3://proxcord-reports --force 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 rb s3://proxcord-harvests --force 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 rb s3://proxcord-static --force 2>/dev/null || true

echo "Starting containers..."
docker compose up -d

echo "Waiting for MinIO to be ready..."
sleep 10

echo "Recreating buckets..."
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 mb s3://proxcord 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 mb s3://proxcord-uploads 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 mb s3://proxcord-downloads 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 mb s3://proxcord-reports 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 mb s3://proxcord-harvests 2>/dev/null || true
aws --profile minio --endpoint-url http://mail.manikineko.nl:9000 s3 mb s3://proxcord-static 2>/dev/null || true

echo "All data deleted and services restarted."
