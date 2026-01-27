#!/usr/bin/env bash

# run-tests.sh

# ============

# Quick script để kiểm tra TypeScript compilation và validate module

set -e

echo "📦 Checking file-transfer module compilation..."
cd /Users/yuu/Documents/CONG_TY/metanode-dapp/apps/chat

# Check TypeScript

npx tsc --noEmit

echo ""
echo "✅ COMPILATION SUCCESSFUL"
echo ""
echo "📋 Module Structure:"
find src/modules/file-transfer -type f -name "\*.ts" | sort
echo ""
echo "✅ file-transfer module ready to use!"
