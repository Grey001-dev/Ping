# Ping
Ping isa ligntweight uptime monitoring tool that tracks website and service availability and send alert when somehing goes down

## Features

-Three check types: HTTP(S),TCP port, and ICMP ping
-GET,POST,PUT support wiith custom headers and request bodies
-Email Alerts on downtime and recovery(had to setup 2-step verification and all very exhausting)
-Retry threshold before a monitor is marked down,to avoid false alarm from short blips;
-Real-time dashboard updates via Socket.IO (stressed my life btw)
-Ping history with uptime percentage and average latency
-Pause/resume monitors without deleting them

## Known Limitations
-Checks currently run from a single server location,so a network issue on that server's end might look like a target outage.

## Stack
-Frontend:React,CSS Modules
-Backend: Node.js,Express,PostgreSQL
-Real-time:Socket.IO
