import { SlotKey } from 'modject';
import { Book, Article } from '@fullstack/shared';

export interface DatabaseAPI {
  getBooks(): Book[];
  searchBooks(query: string): Book[];
  getArticles(): Article[];
}

export const DatabaseAPI: SlotKey<DatabaseAPI> = {
  name: 'Database API',
};
