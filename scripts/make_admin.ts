#!/usr/bin/env node

/*
 * Copyright (C) 2026 Fluxer Contributors
 *
 * This file is part of Fluxer.
 *
 * Fluxer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Fluxer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Fluxer. If not, see <https://www.gnu.org/licenses/>.
 */

import {readFileSync} from 'fs';
import {join} from 'path';

const REPO_ROOT = join(__dirname, '..');

interface MakeAdminOptions {
	userId?: string;
	email?: string;
	acls?: string[];
	apiUrl?: string;
	apiKey?: string;
	wildcard?: boolean;
}

function parseArgs(): MakeAdminOptions {
	const args = process.argv.slice(2);
	const options: MakeAdminOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case '--user-id':
			case '-u':
				options.userId = args[++i];
				break;
			case '--email':
			case '-e':
				options.email = args[++i];
				break;
			case '--acls':
			case '-a':
				options.acls = args[++i].split(',');
				break;
			case '--api-url':
				options.apiUrl = args[++i];
				break;
			case '--api-key':
				options.apiKey = args[++i];
				break;
			case '--wildcard':
			case '-w':
				options.wildcard = true;
				break;
			case '--help':
			case '-h':
				printHelp();
				process.exit(0);
			default:
				console.error(`Unknown option: ${arg}`);
				printHelp();
				process.exit(1);
		}
	}

	if (!options.userId && !options.email) {
		console.error('Error: Either --user-id or --email must be provided');
		printHelp();
		process.exit(1);
	}

	return options;
}

function printHelp() {
	console.log(`
Usage: make_admin.ts [options]

Options:
  -u, --user-id <id>        User ID to make admin
  -e, --email <email>       User email to make admin
  -a, --acls <acls>         Comma-separated list of ACLs to grant (default: admin:authenticate)
  -w, --wildcard            Grant wildcard ACL (*) for full admin access
  --api-url <url>           API endpoint URL (default: http://localhost:49319/api)
  --api-key <key>           Admin API key for authentication (required for production)
  -h, --help                Show this help message

Examples:
  # Make user with email admin@example.com an admin with basic auth (requires test mode)
  make_admin.ts --email admin@example.com

  # Make user with ID 123456789 a full admin with wildcard
  make_admin.ts --user-id 123456789 --wildcard

  # Make user with specific ACLs using API key
  make_admin.ts --email admin@example.com --acls "admin:authenticate,user:lookup,guild:lookup" --api-key your-api-key

  # Use custom API endpoint
  make_admin.ts --email admin@example.com --api-url https://api.example.com/api

Note: This script requires either:
  1. Test mode enabled on the server (uses /test/users/:userId/acls endpoint)
  2. A valid admin API key (uses /admin/users/set-acls endpoint)
`);
}

function getAcls(options: MakeAdminOptions): string[] {
	if (options.wildcard) {
		return ['*'];
	}
	if (options.acls && options.acls.length > 0) {
		return options.acls;
	}
	return ['admin:authenticate'];
}

async function lookupUserIdByEmail(email: string, apiUrl: string): Promise<string> {
	// First try admin API lookup
	try {
		const response = await fetch(`${apiUrl}/admin/users/lookup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({email}),
		});

		if (response.ok) {
			const data = await response.json();
			if (data.user && data.user.id) {
				return data.user.id;
			}
		}
	} catch (error) {
		// Continue to test harness
	}

	// Fall back to test harness if available
	const response = await fetch(`${apiUrl}/test/users/lookup-by-email`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({email}),
	});

	if (!response.ok) {
		throw new Error(`Failed to lookup user by email: ${response.statusText}. Please provide --user-id instead.`);
	}

	const data = await response.json();
	if (!data.user_id) {
		throw new Error(`No user found with email: ${email}`);
	}

	return data.user_id;
}

async function setUserAclsViaTestHarness(userId: string, acls: string[], apiUrl: string): Promise<void> {
	const response = await fetch(`${apiUrl}/test/users/${userId}/acls`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({acls}),
	});

	if (!response.ok) {
		throw new Error(`Failed to set ACLs: ${response.statusText}`);
	}
}

async function setUserAclsViaAdminApi(userId: string, acls: string[], apiUrl: string, apiKey: string): Promise<void> {
	const response = await fetch(`${apiUrl}/admin/users/set-acls`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			user_id: userId,
			acls,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to set ACLs: ${response.statusText} - ${error}`);
	}
}

async function main() {
	const options = parseArgs();
	const apiUrl = options.apiUrl || 'http://localhost:49319/api';
	const acls = getAcls(options);

	try {
		let userId: string;

		if (options.userId) {
			userId = options.userId;
			console.log(`Using provided user ID: ${userId}`);
		} else if (options.email) {
			console.log(`Looking up user by email: ${options.email}`);
			userId = await lookupUserIdByEmail(options.email, apiUrl);
			console.log(`Found user ID: ${userId}`);
		} else {
			throw new Error('Either --user-id or --email must be provided');
		}

		console.log(`Setting ACLs: ${acls.join(', ')}`);

		if (options.apiKey) {
			console.log('Using Admin API endpoint');
			await setUserAclsViaAdminApi(userId, acls, apiUrl, options.apiKey);
		} else {
			console.log('Using Test Harness endpoint (requires test mode enabled)');
			await setUserAclsViaTestHarness(userId, acls, apiUrl);
		}

		console.log(`\n✓ Successfully updated ACLs for user ID: ${userId}`);
	} catch (error) {
		console.error('Error:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();
