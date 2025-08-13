#!/bin/bash

# Port-forward Envoy admin
kubectl port-forward -n ai-gateway svc/ai-gateway 9901:9901 &

# Watch traffic
watch -n 2 '
echo "=== Active Connections ==="
curl -s localhost:9901/stats | grep "downstream_cx_active\|upstream_cx_active"

echo -e "\n=== OpenAI Requests ==="
curl -s localhost:9901/stats | grep "openai.*upstream_rq"

echo -e "\n=== MCP Requests ==="
curl -s localhost:9901/stats | grep "mcp_services.*upstream_rq"
'