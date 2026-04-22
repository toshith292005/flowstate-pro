Write-Host "Building frontend image..."
docker build -t toshith2005/flowstate-frontend:latest ./client

Write-Host "Building backend image..."
docker build -t toshith2005/flowstate-backend:latest ./server

Write-Host "Pushing frontend image to Docker Hub..."
docker push toshith2005/flowstate-frontend:latest

Write-Host "Pushing backend image to Docker Hub..."
docker push toshith2005/flowstate-backend:latest

Write-Host "Deployment complete."
