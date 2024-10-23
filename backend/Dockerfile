FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y nodejs npm build-essential

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY requirements.txt ./

# Install Python dependencies globally
RUN pip install --no-cache-dir -U pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]