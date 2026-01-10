import { useState } from 'react';
import { Book } from '@fullstack/shared';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setBooks(data);
      setSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Search Books</h1>
      
      <div className="mb-8 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search by title, author, or description..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searched && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {books.length} {books.length === 1 ? 'result' : 'results'} found
          </h2>
          
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.id} className="p-6 border border-gray-300 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">{book.title}</h3>
                <p className="text-gray-600 mb-2">by {book.author} ({book.year})</p>
                <p className="text-gray-700 mb-2">{book.description}</p>
                <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
