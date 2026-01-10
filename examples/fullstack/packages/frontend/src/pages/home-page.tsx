import { Link } from 'react-router-dom';
import { PageInfo } from '@fullstack/shared';

type HomePageProps = {
  pages: PageInfo[];
};

export function HomePage({ pages }: HomePageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Welcome to Book Catalog</h1>
      <p className="text-lg mb-8 text-gray-700">
        Browse our collection of books, search for your favorites, and read the latest articles
        about literature.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.filter(p => p.path !== '/').map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold text-blue-600">{page.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
