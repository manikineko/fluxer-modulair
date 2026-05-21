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

import type {IPaymentProcessor} from '../IPaymentProcessor';
import type {CreatePaymentParams, PaymentResult, SubscriptionParams, SubscriptionResult} from '../IPaymentProcessor';

export class PayPalAdapter implements IPaymentProcessor {
	readonly name = 'paypal';
	readonly enabled: boolean;

	constructor(private paypalService: unknown) {
		this.enabled = paypalService !== null && typeof paypalService === 'object' && 'isEnabled' in paypalService;
	}

	async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
		try {
			console.log('PayPalAdapter: createPayment', params);
			return {success: true, paymentId: 'paypal_order_id'};
		} catch (error) {
			return {success: false, paymentId: '', error: error instanceof Error ? error.message : 'Unknown error'};
		}
	}

	async capturePayment(paymentId: string): Promise<PaymentResult> {
		console.log('PayPalAdapter: capturePayment', paymentId);
		return {success: true, paymentId};
	}

	async cancelPayment(paymentId: string): Promise<PaymentResult> {
		console.log('PayPalAdapter: cancelPayment', paymentId);
		return {success: true, paymentId};
	}

	async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
		try {
			console.log('PayPalAdapter: createSubscription', params);
			return {success: true, subscriptionId: 'paypal_subscription_id'};
		} catch (error) {
			return {success: false, subscriptionId: '', error: error instanceof Error ? error.message : 'Unknown error'};
		}
	}

	async cancelSubscription(subscriptionId: string): Promise<void> {
		console.log('PayPalAdapter: cancelSubscription', subscriptionId);
	}

	async updateSubscription(_subscriptionId: string, _params: Record<string, unknown>): Promise<SubscriptionResult> {
		console.log('PayPalAdapter: updateSubscription', _subscriptionId, _params);
		return {success: false, subscriptionId: _subscriptionId, error: 'Not implemented'};
	}

	async handleWebhook(event: unknown): Promise<void> {
		console.log('PayPalAdapter: handleWebhook', event);
	}
}
