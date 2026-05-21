# Changelog

## [Unreleased]

### Added
- **New Packages**
  - `packages/atproto` - ATProtocol integration package
  - `packages/discord` - Discord compatibility layer
  - `packages/payment` - Payment processing integration
  - `packages/plugin` - Plugin system core package
  
- **New Admin Pages**
  - Badges management page (`packages/admin/src/pages/BadgesPage.tsx`)
  - Partners management page (`packages/admin/src/pages/PartnersPage.tsx`)
  - Plugins management page (`packages/admin/src/pages/PluginsPage.tsx`)
  - New API clients for Badges, Partners, and Plugins (`packages/admin/src/api/`)

- **New API Endpoints**
  - ATProtocol endpoints (`packages/api/src/atproto/`)
  - Badges system (`packages/api/src/badges/`)
  - Partners system (`packages/api/src/partners/`)
  - PayPal integration (`packages/api/src/paypal/`)
  - Plugin system (`packages/api/src/plugin/`)
  - Polar payment integration (`packages/api/src/polar/`)
  - System bot (`packages/api/src/system_bot/`)

- **Plugin System**
  - Plugin middleware (`packages/api/src/middleware/PluginMiddleware.tsx`)
  - Plugin UI components in fluxer_app
  - Plugin tab in settings (`fluxer_app/src/components/modals/tabs/PluginsTab.tsx`)
  - 24+ plugins in `plugins/` directory including:
    - Bluesky integration
    - Discord compatibility (activities, decos, emojis, presence, profile, soundboard, voice)
    - Forum channel
    - Stage channel
    - Announcement channel
    - ATProto PDS
    - IPFS storage
    - S3 storage
    - Slash commands
    - SSR rendering
    - And many more

- **Mobile App Support**
  - Android configuration (`fluxer_app/android/`)
  - iOS configuration (`fluxer_app/ios/`)
  - Capacitor setup (`fluxer_app/capacitor.config.json`)
  - Mobile setup documentation (`fluxer_app/MOBILE_SETUP.md`)
  - Dockerfile for app container

- **Channel Type Views**
  - Announcement channel view
  - Bluesky feed channel view
  - Forum channel view
  - Stage channel view
  - Text channel view
  - Voice channel view
  - SSR rendering support
  - Plugin error boundary
  - Lazy plugin component loading

- **Kubernetes Deployment**
  - K8s manifests for various services (`k8s/`)
  - Cassandra, Discord service, ATProto service configs

- **Configuration**
  - Admin config (`config/admin-config.json`)
  - Environment example (`.env.example`)
  - Simple docker compose (`docker-compose.simple.yaml`)
  - Nginx configuration (`nginx.conf`)
  - Setup script (`setup.sh`)

- **Infrastructure**
  - Data directory structure (`data/`)
  - Fluxer-modulair submodule

### Modified
- **fluxer_app**
  - Major refactoring of ChannelChatLayout (+1221 lines)
  - Enhanced channel components (ChannelHeader, ChannelIndexPage, ChannelTextarea, Message)
  - Updated layout components (GuildsLayout, ChannelOrganization)
  - Improved modal components and settings
  - Enhanced user profile popout
  - Updated context menus (ChannelContextMenu, GuildContextMenu)
  - Added plugin UI hooks and components
  - Updated routing and utilities
  - Added Rust crate (libfluxcore) for core functionality
  - Updated build configuration (rspack.config.mjs)

- **fluxer_admin**
  - Updated Dockerfile
  - Enhanced configuration
  - Improved navigation and layout
  - Updated auth and system routes

- **fluxer_server**
  - Updated Dockerfile (added minimal variant)
  - Enhanced service initialization
  - Updated routing and gateway proxy
  - Added library utilities

- **packages/api**
  - Major package.json updates (+362 lines)
  - Enhanced admin controllers (Search, User)
  - Improved auth services (login, registration)
  - Updated OAuth2 and application repositories
  - Enhanced guild emoji and sticker controllers
  - Improved middleware pipeline
  - Updated user models and controllers
  - Enhanced channel constants and validators

- **packages/admin**
  - Improved API client
  - Enhanced layout component
  - Updated navigation

- **packages/config**
  - Updated admin service schema

- **packages/constants**
  - Updated Admin ACLs
  - Enhanced Channel and User constants

- **packages/media_proxy**
  - Improved image controller
  - Enhanced NSFW detection service

- **packages/schema**
  - Updated channel request schemas
  - Enhanced channel validators

- **Configuration Files**
  - Updated README.md with self-hosting guide
  - Enhanced docker compose configurations
  - Updated config templates (dev, production, test)
  - Updated devenv.lock
  - Updated root package.json

### Infrastructure Changes
- Updated git submodules (.gitmodules)
- Updated fluxer_static submodule
- Updated pnpm-lock.yaml with new dependencies

### Statistics
- 85 files changed
- 5,844 insertions(+)
- 4,151 deletions(-)
