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
import {GuildChannelView} from '@app/components/channel/channel_view/GuildChannelView';
import * as MessageActionCreators from '@app/actions/MessageActionCreators';
import MessageStore from '@app/stores/MessageStore';
import ChannelStore from '@app/stores/ChannelStore';
import {useEffect, useState} from 'react';
import {
	ChatCircleIcon,
	PlusIcon,
	PushPinIcon,
	ArrowUpIcon,
	HashIcon,
	ArrowLeftIcon,
} from '@phosphor-icons/react';
import {observer} from 'mobx-react-lite';
import styles from './ChannelTypeViews.module.css';

interface ForumChannelViewProps {
	channelId: string;
}

interface ThreadEntry {
	id: string;
	title: string;
	author: string;
	preview: string;
	replyCount: number;
	pinned: boolean;
	tags: string[];
	timestamp: string;
}

const ForumThreadList = observer(({channelId, onThreadSelect}: {channelId: string; onThreadSelect: (id: string) => void}) => {
	const channel = ChannelStore.getChannel(channelId);
	const channelMessages = MessageStore.getCachedMessages(channelId);
	const [showNewThread, setShowNewThread] = useState(false);
	const [newTitle, setNewTitle] = useState('');

	useEffect(() => {
		void MessageActionCreators.fetchMessages(channelId, null, null, 50);
	}, [channelId]);

	if (!channel) return null;

	const threads: ThreadEntry[] = channelMessages
		? channelMessages
				.toArray()
				.filter((m) => !m.referencedMessage)
				.slice(-50)
				.reverse()
				.map((m) => ({
					id: m.id,
					title: m.content.split('\n')[0]?.slice(0, 80) || 'Untitled thread',
					author: m.author.username || 'Unknown',
					preview: m.content.split('\n').slice(1).join(' ').slice(0, 120) || m.content.slice(0, 120) || '',
					replyCount: 0,
					pinned: m.pinned ?? false,
					tags: [],
					timestamp: m.timestamp.toLocaleDateString(),
				}))
		: [];

	return (
		<div className={styles.forumScroll}>
			<div className={styles.forumContent}>
				<div className={styles.sectionHeader}>
					<div className={styles.pageTitle}>
						<HashIcon size={20} className={styles.pageTitleIcon} />
						<span className={styles.pageTitleText}>{channel.name}</span>
					</div>
					<button
						type="button"
						className={styles.forumNewPostBtn}
						onClick={() => setShowNewThread((v) => !v)}
					>
						<PlusIcon size={16} />
						New Thread
					</button>
				</div>

				{showNewThread && (
					<div
						style={{
							background: 'var(--background-secondary)',
							borderRadius: '8px',
							padding: '16px',
							marginBottom: '12px',
							display: 'flex',
							gap: '8px',
							alignItems: 'center',
						}}
					>
						<input
							autoFocus
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							placeholder="Thread title…"
							style={{
								flex: 1,
								background: 'var(--background-tertiary)',
								border: '1px solid var(--background-modifier-border)',
								borderRadius: '4px',
								padding: '8px 12px',
								color: 'var(--text-normal)',
								fontSize: '14px',
								outline: 'none',
							}}
						/>
						<button
							type="button"
							className={styles.forumNewPostBtn}
							disabled={!newTitle.trim()}
							onClick={async () => {
								const content = newTitle.trim();
								if (!content) return;
								setNewTitle('');
								setShowNewThread(false);
								await MessageActionCreators.send(channelId, {
									content,
									nonce: Date.now().toString(),
								});
							}}
						>
							<ArrowUpIcon size={14} />
							Post
						</button>
					</div>
				)}

				{channel.topic && (
					<p style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px'}}>
						{channel.topic}
					</p>
				)}

				{threads.length === 0 ? (
					<div
						style={{
							textAlign: 'center',
							padding: '60px 20px',
							color: 'var(--text-muted)',
						}}
					>
						<HashIcon size={48} style={{opacity: 0.2, marginBottom: '12px'}} />
						<p style={{fontWeight: 600, margin: '0 0 4px'}}>No threads yet</p>
						<p style={{fontSize: '14px', margin: 0}}>Be the first to start a discussion!</p>
					</div>
				) : (
					threads.map((thread) => (
						<div
							key={thread.id}
							className={thread.pinned ? styles.forumPostPinned : styles.forumPost}
							style={{cursor: 'pointer'}}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onThreadSelect(thread.id); }}
							onClick={() => onThreadSelect(thread.id)}
						>
							<div className={styles.forumPostMain}>
								<div className={styles.forumPostTitleRow}>
									{thread.pinned && (
										<span className={styles.pinnedBadge}>
											<PushPinIcon size={10} style={{marginRight: '2px'}} />
											Pinned
										</span>
									)}
									<span className={styles.forumPostTitle}>{thread.title}</span>
								</div>
								<div className={styles.forumPostMeta}>
									<span>{thread.author}</span>
									<span className={styles.forumPostDot} />
									<span>{thread.timestamp}</span>
								</div>
								{thread.preview && (
									<p
										style={{
											fontSize: '13px',
											color: 'var(--text-muted)',
											margin: '0 0 6px',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{thread.preview}
									</p>
								)}
								{thread.tags.length > 0 && (
									<div className={styles.forumPostTags}>
										{thread.tags.map((tag) => (
											<span key={tag} className={styles.forumTag}>{tag}</span>
										))}
									</div>
								)}
							</div>
							<div className={styles.forumPostStats}>
								<span className={styles.forumStat}>
									<ChatCircleIcon size={13} />
									{thread.replyCount}
								</span>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
});

export const ForumChannelView = observer(({channelId}: ForumChannelViewProps) => {
	const channel = ChannelStore.getChannel(channelId);
	const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

	if (!channel) return null;

	if (selectedThreadId) {
		return (
			<div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						padding: '8px 16px',
						background: 'var(--background-secondary)',
						borderBottom: '1px solid var(--background-modifier-border)',
						flexShrink: 0,
					}}
				>
					<button
						type="button"
						onClick={() => setSelectedThreadId(null)}
						style={{
							background: 'none',
							border: 'none',
							color: 'var(--text-muted)',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							padding: '4px 8px',
							borderRadius: '4px',
						}}
					>
						<ArrowLeftIcon size={14} />
						Back to threads
					</button>
					<span style={{fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)'}}>
						{channel.name}
					</span>
				</div>
				<div style={{flex: 1, overflow: 'hidden'}}>
					<GuildChannelView channelId={channelId} guildId={channel.guildId} messageId={selectedThreadId} />
				</div>
			</div>
		);
	}

	return (
		<ChannelViewScaffold
			header={<ChannelHeader channel={channel} showMembersToggle={true} showPins={true} />}
			chatArea={<ForumThreadList channelId={channelId} onThreadSelect={setSelectedThreadId} />}
		/>
	);
});
