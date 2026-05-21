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

// Bluesky Feed Channel Type Plugin
// Implements Bluesky timeline as a channel type

const BlueskyChannelPlugin = {
	id: 'bluesky-feed',
	name: 'Bluesky Feed',
	icon: '🦋',
	category: 'feed' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	lexiconSupport: {
		enabled: true,
		supportedLexicons: [
			'app.bsky.feed.post',
			'app.bsky.feed.like',
			'app.bsky.feed.repost',
			'app.bsky.graph.follow',
			'app.bsky.actor.profile',
		],
	},
};

// Export the channel type plugin definition
// This will be registered by the plugin system
export default BlueskyChannelPlugin;
