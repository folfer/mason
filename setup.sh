#!/usr/bin/env bash
set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[+]${NC} $*"; }
warn()    { echo -e "${YELLOW}[!]${NC} $*"; }
section() { echo -e "\n${YELLOW}━━━ $* ━━━${NC}"; }

# ─── Root check ──────────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo -e "${RED}[✗]${NC} Execute como root: sudo bash setup.sh"
  exit 1
fi

section "Atualizando pacotes"
apt-get update -qq && apt-get upgrade -y -qq

# ─── Git ─────────────────────────────────────────────────────────────────────
section "Git"
apt-get install -y -qq git
info "git $(git --version | awk '{print $3}')"

# ─── Node.js 22 LTS + npm ─────────────────────────────────────────────────────
section "Node.js 22 LTS + npm"
if command -v node &>/dev/null; then
  warn "Node já instalado: $(node -v) — pulando"
else
  apt-get install -y -qq curl ca-certificates
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - &>/dev/null
  apt-get install -y -qq nodejs
  info "node $(node -v) | npm $(npm -v)"
fi

# ─── pnpm ────────────────────────────────────────────────────────────────────
section "pnpm"
if ! command -v pnpm &>/dev/null; then
  npm install -g pnpm --silent
fi
info "pnpm $(pnpm -v)"

# ─── Docker Engine ───────────────────────────────────────────────────────────
section "Docker Engine"
if command -v docker &>/dev/null; then
  warn "Docker já instalado: $(docker -v) — pulando"
else
  apt-get install -y -qq ca-certificates curl gnupg lsb-release

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io
  systemctl enable --now docker

  info "docker $(docker -v)"
fi

# ─── Docker Compose v2 ───────────────────────────────────────────────────────
section "Docker Compose v2"
if docker compose version &>/dev/null 2>&1; then
  warn "Docker Compose já disponível: $(docker compose version) — pulando"
else
  COMPOSE_VERSION=$(curl -fsSL https://api.github.com/repos/docker/compose/releases/latest \
    | grep '"tag_name"' | sed 's/.*"tag_name": "\(.*\)".*/\1/')
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL \
    "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  info "$(docker compose version)"
fi

# ─── Adicionar usuário atual ao grupo docker ─────────────────────────────────
if [[ -n "${SUDO_USER:-}" ]]; then
  usermod -aG docker "$SUDO_USER"
  warn "Usuário '$SUDO_USER' adicionado ao grupo docker. Faça logout/login para ativar."
fi

# ─── Resumo ──────────────────────────────────────────────────────────────────
section "Tudo instalado"
echo -e "  git        $(git --version | awk '{print $3}')"
echo -e "  node       $(node -v)"
echo -e "  npm        $(npm -v)"
echo -e "  pnpm       $(pnpm -v)"
echo -e "  docker     $(docker -v | awk '{print $3}' | tr -d ',')"
echo -e "  compose    $(docker compose version | awk '{print $4}')"
