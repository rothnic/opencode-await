#!/bin/bash
# Benchmark script that simulates a long-running build/deployment
# - Random duration (15-45 seconds)
# - Generates verbose log output
# - Random success/failure (80% success rate)

DURATION=$((15 + RANDOM % 31))
SUCCESS=$((RANDOM % 10))

echo "Starting deployment process..."
echo "Build ID: $(date +%s)"
echo "Environment: production"
echo "---"

for i in $(seq 1 $DURATION); do
  STEP=$((i % 5))
  case $STEP in
    0) echo "[$(date +%H:%M:%S)] Compiling TypeScript files... (${i}/${DURATION})" ;;
    1) echo "[$(date +%H:%M:%S)] Bundling assets... chunk_${RANDOM}.js" ;;
    2) echo "[$(date +%H:%M:%S)] Optimizing images... image_${RANDOM}.png processed" ;;
    3) echo "[$(date +%H:%M:%S)] Running tests... test_${RANDOM} passed" ;;
    4) echo "[$(date +%H:%M:%S)] Uploading to CDN... ${RANDOM} bytes transferred" ;;
  esac
  
  if [ $((RANDOM % 20)) -eq 0 ]; then
    echo "[$(date +%H:%M:%S)] WARNING: Retry needed for chunk_${RANDOM}"
  fi
  
  sleep 1
done

echo "---"
echo "Build completed in ${DURATION} seconds"

if [ $SUCCESS -lt 8 ]; then
  echo "✓ Deployment successful"
  echo "URL: https://example.com/build-$(date +%s)"
  exit 0
else
  echo "✗ Deployment failed: Connection timeout to CDN"
  echo "Error code: E_CDN_TIMEOUT"
  exit 1
fi
