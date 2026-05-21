# Fluxer Modulair

**Fluxer Modulair** is a modular, plugin-powered fork of the Fluxer platform with enhanced extensibility and mobile support.

📦 GitHub Repository: [manikineko/fluxer-modulair](https://github.com/manikineko/fluxer-modulair)

---

# What is Fluxer Modulair?

Fluxer Modulair extends the Fluxer platform with a powerful plugin system and enhanced mobile support, making it highly customizable for various use cases.

Key features include:

- **Plugin System** - Extensible architecture with 24+ built-in plugins
- **Mobile Apps** - Native Android and iOS applications via Capacitor
- **Multi-Protocol Support** - Bluesky, ATProtocol, Discord compatibility layers
- **Enhanced Admin Panel** - Badges, partners, and plugins management
- **Kubernetes Ready** - Production-grade deployment manifests
- **Modular Architecture** - Separate packages for atproto, discord, payment, and plugin systems

---

# Self Hosting Fluxer Modulair

Fluxer Modulair is fully open source and can be self hosted.

## Quick Start with Docker Compose

The easiest way to get started is using the simplified setup script:

```bash
# Clone the repository
git clone https://github.com/manikineko/fluxer-modulair.git
cd fluxer-modulair

# Run the setup script
./setup.sh
```

The setup script will:
- Check for Docker and Docker Compose
- Create configuration files from templates
- Generate necessary secrets
- Let you choose a setup profile (minimal, full, or dev)
- Start all required services

### Manual Docker Compose Setup

If you prefer manual setup:

```bash
# Copy environment template
cp .env.example .env

# Choose a profile and start services
# Minimal (core services only):
docker compose -f docker-compose.simple.yaml --profile minimal up -d

# Full (all features including search and voice):
docker compose -f docker-compose.simple.yaml --profile full up -d

# Development (with debugging enabled):
docker compose -f docker-compose.simple.yaml --profile dev up -d
```

### Access Points

Once running, access services at:
- **Fluxer App**: http://localhost:48763
- **Fluxer Admin**: http://localhost:8081
- **Static Files**: http://localhost:8082
- **MinIO Console**: http://localhost:9001 (user: minioadmin, pass: minioadmin)

### Useful Commands

```bash
# View logs
docker compose -f docker-compose.simple.yaml logs -f

# Stop all services
docker compose -f docker-compose.simple.yaml down

# Restart services
docker compose -f docker-compose.simple.yaml restart
```

## Docker Images

Pull the Fluxer Modulair server image:

```bash
docker pull ghcr.io/manikineko/fluxer-modulair:stable
```

---

# Contributing

Contributions are welcome.

You can help by:

- Reporting bugs  
- Suggesting features  
- Testing clients  
- Improving documentation  
- Contributing code  

➡️ **[Contribute on GitHub](https://github.com/manikineko/fluxer-modulair)**

---

---

# Roadmap

Planned improvements include:

- Enhanced plugin marketplace and distribution
- Improved mobile app performance and features
- Additional protocol integrations
- Enhanced admin panel features
- Better documentation and developer tools

---

# License

Fluxer Modulair is based on the open-source Fluxer platform.

Please refer to the upstream Fluxer project for licensing details.
