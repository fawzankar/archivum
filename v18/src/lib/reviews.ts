import { execute, query } from './db';

export interface Review {
  id: number;
  name: string;
  rating: number;
  review: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export async function getApprovedReviews(limit = 6) {
  return query<Review>(
    `SELECT id,name,rating,review,status,created_at FROM reviews WHERE status='approved' ORDER BY created_at DESC LIMIT ?`,
    [Math.min(Math.max(limit, 1), 20)],
  );
}

export async function createReview(name: string, rating: number, review: string) {
  return execute(
    `INSERT INTO reviews (name,rating,review,status,created_at) VALUES (?,?,?,?,?)`,
    [name, rating, review, 'pending', new Date().toISOString()],
  );
}

export async function getPendingReviews() {
  return query<Review>(`SELECT * FROM reviews WHERE status='pending' ORDER BY created_at DESC`);
}
