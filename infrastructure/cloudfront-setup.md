# AWS CloudFront Auto Scaling CDN Setup

## Option 1: S3 + CloudFront (Recommended for Frontend)
Since our frontend is a static React application (built by Vite), the most scalable and cost-effective way to host it is using Amazon S3 and CloudFront.
1. Create an S3 Bucket and upload the contents of the `client/dist` folder.
2. Create a CloudFront Distribution pointing to the S3 bucket as its origin.
3. CloudFront automatically scales up to handle immense global traffic instantly.

## Option 2: CloudFront in front of Kubernetes (EKS) LoadBalancer
If you deploy the `frontend-service` (LoadBalancer) in AWS EKS:
1. EKS creates a Classic or Application Load Balancer.
2. In the AWS Console, go to CloudFront.
3. Create a Distribution and select the EKS Load Balancer DNS name as the Origin Domain.
4. Set allowed HTTP methods (`GET, HEAD, OPTIONS`).
5. Configure Cache Behavior to cache static assets aggressively, while bypassing caching for API routes.

This setup ensures that CloudFront absorbs all traffic spikes (Auto Scaling), while the Kubernetes HPA auto-scales the backend API pods based on CPU usage.
