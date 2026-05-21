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
import {observer} from 'mobx-react-lite';
import {useState} from 'react';

interface TextChannelViewProps {
	channelId: string;
}

export const TextChannelView = observer(({channelId}: TextChannelViewProps) => {
	const channel = ChannelStore.getChannel(channelId);
	const [hasBottomBar, setHasBottomBar] = useState(false);

	if (!channel) return null;

	return (
		<ChannelViewScaffold
			header={<ChannelHeader channel={channel} showMembersToggle={true} showPins={true} />}
			chatArea={
				<ChannelChatLayout
					channel={channel}
					messages={
						<Messages key={channel.id} channel={channel} onBottomBarVisibilityChange={setHasBottomBar} />
					}
					textarea={<ChannelTextarea channel={channel} />}
					hideSlowmodeIndicator={hasBottomBar}
				/>
			}
		/>
	);
});
