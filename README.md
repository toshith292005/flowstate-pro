# FlowState Pro - Smart Task Management SaaS

FlowState Pro is a modern, enterprise-grade task management platform designed for high productivity. It features a sleek dark-mode interface, intelligent task tracking, and a highly scalable, self-healing backend architecture.

## 🚀 Key Features
* **Enterprise Security (MFA):** Bank-level security with Twilio Verify SMS-based Multi-Factor Authentication.
* **Stateless Authentication:** Powered by Google OAuth 2.0 and JSON Web Tokens (JWT) for secure, fast sessions.
* **Premium Subscriptions:** Integrated with Razorpay for automated SaaS subscription lifecycle management and webhooks.
* **High-Speed Caching:** Redis integration for lightning-fast data retrieval and session management.
* **Mobile-First Design:** A fully responsive UI with a native-style bottom navigation bar for mobile users.
* **Real-time Synchronization:** Instant UI updates for profile changes and task completions using event-driven architecture.
* **Dynamic Dashboard:** Advanced filtering by category, priority, and status, with automated overdue task detection.

## 🏗️ Production Architecture
This application has been upgraded from a basic serverless deployment to a robust, cloud-native Kubernetes architecture:
* **Dockerized:** Multi-stage Docker builds for minimal, secure, and production-ready images.
* **Kubernetes (K8s):** Fully orchestrated deployments with integrated `Services` and secure `Secrets` management.
* **Self-Healing:** Kubernetes `Deployment` manifests ensure 100% uptime by instantly replacing crashed containers.
* **Auto-Scaling (HPA):** Horizontal Pod Autoscalers dynamically scale from 2 up to 10 instances based on real-time CPU utilization spikes.
* **Edge Caching:** Optimized for AWS CloudFront CDN distribution.

## 🛠️ Tech Stack
* **Frontend:** React (Vite), TypeScript, Tailwind CSS, Lucide React.
* **Backend:** Node.js, Express.js, Passport.js.
* **Database & Cache:** MongoDB Atlas with Mongoose, Redis.
* **Infrastructure:** Docker, Kubernetes (EKS/Minikube), AWS CloudFront.
* **3rd Party APIs:** Google Cloud (OAuth), Twilio (SMS MFA), Razorpay (Payments).

## 💻 Local Development

1. **Install Dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Environment Variables:**
   Ensure your `server/.env` contains keys for MongoDB, Redis, Google OAuth, Twilio, and Razorpay.

3. **Run via Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

## 🚢 Kubernetes Deployment
1. Build and push your images using the provided PowerShell script:
   ```powershell
   .\deploy-docker.ps1
   ```
2. Apply the Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/
   ```
