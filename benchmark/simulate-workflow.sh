#!/bin/bash
# Simulates a long-running CI/CD workflow (like GitHub Actions or Docker build)
# Fixed 180-second duration to exceed typical bash timeouts
# Generates verbose output (~500 lines) to demonstrate context pollution

set -e

DURATION=${1:-180}
FAIL_MODE=${2:-success}

echo "======================================"
echo "🚀 Starting CI/CD Pipeline"
echo "======================================"
echo "Build ID: build-$(date +%s)"
echo "Started: $(date -Iseconds)"
echo "Expected duration: ~${DURATION}s"
echo ""

phase_duration=$((DURATION / 6))

run_phase() {
    local phase_name=$1
    local duration=$2
    local emoji=$3
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "${emoji} Phase: ${phase_name}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for i in $(seq 1 $duration); do
        timestamp=$(date +%H:%M:%S)
        progress=$((i * 100 / duration))
        
        case $((i % 8)) in
            0) echo "[${timestamp}] Installing dependencies... (${progress}%)" ;;
            1) echo "[${timestamp}] Resolving package versions..." ;;
            2) echo "[${timestamp}] Downloading @types/node@20.10.${RANDOM}..." ;;
            3) echo "[${timestamp}] Compiling src/module_${RANDOM}.ts..." ;;
            4) echo "[${timestamp}] Running test suite batch $((i/4 + 1))..." ;;
            5) echo "[${timestamp}] Optimizing bundle chunk_${RANDOM}.js (${RANDOM}KB)..." ;;
            6) echo "[${timestamp}] Uploading artifact layer ${i}/${duration}..." ;;
            7) echo "[${timestamp}] Verifying checksum sha256:$(openssl rand -hex 8 2>/dev/null || echo ${RANDOM}${RANDOM})..." ;;
        esac
        
        if [ $((RANDOM % 15)) -eq 0 ]; then
            echo "[${timestamp}] ⚠️  WARNING: Retrying connection to registry (attempt $((RANDOM % 3 + 1))/3)"
        fi
        
        sleep 1
    done
    
    echo "[$(date +%H:%M:%S)] ✓ ${phase_name} completed"
}

run_phase "Dependencies" $phase_duration "📦"
run_phase "Compilation" $phase_duration "🔨"
run_phase "Testing" $phase_duration "🧪"
run_phase "Building" $phase_duration "📦"
run_phase "Optimization" $phase_duration "⚡"
run_phase "Deployment" $phase_duration "🚀"

echo ""
echo "======================================"

if [ "$FAIL_MODE" = "fail" ]; then
    echo "❌ Pipeline FAILED"
    echo "Error: Deployment verification timeout"
    echo "See logs above for details"
    echo "======================================"
    exit 1
else
    echo "✅ Pipeline SUCCEEDED"
    echo "Deployed to: https://app.example.com"
    echo "Build time: ${DURATION}s"
    echo "======================================"
    exit 0
fi
