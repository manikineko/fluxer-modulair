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

import type {DID} from './types';

export interface Lecture {
	id: string;
	title: string;
	description: string;
	author: DID;
	content: string;
	createdAt: string;
	updatedAt: string;
	tags: string[];
	attachments: string[];
}

export interface LectureComment {
	id: string;
	lectureId: string;
	author: DID;
	content: string;
	createdAt: string;
}

export class LectureManager {
	private lectures: Map<string, Lecture> = new Map();
	private comments: Map<string, LectureComment[]> = new Map();

	async createLecture(lecture: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lecture> {
		const id = `lecture_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		const now = new Date().toISOString();
		
		const newLecture: Lecture = {
			...lecture,
			id,
			createdAt: now,
			updatedAt: now,
		};
		
		this.lectures.set(id, newLecture);
		this.comments.set(id, []);
		
		return newLecture;
	}

	async getLecture(id: string): Promise<Lecture | null> {
		return this.lectures.get(id) || null;
	}

	async updateLecture(id: string, updates: Partial<Omit<Lecture, 'id' | 'createdAt'>>): Promise<Lecture | null> {
		const lecture = this.lectures.get(id);
		if (!lecture) return null;
		
		const updatedLecture: Lecture = {
			...lecture,
			...updates,
			updatedAt: new Date().toISOString(),
		};
		
		this.lectures.set(id, updatedLecture);
		return updatedLecture;
	}

	async deleteLecture(id: string): Promise<void> {
		this.lectures.delete(id);
		this.comments.delete(id);
	}

	async listLectures(author?: DID, tags?: string[]): Promise<Lecture[]> {
		let lectures = Array.from(this.lectures.values());
		
		if (author) {
			lectures = lectures.filter(l => l.author === author);
		}
		
		if (tags && tags.length > 0) {
			lectures = lectures.filter(l => 
				tags.some(tag => l.tags.includes(tag))
			);
		}
		
		return lectures.sort((a, b) => 
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	}

	async addComment(lectureId: string, comment: Omit<LectureComment, 'id' | 'createdAt'>): Promise<LectureComment> {
		const id = `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		const newComment: LectureComment = {
			...comment,
			id,
			createdAt: new Date().toISOString(),
		};
		
		const comments = this.comments.get(lectureId) || [];
		comments.push(newComment);
		this.comments.set(lectureId, comments);
		
		return newComment;
	}

	async getComments(lectureId: string): Promise<LectureComment[]> {
		return this.comments.get(lectureId) || [];
	}

	async deleteComment(lectureId: string, commentId: string): Promise<void> {
		const comments = this.comments.get(lectureId) || [];
		const filtered = comments.filter(c => c.id !== commentId);
		this.comments.set(lectureId, filtered);
	}

	async searchLectures(query: string): Promise<Lecture[]> {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.lectures.values()).filter(lecture =>
			lecture.title.toLowerCase().includes(lowerQuery) ||
			lecture.description.toLowerCase().includes(lowerQuery) ||
			lecture.content.toLowerCase().includes(lowerQuery) ||
			lecture.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
		);
	}
}

export const lectureManager = new LectureManager();
