🚀 API Monitoring & Synthetic Observability Platform

A full-stack monitoring platform that helps users track the health, uptime, and performance of APIs using Synthetic Monitoring, Heartbeat Monitoring, and real-time metrics.

📌 Overview

This project enables developers to monitor their services proactively by simulating real-world API usage and tracking system availability.

It helps in:

• Detecting failures early
• Monitoring uptime
• Measuring performance metrics
• Ensuring system reliability

⚙️ Features :
🔁 Synthetic Monitoring :
• Multi-step API workflow execution
• Supports headers, body, query params
• Dynamic variable extraction and reuse
• Response validation (status + data)

❤️ Heartbeat Monitoring :
• Unique heartbeat URL for each service
• Marks service DOWN if heartbeat is missed
• Ideal for cron jobs and background workers

📡 Uptime Monitoring :
• Continuous API health checks
• Tracks UP / DOWN status
• Stores monitoring history

📊 Performance Metrics :
• Response time tracking
• Latency measurement
• Status code analysis
• Packet loss detection

🔐 Authentication :
• Secure login/signup
• JWT-based authentication

📄 Pagination & Optimization :
• Efficient monitor listing
• Scalable backend queries

🏗️ Tech Stack :
Backend
• Go
• Gin
• PostgreSQL
• Prisma

Frontend :
• Next.js
• Tailwind CSS
• Axios
• Networking
• HTTP Client
• Ping / Latency checks
• Gorilla

🧠 Core Concepts :
• Synthetic Monitoring Engine
• API Request Chaining
• Observability & Reliability Engineering
• Timeout & Retry Mechanisms 

🔄 How It Works :
• Synthetic Monitoring
• User defines multiple API steps
• Each step executes sequentially
• Variables are passed between steps
• Responses are validated
• Final status is marked (UP/DOWN)
• Heartbeat Monitoring
• System generates a unique URL
• Service sends periodic requests
• If missed → system marked DOWN

👨‍💻 Author

Rishav Sanjan
MCA @ NIT Bhopal

If you found this project helpful, give it a ⭐ on GitHub!
