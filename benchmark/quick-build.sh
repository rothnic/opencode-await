#!/bin/bash
# Quick build simulation - 20 seconds with verbose output
# Used for multi-command benchmark to show context accumulation

DURATION=${1:-20}
BUILD_NAME=${2:-build}

echo "=== ${BUILD_NAME} starting ==="
echo "Timestamp: $(date -Iseconds)"

for i in $(seq 1 $DURATION); do
    echo "[$(date +%H:%M:%S)] ${BUILD_NAME}: Processing step ${i}/${DURATION}... chunk_${RANDOM}.js (${RANDOM}KB)"
    if [ $((RANDOM % 10)) -eq 0 ]; then
        echo "[$(date +%H:%M:%S)] ⚠️  WARNING: Retry needed for ${BUILD_NAME}"
    fi
    sleep 1
done

echo "=== ${BUILD_NAME} completed in ${DURATION}s ==="
exit 0
