export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">About Book Catalog</h1>
      
      <div className="prose prose-lg">
        <p className="text-gray-700 mb-4">
          Welcome to our Book Catalog application. This platform is designed to help book lovers
          discover and explore a wide range of literary works.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-3">Features</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Browse our extensive collection of books</li>
          <li>Search for books by title, author, or description</li>
          <li>Read the latest articles about literature and reading trends</li>
          <li>Discover new and classic works</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6 mb-3">Technology</h2>
        <p className="text-gray-700 mb-4">
          This application is built using a modular architecture with the Modject framework,
          featuring a React frontend and Express.js backend.
        </p>
      </div>
    </div>
  );
}
