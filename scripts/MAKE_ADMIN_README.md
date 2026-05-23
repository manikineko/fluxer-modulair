# Make Admin Script

This script allows you to grant admin privileges to a user by setting their ACLs (Access Control Lists).

## Usage

### Via npm script

```bash
pnpm make-admin [options]
```

### Direct execution

```bash
npx tsx scripts/make_admin.ts [options]
```

## Options

- `-u, --user-id <id>` - User ID to make admin
- `-e, --email <email>` - User email to make admin
- `-a, --acls <acls>` - Comma-separated list of ACLs to grant (default: `admin:authenticate`)
- `-w, --wildcard` - Grant wildcard ACL (`*`) for full admin access
- `--api-url <url>` - API endpoint URL (default: `http://localhost:49319/api`)
- `--api-key <key>` - Admin API key for authentication (required for production)
- `-h, --help` - Show help message

## Examples

### Make user with email an admin (requires test mode)

```bash
pnpm make-admin --email admin@example.com
```

### Make user with ID a full admin with wildcard

```bash
pnpm make-admin --user-id 123456789 --wildcard
```

### Make user with specific ACLs using API key

```bash
pnpm make-admin --email admin@example.com --acls "admin:authenticate,user:lookup,guild:lookup" --api-key your-api-key
```

### Use custom API endpoint

```bash
pnpm make-admin --email admin@example.com --api-url https://api.example.com/api
```

## How it works

The script uses one of two methods to set ACLs:

1. **Test Harness Mode** (default): Uses the `/test/users/:userId/acls` endpoint. This requires test mode to be enabled on the server.

2. **Admin API Mode**: Uses the `/admin/users/set-acls` endpoint with an admin API key. This is the recommended method for production environments.

## Common ACLs

Here are some common ACLs you might want to grant:

- `admin:authenticate` - Basic admin authentication
- `user:lookup` - Ability to lookup users
- `guild:lookup` - Ability to lookup guilds
- `audit_log:view` - Ability to view audit logs
- `admin_api_key:manage` - Ability to manage admin API keys
- `*` - Wildcard (full admin access)

For a complete list of available ACLs, see `packages/constants/src/AdminACLs.tsx`.

## Requirements

- The Fluxer server must be running
- Either test mode enabled OR a valid admin API key
- For email lookup, the server must support user lookup by email

## Notes

- If using email lookup and it fails, provide the user ID directly with `--user-id`
- The script will fail if neither test mode nor an API key is available
- Changes are logged in the admin audit log
