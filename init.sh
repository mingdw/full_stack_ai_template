#!/bin/bash
set -e

echo "=== Harness 初始化 ==="

echo "=== npm install ==="
npm install

echo "=== npm run check ==="
npm run check

echo "=== npm test ==="
npm test

echo "=== npm run build ==="
npm run build

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. 阅读 feature_list.json，查看当前功能状态"
echo "2. 只选一个未完成功能开始工作"
echo "3. 只实现该功能"
echo "4. 声称完成前重新跑验证"
