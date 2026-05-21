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

import type React from 'react';
import {makeAutoObservable} from 'mobx';

export interface ChannelTypeDescriptor {
	id: string;
	name: string;
	description: string;
	icon: string;
	component?: React.ComponentType<{channelId: string}> | null;
}

export class ChannelTypeRegistry {
	private static instance: ChannelTypeRegistry;
	private channelTypes: Map<string, ChannelTypeDescriptor> = new Map();
	private componentMap: Map<string, React.ComponentType<{channelId: string}>> = new Map();

	constructor() {
		makeAutoObservable(this);
	}

	static getInstance(): ChannelTypeRegistry {
		if (!ChannelTypeRegistry.instance) {
			ChannelTypeRegistry.instance = new ChannelTypeRegistry();
		}
		return ChannelTypeRegistry.instance;
	}

	registerChannelType(channelType: ChannelTypeDescriptor): void {
		this.channelTypes.set(channelType.id, channelType);
		if (channelType.component) {
			this.componentMap.set(channelType.id, channelType.component);
		}
		console.log(`[ChannelTypeRegistry] Registered channel type ${channelType.id}`);
	}

	registerComponent(channelTypeId: string, component: React.ComponentType<{channelId: string}>): void {
		this.componentMap.set(channelTypeId, component);
		console.log(`[ChannelTypeRegistry] Registered component for channel type ${channelTypeId}`);
	}

	unregisterChannelType(channelTypeId: string): void {
		this.channelTypes.delete(channelTypeId);
		this.componentMap.delete(channelTypeId);
		console.log(`[ChannelTypeRegistry] Unregistered channel type ${channelTypeId}`);
	}

	getChannelType(channelTypeId: string): ChannelTypeDescriptor | null {
		return this.channelTypes.get(channelTypeId) ?? null;
	}

	getComponent(channelTypeId: string): React.ComponentType<{channelId: string}> | null {
		return this.componentMap.get(channelTypeId) ?? null;
	}

	getAllChannelTypes(): Map<string, ChannelTypeDescriptor> {
		return new Map(this.channelTypes);
	}

	clear(): void {
		this.channelTypes.clear();
		this.componentMap.clear();
	}
}

export const channelTypeRegistry = ChannelTypeRegistry.getInstance();
