# Ping

Ping is a lightweight, proactive uptime monitoring tool designed to track website availability and send instant alerts when services drop.

## Core Features
- **60+ Second Checks:** High-frequency polling to detect downtime instantly.
- **Instant Email Alerts:** Notifies you the exact moment your application goes down.
- **Performance Graphing:** Tracks latency trends and performance dips over time.
- **Public Status Pages:** Let your users view your historical uptime transparently.
- **TCP Monitoring:** Monitor raw ports, databases, and custom network protocols beyond standard HTTP.

## The Stack
- **Frontend:** React with CSS Modules
- **Design:** Custom dark-theme framework using Syne and DM Mono typography
- **Backend (Next Steps):** Planning to use Node.js, Redis for task queues, and a database to store user nodes.

## How to Run it Locally

1. Clone this repo to your machine
2. Open your terminal in the project folder and run:
   npm install
3. Once the dependencies finish installing, start the server with:
   npm run dev