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

import {GuildChannelView} from '@app/components/channel/channel_view/GuildChannelView';
import {ChannelTypes} from '@fluxer/constants/src/ChannelConstants';
import type {ChannelTypeDescriptor} from '../ChannelTypeRegistry';

export const voiceChannelType: ChannelTypeDescriptor = {
	id: String(ChannelTypes.GUILD_VOICE),
	name: 'Voice',
	description: 'Voice channel',
	icon: 'volume',
	component: GuildChannelView,
};
