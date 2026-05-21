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

import type {IPaymentProcessor} from './IPaymentProcessor';

export class PaymentProcessorRegistry {
	private processors: Map<string, IPaymentProcessor> = new Map();
	private defaultProcessor: string | null = null;

	register(processor: IPaymentProcessor): void {
		this.processors.set(processor.name, processor);
		console.log(`Registered payment processor: ${processor.name}`);
	}

	unregister(name: string): void {
		this.processors.delete(name);
		console.log(`Unregistered payment processor: ${name}`);
	}

	get(name: string): IPaymentProcessor | undefined {
		return this.processors.get(name);
	}

	getDefault(): IPaymentProcessor | undefined {
		if (this.defaultProcessor) {
			return this.processors.get(this.defaultProcessor);
		}
		// Return the first enabled processor as default
		for (const processor of this.processors.values()) {
			if (processor.enabled) {
				return processor;
			}
		}
		return undefined;
	}

	setDefault(name: string): void {
		if (!this.processors.has(name)) {
			throw new Error(`Payment processor '${name}' not found`);
		}
		this.defaultProcessor = name;
	}

	listEnabled(): Array<IPaymentProcessor> {
		return Array.from(this.processors.values()).filter((p) => p.enabled);
	}
}

export const paymentProcessorRegistry = new PaymentProcessorRegistry();
