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
import {ChannelViewScaffold} from '@app/components/channel/channel_view/ChannelViewScaffold';
import {Messages} from '@app/components/channel/Messages';
import ChannelStore from '@app/stores/ChannelStore';
import GuildMemberStore from '@app/stores/GuildMemberStore';
import GuildStore from '@app/stores/GuildStore';
import {SpeakerHighIcon, UsersIcon} from '@phosphor-icons/react';
import {observer} from 'mobx-react-lite';
import {useState} from 'react';

interface StageChannelViewProps {
	channelId: string;
}

const StageParticipants = observer(({channelId}: {channelId: string}) => {
	const channel = ChannelStore.getChannel(channelId);
	const guild = channel ? GuildStore.getGuild(channel.guildId!) : null;
	
	if (!channel || !guild) return null;

	const members = GuildMemberStore.getMembers(channel.guildId!);

	const stageParticipantsStyle = {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: '12px',
		padding: '20px',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		marginBottom: '16px',
	};

	const stageHeaderStyle = {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '16px',
	};

	const stageTitleStyle = {
		fontSize: '18px',
		fontWeight: '600',
		color: '#fff',
		margin: 0,
	};

	const stageStatsStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: '14px',
	};

	const participantGridStyle = {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
		gap: '12px',
	};

	const participantCardStyle = {
		display: 'flex',
		flexDirection: 'column' as const,
		alignItems: 'center',
		gap: '8px',
		padding: '12px',
		background: 'rgba(255, 255, 255, 0.05)',
		borderRadius: '8px',
		transition: 'all 0.2s ease',
	};

	const participantAvatarStyle = {
		position: 'relative' as const,
		width: '48px',
		height: '48px',
	};

	const avatarPlaceholderStyle = {
		width: '100%',
		height: '100%',
		borderRadius: '50%',
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: '#fff',
		fontWeight: '600',
		fontSize: '18px',
	};

	const participantStatusStyle = {
		position: 'absolute' as const,
		bottom: '-2px',
		right: '-2px',
		width: '20px',
		height: '20px',
		background: '#10b981',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		border: '2px solid #1a1a2e',
	};

	const speakerIconStyle = {
		color: '#fff',
	};

	const participantNameStyle = {
		fontSize: '12px',
		color: 'rgba(255, 255, 255, 0.9)',
		textAlign: 'center' as const,
		fontWeight: '500',
		maxWidth: '80px',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap' as const,
	};

	return (
		<div style={stageParticipantsStyle}>
			<div style={stageHeaderStyle}>
				<h3 style={stageTitleStyle}>Stage Participants</h3>
				<div style={stageStatsStyle}>
					<UsersIcon size={20} />
					<span>{members.length} members</span>
				</div>
			</div>
			<div style={participantGridStyle}>
				{members.slice(0, 8).map((member: any) => (
					<div key={member.userId} style={participantCardStyle}>
						<div style={participantAvatarStyle}>
							<div style={avatarPlaceholderStyle}>
								{member.nickname ? member.nickname[0].toUpperCase() : '?'}
							</div>
							<div style={participantStatusStyle}>
								<SpeakerHighIcon size={16} style={speakerIconStyle} />
							</div>
						</div>
						<div style={participantNameStyle}>
							{member.nickname || 'Unknown'}
						</div>
					</div>
				))}
			</div>
		</div>
	);
});

export const StageChannelView = observer(({channelId}: StageChannelViewProps) => {
	const channel = ChannelStore.getChannel(channelId);
	const [hasBottomBar, setHasBottomBar] = useState(false);

	if (!channel) return null;

	const stageContainerStyle = {
		display: 'flex',
		flexDirection: 'column' as const,
		gap: '16px',
	};

	return (
		<ChannelViewScaffold
			header={<ChannelHeader channel={channel} showMembersToggle={true} showPins={true} />}
			chatArea={
				<div style={stageContainerStyle}>
					<StageParticipants channelId={channelId} />
					<ChannelChatLayout
						channel={channel}
						messages={
							<Messages key={channel.id} channel={channel} onBottomBarVisibilityChange={setHasBottomBar} />
						}
						hideSlowmodeIndicator={hasBottomBar}
					/>
				</div>
			}
		/>
	);
});
