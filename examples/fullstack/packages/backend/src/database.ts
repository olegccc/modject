import type { Article, Book } from '@fullstack/shared';
import type { SlotKey } from 'modject';

export interface DatabaseAPI {
  getBooks(): Book[];
  searchBooks(query: string): Book[];
  getArticles(): Article[];
}

export const DatabaseAPI: SlotKey<DatabaseAPI> = {
  name: 'Database API',
};
