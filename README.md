# Ping
Ping is a lightweight uptime monitoring tool that tracks website and service availability and send alert when something goes down.

This application features a real-time data monitoring dashboard and is optimized primarily for desktop / PC viewports for the best experience and layour interaction.....please view the live app on a desktop browser or larger screen

## Features

- Three check types: HTTP(S),TCP port, and ICMP ping
- GET,POST,PUT support with custom headers and request bodies
- Email Alerts on downtime and recovery (had to setup 2-step verification for nodemailer before i finally made use of brevo and all very exhausting)
- Retry threshold before a monitor is marked down,to avoid false alarm from short blips
- Real-time dashboard updates via Socket.IO (stressed my life btw)
- Ping history with uptime percentage and average latency
- Pause/resume monitors without deleting them

## Known Limitations
-Checks currently run from a single server location,so a network issue on that server's end might look like a target outage.

## Stack
- Frontend:React,CSS Modules
- Backend: Node.js,Express,PostgreSQL
- Real-time:Socket.IO

## Check out the Live Demo
**(https://ping-two-orpin.vercel.app/)**

## Follow these steps to get Ping running locally on your machine.
If you want to clone the repo and run it on your machine:

### Prerequisites
* **Node.js** (v18+)
* **PostgreSQL** (v17 was used in development)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Grey001-dev/Ping.git
   cd Ping

2. **Install dependencies**
```bash
cd backend
npm install

cd ../frontend/my-react-app
npm install
```

3. **Run the program**
   ```bash
   npm run dev
   ```
## Environment Variables
Create a `.env` file in `/backend` with the following:

| Variable | Description | Example |
|----------|--------------|---------|
|`DATABASE_URL`| Postgres connection String|`postgresql://postgres:password@localhost:5432/uptime_monitor` |
| `JWT_SECRET`| Secret for signing my auth tokens | `your-secret` |
| `PORT` | My backend server port used | `5000`|
| `BREVO_API_KEY` | API key from your (https://www.brevo.com) account, I used this for sending down and recovery alert emails | `xkeysib-....` |
| `SENDER_EMAIL` | A verified sender email address in Brevo | `pingmonitors007@gmail.com` |


