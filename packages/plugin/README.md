# Fluxer Plugin Framework

A modular plugin system for Fluxer that supports client, server, and platform-wide plugins.

## Architecture

The plugin framework consists of:

- **Core Package** (`@fluxer/plugin`): Core plugin system with types, registry, hooks, and lifecycle management
- **Client Manager** (`fluxer_app/src/lib/plugins`): Client-side plugin management
- **Server Manager** (`fluxer_server/src/lib/plugins`): Server-side plugin management

## Plugin Structure

A plugin consists of:

```
plugin-name/
├── manifest.json    # Plugin manifest
├── index.ts          # Main plugin code
└── assets/           # Optional assets (css, js, locales)
```

## Plugin Manifest

```json
{
  "id": "plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Author Name",
  "license": "AGPL-3.0-or-later",
  "main": "index.ts",
  "target": "client|server|both",
  "permissions": [],
  "hooks": {
    "onLoad": "onLoad",
    "onUnload": "onUnload",
    "onEnable": "onEnable",
    "onDisable": "onDisable"
  }
}
```

## Available Hooks

### Lifecycle Hooks
- `onLoad`: Called when plugin is loaded
- `onUnload`: Called when plugin is unloaded
- `onEnable`: Called when plugin is enabled
- `onDisable`: Called when plugin is disabled

### Client Hooks
- `onMessageCreate`: Called when a message is created
- `onMessageUpdate`: Called when a message is updated
- `onMessageDelete`: Called when a message is deleted
- `onChannelCreate`: Called when a channel is created
- `onChannelUpdate`: Called when a channel is updated
- `onChannelDelete`: Called when a channel is deleted

### Server Hooks
- `onRequest`: Called when a request is received
- `onResponse`: Called when a response is sent
- `onError`: Called when an error occurs

## Usage

### Client-Side

```typescript
import {clientPluginManager} from './lib/plugins/PluginManager';

// Initialize plugin manager
await clientPluginManager.initialize();

// Load a plugin
await clientPluginManager.registerPlugin(manifest);

// Enable a plugin
await clientPluginManager.enablePlugin('plugin-id');

// Disable a plugin
await clientPluginManager.disablePlugin('plugin-id');
```

### Server-Side

```typescript
import {serverPluginManager} from './lib/plugins/PluginManager';

// Initialize plugin manager
await serverPluginManager.initialize();

// Load a plugin
await serverPluginManager.registerPlugin(manifest);

// Execute a hook
await serverPluginManager.executeHook('onRequest', request);
```

## Plugin API

Plugins receive a context object with the following API:

```typescript
{
  pluginId: string;
  pluginVersion: string;
  target: 'client' | 'server' | 'both';
  config: Record<string, unknown>;
  api: {
    registerHook: (hookName: string, handler: Function) => void;
    unregisterHook: (hookName: string, handler: Function) => void;
    emitEvent: (eventName: string, data: unknown) => void;
    onEvent: (eventName: string, handler: Function) => void;
    getConfig: () => Record<string, unknown>;
    setConfig: (config: Record<string, unknown>) => void;
  };
}
```

## Example Plugin

See `plugins/example-plugin/` for a complete example.
