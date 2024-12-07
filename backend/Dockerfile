FROM node:20-alpine

RUN apk add --no-cache \
    bash \
    python3 \
    py3-pip \
    py3-virtualenv \
    build-base \
    gfortran \
    musl-dev \
    python3-dev \
    pkgconfig \
    meson \
    ninja \
    cython \
    py3-setuptools \
    py3-wheel

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN python3 -m venv /app/venv

RUN bash -c "source /app/venv/bin/activate && pip install --no-cache-dir -r src/requirements.txt"

EXPOSE 3000

CMD bash -c "source /app/venv/bin/activate && npm run dev"
