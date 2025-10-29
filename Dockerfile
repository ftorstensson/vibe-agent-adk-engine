# Use the official lightweight Python image.
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container
COPY . .

# Expose the port that the application listens on
EXPOSE 8080

# The command to run the application, matching our cloud-run.yaml
CMD ["adk", "api_server", "--host", "0.0.0.0", "--port", "8080"]