import { useState, useEffect } from 'react';
import { Article } from '@fullstack/shared';

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">New Articles</h1>
      
      {loading ? (
        <p className="text-gray-600">Loading articles...</p>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <div key={article.id} className="p-6 border border-gray-300 rounded-lg">
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">{article.title}</h2>
              <p className="text-sm text-gray-500 mb-3">
                By {article.author} • {new Date(article.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700">{article.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
