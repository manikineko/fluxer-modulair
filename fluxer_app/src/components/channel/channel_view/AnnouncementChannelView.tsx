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

import {ChannelChatLayout} from '@app/components/channel/ChannelChatLayout';
import {ChannelHeader} from '@app/components/channel/ChannelHeader';
import {ChannelTextarea} from '@app/components/channel/ChannelTextarea';
import {ChannelViewScaffold} from '@app/components/channel/channel_view/ChannelViewScaffold';
import {Messages} from '@app/components/channel/Messages';
import ChannelStore from '@app/stores/ChannelStore';
import PermissionStore from '@app/stores/PermissionStore';
import AuthenticationStore from '@app/stores/AuthenticationStore';
import {Permissions} from '@fluxer/constants/src/ChannelConstants';
import {MegaphoneIcon, StarIcon, PencilSimpleIcon, CheckIcon, XIcon} from '@phosphor-icons/react';
import {observer} from 'mobx-react-lite';
import {useState} from 'react';

interface AnnouncementChannelViewProps {
	channelId: string;
}

const AnnouncementBanner = observer(({channelId}: {channelId: string}) => {
	const channel = ChannelStore.getChannel(channelId);
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState('');

	if (!channel) return null;

	const canManage = PermissionStore.can(Permissions.MANAGE_CHANNELS, channel);
	const description = channel.topic || 'Official announcements from this server will appear here.';

	const bannerGradients: string[] = [
		'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
		'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
		'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
	];
	const gradient = bannerGradients[channel.id.charCodeAt(0) % bannerGradients.length];

	return (
		<div
			style={{
				background: gradient,
				borderRadius: '16px',
				padding: '32px',
				marginBottom: '8px',
				position: 'relative',
				overflow: 'hidden',
				boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
			}}
		>
			<div style={{position: 'absolute', top: '20px', right: '20px', opacity: 0.12}}>
				<StarIcon size={120} />
			</div>
			<div style={{position: 'relative', zIndex: 1}}>
				<h2
					style={{
						fontSize: '26px',
						fontWeight: '800',
						color: '#fff',
						margin: '0 0 10px 0',
						display: 'flex',
						alignItems: 'center',
						gap: '12px',
						textShadow: '0 2px 4px rgba(0,0,0,0.2)',
					}}
				>
					<MegaphoneIcon size={26} />
					{channel.name}
					{canManage && !editing && (
						<button
							type="button"
							title="Edit banner description"
							onClick={() => { setDraft(channel.topic || ''); setEditing(true); }}
							style={{
								marginLeft: 'auto',
								background: 'rgba(255,255,255,0.2)',
								border: 'none',
								borderRadius: '6px',
								padding: '4px 8px',
								color: '#fff',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '4px',
								fontSize: '13px',
							}}
						>
							<PencilSimpleIcon size={14} />
							Edit
						</button>
					)}
				</h2>

				{editing ? (
					<div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
						<textarea
							autoFocus
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							rows={3}
							placeholder="Enter a banner description…"
							style={{
								flex: 1,
								background: 'rgba(0,0,0,0.25)',
								border: '1px solid rgba(255,255,255,0.3)',
								borderRadius: '6px',
								padding: '8px 12px',
								color: '#fff',
								fontSize: '14px',
								resize: 'vertical',
								outline: 'none',
								lineHeight: '1.5',
							}}
						/>
						<div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
							<button
								type="button"
								title="Save"
								onClick={async () => {
									try {
										const token = AuthenticationStore.token;
										await fetch(`/api/v1/channels/${channelId}`, {
											method: 'PATCH',
											headers: {
												'Content-Type': 'application/json',
												...(token ? {Authorization: token} : {}),
											},
											body: JSON.stringify({type: channel.type, topic: draft}),
										});
									} finally {
										setEditing(false);
									}
								}}
								style={{
									background: 'rgba(255,255,255,0.3)',
									border: 'none',
									borderRadius: '6px',
									padding: '6px 10px',
									color: '#fff',
									cursor: 'pointer',
								}}
							>
								<CheckIcon size={16} />
							</button>
							<button
								type="button"
								title="Cancel"
								onClick={() => setEditing(false)}
								style={{
									background: 'rgba(0,0,0,0.2)',
									border: 'none',
									borderRadius: '6px',
									padding: '6px 10px',
									color: '#fff',
									cursor: 'pointer',
								}}
							>
								<XIcon size={16} />
							</button>
						</div>
					</div>
				) : (
					<p style={{fontSize: '15px', color: 'rgba(255,255,255,0.95)', margin: '0 0 14px', lineHeight: '1.6', fontWeight: 500}}>
						{description}
					</p>
				)}

				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '6px',
						background: 'rgba(255,255,255,0.25)',
						padding: '6px 14px',
						borderRadius: '20px',
						fontSize: '13px',
						fontWeight: '600',
						color: '#fff',
						backdropFilter: 'blur(10px)',
					}}
				>
					<StarIcon size={13} />
					Official Channel
				</div>
			</div>
		</div>
	);
});

export const AnnouncementChannelView = observer(({channelId}: AnnouncementChannelViewProps) => {
	const channel = ChannelStore.getChannel(channelId);
	const [hasBottomBar, setHasBottomBar] = useState(false);

	if (!channel) return null;

	return (
		<ChannelViewScaffold
			header={<ChannelHeader channel={channel} showMembersToggle={true} showPins={true} />}
			chatArea={
				<div style={{display: 'flex', flexDirection: 'column', gap: '0'}}>
					<div style={{padding: '16px 16px 0'}}>
						<AnnouncementBanner channelId={channelId} />
					</div>
					<ChannelChatLayout
						channel={channel}
						messages={
							<Messages key={channel.id} channel={channel} onBottomBarVisibilityChange={setHasBottomBar} />
						}
						textarea={<ChannelTextarea channel={channel} />}
						hideSlowmodeIndicator={hasBottomBar}
					/>
				</div>
			}
		/>
	);
});
