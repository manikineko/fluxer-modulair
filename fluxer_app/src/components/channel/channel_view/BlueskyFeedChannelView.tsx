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

import {ChannelHeader} from '@app/components/channel/ChannelHeader';
import {ChannelViewScaffold} from '@app/components/channel/channel_view/ChannelViewScaffold';
import {HeartIcon, ChatCircleIcon, ArrowsClockwiseIcon, BirdIcon, ArrowClockwiseIcon, PaperPlaneTiltIcon} from '@phosphor-icons/react';
import * as MessageActionCreators from '@app/actions/MessageActionCreators';
import ChannelStore from '@app/stores/ChannelStore';
import AuthenticationStore from '@app/stores/AuthenticationStore';
import RuntimeConfigStore from '@app/stores/RuntimeConfigStore';
import {observer} from 'mobx-react-lite';
import {useState, useEffect, useRef} from 'react';
import styles from './ChannelTypeViews.module.css';

interface AtpFeedPost {
	uri: string;
	author: {did: string; handle: string; displayName?: string};
	record: {text?: string; createdAt?: string};
	likeCount: number;
	repostCount: number;
	replyCount: number;
	indexedAt: string;
}

interface BlueskyFeedChannelViewProps {
	channelId: string;
}

function timeAgo(dateStr: string): string {
	const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
	if (diff < 60) return `${diff}s`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
	return `${Math.floor(diff / 86400)}d`;
}

