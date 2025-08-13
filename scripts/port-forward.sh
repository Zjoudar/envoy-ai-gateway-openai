#!/bin/bash

# Forward gateway and MCP services
kubectl port-forward -n ai-gateway svc/ai-gateway 8080:8080 &
kubectl port-forward -n mcp-namespace svc/mcp-internal-service 8000:80 &

wait