import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PageInfo } from '@fullstack/shared';

type AppProps = {
  pages: PageInfo[];
};

export function App({ pages }: AppProps) {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md mb-8">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Book Catalog
              </Link>
              <div className="flex gap-6">
                {pages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            {pages.map((page) => (
              <Route key={page.path} path={page.path} element={<page.component />} />
            ))}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