export const BlueskyFeedChannelView = observer(({channelId}: BlueskyFeedChannelViewProps) => {
	const channel = ChannelStore.getChannel(channelId);
	const [posts, setPosts] = useState<AtpFeedPost[]>([]);
	const [likedUris, setLikedUris] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [composeText, setComposeText] = useState('');
	const [posting, setPosting] = useState(false);
	const fetchingRef = useRef(false);

	const handlePost = async () => {
		const text = composeText.trim();
		if (!text || posting) return;
		setPosting(true);
		try {
			await MessageActionCreators.send(channelId, {content: text, nonce: Date.now().toString()});
			setComposeText('');
			setPosting(false);
			setFetchingRef_reset();
			await fetchFeed();
		} catch {
			setPosting(false);
		}
	};

	const setFetchingRef_reset = () => { fetchingRef.current = false; };

	const fetchFeed = async () => {
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		setLoading(true);
		setError(null);
		try {
			const apiBase = RuntimeConfigStore.apiEndpoint?.replace(/\/api\/?$/, '') ?? '';
			const token = AuthenticationStore.token;
			const headers: Record<string, string> = {};
			if (token) headers.Authorization = token;
			const params = new URLSearchParams({limit: '50', channel_id: channelId});
			const res = await fetch(`${apiBase}/xrpc/app.bsky.feed.getTimeline?${params}`, {headers});
			if (res.status === 404 || res.status === 502 || res.status === 503) {
				throw new Error('__SERVICE_OFFLINE__');
			}
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json() as {feed: Array<{post: AtpFeedPost}>};
			setPosts(data.feed.map((item) => item.post));
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to load feed';
			setError(msg === '__SERVICE_OFFLINE__' ? '__SERVICE_OFFLINE__' : msg);
		} finally {
			setLoading(false);
			fetchingRef.current = false;
		}
	};

	useEffect(() => {
		void fetchFeed();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [channelId]);

	const handleLike = (uri: string) => {
		setLikedUris((prev) => {
			const next = new Set(prev);
			const wasLiked = next.has(uri);
			if (wasLiked) {
				next.delete(uri);
			} else {
				next.add(uri);
			}
			setPosts((prevPosts) =>
				prevPosts.map((p) =>
					p.uri === uri ? {...p, likeCount: p.likeCount + (wasLiked ? -1 : 1)} : p,
				),
			);
			return next;
		});
	};

	const renderContent = () => {
		if (loading) {
			return (
				<div className={styles.feedEmpty}>
					<ArrowClockwiseIcon size={36} className={styles.feedEmptyIcon} />
					<span className={styles.feedEmptyText}>Loading feed…</span>
				</div>
			);
		}
		if (error) {
			const isOffline = error === '__SERVICE_OFFLINE__';
			return (
				<div className={styles.feedEmpty}>
					<BirdIcon size={48} className={styles.feedEmptyIcon} />
					<span className={styles.feedEmptyText}>
						{isOffline ? 'Bluesky service not running' : error}
					</span>
					<span className={styles.feedEmptySubtext}>
						{isOffline
							? 'The ATProto/Bluesky backend is not configured or offline. Ask your admin to enable it.'
							: 'Could not reach the Bluesky service.'}
					</span>
					{!isOffline && (
						<button type="button" className={styles.feedRefreshBtn} onClick={() => void fetchFeed()}>
							<ArrowClockwiseIcon size={14} /> Retry
						</button>
					)}
				</div>
			);
		}
		if (posts.length === 0) {
			return (
				<div className={styles.feedEmpty}>
					<BirdIcon size={48} className={styles.feedEmptyIcon} />
					<span className={styles.feedEmptyText}>No posts yet</span>
					<span className={styles.feedEmptySubtext}>
						{channel?.url ? `Feed: ${channel.url}` : 'Set a feed handle in channel settings'}
					</span>
				</div>
			);
		}
		return posts.map((post) => {
			const liked = likedUris.has(post.uri);
			const displayName = post.author.displayName ?? post.author.handle;
			const text = post.record.text ?? '';
			const when = timeAgo(post.indexedAt);
			return (
				<div key={post.uri} className={styles.feedPost}>
					<div className={styles.feedPostAvatar}>{displayName[0]?.toUpperCase() ?? '?'}</div>
					<div className={styles.feedPostBody}>
						<div className={styles.feedPostMeta}>
							<span className={styles.feedPostHandle}>{displayName}</span>
							<span className={styles.feedPostHandleSecondary}>@{post.author.handle}</span>
							<span className={styles.feedPostTime}>{when}</span>
						</div>
						<p className={styles.feedPostText}>{text}</p>
						<div className={styles.feedPostActions}>
							<span className={styles.feedAction}>
								<ChatCircleIcon size={15} />
								<span>{post.replyCount}</span>
							</span>
							<span className={styles.feedAction}>
								<ArrowsClockwiseIcon size={15} />
								<span>{post.repostCount}</span>
							</span>
							<button
								type="button"
								onClick={() => handleLike(post.uri)}
								className={liked ? styles.feedActionLiked : styles.feedAction}
							>
								<HeartIcon size={15} weight={liked ? 'fill' : 'regular'} />
								<span>{post.likeCount}</span>
							</button>
						</div>
					</div>
				</div>
			);
		});
	};

	return (
		<ChannelViewScaffold
			header={<ChannelHeader channel={channel} showMembersToggle={false} showPins={false} />}
			chatArea={
				<div className={styles.feedScroll}>
					<div className={styles.feedToolbar}>
						<span className={styles.feedToolbarTitle}>
							<BirdIcon size={16} />
							{channel?.url ? `@${channel.url}` : 'Bluesky Feed'}
						</span>
						<button type="button" className={styles.feedRefreshBtn} onClick={() => void fetchFeed()} disabled={loading}>
							<ArrowClockwiseIcon size={15} />
						</button>
					</div>
					<div className={styles.feedContent}>{renderContent()}</div>
				<div className={styles.feedCompose}>
					<textarea
						className={styles.feedComposeInput}
						value={composeText}
						onChange={(e) => setComposeText(e.target.value)}
						placeholder="Post to this feed…"
						rows={2}
						onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handlePost(); } }}
					/>
					<button
						type="button"
						className={styles.feedRefreshBtn}
						disabled={!composeText.trim() || posting}
						onClick={() => void handlePost()}
					>
						<PaperPlaneTiltIcon size={16} />
					</button>
				</div>
				</div>
			}
		/>
	);
});
