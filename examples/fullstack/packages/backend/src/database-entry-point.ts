import type { Article, Book } from '@fullstack/shared';
import type { EntryPoint } from 'modject';
import { DatabaseAPI } from './database';

const books: Book[] = [
  {
    id: 'book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    description: 'A classic novel of the Jazz Age',
    isbn: '978-0-7432-7356-5',
  },
  {
    id: 'book-2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    year: 1960,
    description: 'A gripping tale of racial injustice and childhood innocence',
    isbn: '978-0-06-112008-4',
  },
  {
    id: 'book-3',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    description: 'A dystopian social science fiction novel',
    isbn: '978-0-452-28423-4',
  },
  {
    id: 'book-4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    description: 'A romantic novel of manners',
    isbn: '978-0-14-143951-8',
  },
  {
    id: 'book-5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    year: 1951,
    description: 'A story about teenage rebellion and alienation',
    isbn: '978-0-316-76948-0',
  },
];

const articles: Article[] = [
  {
    id: 'article-1',
    title: 'The Rise of Digital Libraries',
    content: 'Digital libraries are transforming how we access and preserve knowledge...',
    date: '2024-01-15',
    author: 'Jane Smith',
  },
  {
    id: 'article-2',
    title: 'Reading Trends in 2024',
    content:
      'Recent studies show interesting patterns in reading habits across different age groups...',
    date: '2024-02-20',
    author: 'John Doe',
  },
  {
    id: 'article-3',
    title: 'The Future of Book Publishing',
    content:
      'The publishing industry continues to evolve with new technologies and reader preferences...',
    date: '2024-03-10',
    author: 'Sarah Johnson',
  },
];

export const DatabaseEntryPoint: EntryPoint = {
  name: 'Database Entry Point',
  contributes: [DatabaseAPI],

  contribute(shell) {
    shell.contribute(DatabaseAPI, () => ({
      getBooks: () => [...books],
      searchBooks: (query) => {
        const lowerQuery = query.toLowerCase();
        return books.filter(
          (book) =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.description.toLowerCase().includes(lowerQuery)
        );
      },
      getArticles: () => [...articles],
    }));
  },
};
