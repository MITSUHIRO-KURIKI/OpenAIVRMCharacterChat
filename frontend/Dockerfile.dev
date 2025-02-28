# Dockerイメージを指定
FROM node:23.3.0-slim

# docker-compose.yml で指定した environment_name を設定
ARG environment_name
ENV environment=$environment_name

# ホストの作業ディレクトリをコンテナからマウント / 依存関係をインストール
WORKDIR /frontend
COPY package.json yarn.lock ./
RUN apt-get update \
    && apt-get install -y --no-install-recommends tree \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN yarn install --frozen-lockfile
# ソースコード全体をコピー
COPY . .

# ホスト設定を外部アクセス可能に設定
ENV HOST 0.0.0.0