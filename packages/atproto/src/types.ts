/*
 * MIT License
 *
 * Copyright (c) 2026 manikineko.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// AT Protocol Types

export type DID = `did:${string}`;

export interface DIDDocument {
	'@context': string[];
	id: DID;
	alsoKnownAs?: string[];
	verificationMethod: VerificationMethod[];
	service: Service[];
}

export interface VerificationMethod {
	id: string;
	type: string;
	controller: DID;
	publicKeyMultibase?: string;
}

export interface Service {
	id: string;
	type: string;
	serviceEndpoint: string;
}

export interface XRPCRequest {
	method: string;
	params?: Record<string, unknown>;
	encoding?: 'application/json' | 'application/x-www-form-urlencoded';
}

export interface XRPCResponse {
	success: boolean;
	data?: unknown;
	error?: XRPCError;
}

export interface XRPCError {
	error: string;
	message?: string;
}

export interface ATRecord {
	uri: string;
	cid: string;
	value: unknown;
}

export interface Commit {
	cid: string;
	rev: string;
}

export interface Repository {
	did: DID;
	records: Record<string, ATRecord>;
	head: string;
}

export interface Session {
	did: DID;
	handle: string;
	email: string;
	accessJwt: string;
	refreshJwt: string;
}
