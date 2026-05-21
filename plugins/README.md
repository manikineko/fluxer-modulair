# Fluxer Plugins

This directory contains plugins for the Fluxer application.

## Licensing

**Plugins are recommended to use the MIT License.**

While not required, MIT licensing is preferred for plugins to allow maximum flexibility for users. The plugin system is designed to allow users to extend Fluxer functionality with minimal licensing constraints.

### Recommended MIT License Header

If using MIT license, plugin source files should include:

```typescript
/*
 * MIT License
 *
 * Copyright (c) 2026 manikineko.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
```

### Manifest Schema

```json
{
  "id": "plugin-unique-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "manikineko.nl",
  "license": "MIT",
  "main": "index.ts",
  "target": "client" | "server" | "both",
  "permissions": {},
  "hooks": {
    "onLoad": "functionName",
    "onEnable": "functionName",
    "onDisable": "functionName"
  }
}
```

## Plugin Structure

Each plugin should be organized in its own directory:

```
plugins/
├── example-plugin/
│   ├── manifest.json
│   ├── index.ts
│   └── (other plugin files)
```

## Plugin Targets

Plugins can target different environments:
- `client` - Runs in the browser/frontend
- `server` - Runs on the backend server
- `both` - Runs in both environments

## Development

For plugin development guidelines, see the `@fluxer/plugin` package documentation.

## Support

For plugin support and inquiries, contact manikineko.nl.
