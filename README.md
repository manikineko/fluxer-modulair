# Fluxer World

**Fluxer World** is an independent public community instance powered by the open-source Fluxer platform.

🌐 Website: [fluxer.world](https://fluxer.world)  
💬 Join the instance: [Join Fluxer World](https://fluxer.world)  
📦 GitHub Organization: [fluxerworld](https://github.com/fluxerworld)

> ⚠️ **Disclaimer:**  
> Fluxer World is **not the official Fluxer platform** and is **not affiliated with the Fluxer project**.  
> This is a community-run instance built using the open source Fluxer software.

---

# What is Fluxer World?

Fluxer World exists to provide a stable public Fluxer instance with **polished clients and reliable infrastructure**.

Our goal is to make Fluxer easy to use by providing:

- Stable desktop clients
- Android and iOS mobile apps
- Linux builds for multiple distributions
- A clean and simple web interface

---

# Clients

Fluxer World provides clients for multiple platforms:

- Windows  
- macOS  
- Linux 
- Android  
- iOS

Downloads are available on the website:

➡️ **[Download Clients](https://fluxer.world)**

---

# Self Hosting Fluxer

Fluxer is fully open source and can be self hosted.

## Quick Start with Docker Compose

The easiest way to get started is using the simplified setup script:

```bash
# Clone the repository
git clone https://github.com/fluxerworld/fluxerworld.git
cd fluxerworld

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

Pull the Fluxer World server image from either registry:

```bash
# GitHub Container Registry
docker pull ghcr.io/fluxerworld/fluxer-server:stable

# Docker Hub
docker pull fluxerworld/fluxer-server:stable
```

## Getting Started

For a full step-by-step guide on deploying your own instance:

📘 **[Fluxer Self-Hosting Guide](https://fluxer.world/selfhost.html)**

---

# Contributing

Contributions are welcome.

You can help by:

- Reporting bugs  
- Suggesting features  
- Testing clients  
- Improving documentation  
- Contributing code  

➡️ **[Contribute on GitHub](https://github.com/fluxerworld)**

---

# Donations

Running a public instance requires servers, storage, and bandwidth.

If you would like to support Fluxer World you can donate here:

💖 **[Donate via PayPal](https://paypal.me/fluxerworld)**

All donations go toward server and infrastructure costs.

---

# Roadmap

Planned improvements include:

- Improved client polish
- Better search functionality
- Fixing DM and role issues
- Expanded mobile support
- Additional Linux packaging (Flatpak, tar.gz, Arch PKGBUILD)

---

# License

Fluxer World runs on the open-source Fluxer platform.

Please refer to the upstream Fluxer project for licensing details.
