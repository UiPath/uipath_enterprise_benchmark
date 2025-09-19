import React, { useState, useEffect } from 'react';
import { Search, Book, Calendar, User } from 'lucide-react';

// Book interface
interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  genre: string;
  isbn: string;
  pages: number;
  description: string;
}

// Simple seeded random number generator
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate deterministic book data
const generateBookData = (): Book[] => {
  const rng = new SeededRandom(12345); // Fixed seed for consistent data
  
  // Science fiction subgenres
  const scienceFictionGenres = ['Hard Science Fiction', 'Space Opera', 'Cyberpunk', 'Dystopian Fiction'];
  
  // Science (non-fiction) genres to make search more specific
  const scienceGenres = ['Physics', 'Biology', 'Chemistry', 'Mathematics', 'Computer Science', 'Astronomy'];
  
  // Author first names
  const firstNames = [
    'Isaac', 'Arthur', 'Philip', 'Robert', 'Frank', 'Kim', 'Ursula', 'William', 'Douglas',
    'Ray', 'Kurt', 'Margaret', 'Orson', 'Dan', 'Liu', 'Ann', 'Becky', 'Martha', 'James',
    'Mary', 'John', 'Sarah', 'David', 'Lisa', 'Michael', 'Emma', 'Richard', 'Jennifer',
    'Thomas', 'Amanda', 'Mark', 'Jessica', 'Paul', 'Ashley', 'Steven', 'Emily', 'Kevin',
    'Stephanie', 'Brian', 'Melissa', 'Edward', 'Nicole', 'Ronald', 'Kimberly', 'Anthony',
    'Donna', 'Joshua', 'Carol', 'Matthew', 'Ruth', 'Andrew', 'Sharon', 'Kenneth', 'Michelle'
  ];
  
  // Author last names
  const lastNames = [
    'Asimov', 'Clarke', 'Dick', 'Heinlein', 'Herbert', 'Robinson', 'Le Guin', 'Gibson', 'Adams',
    'Bradbury', 'Vonnegut', 'Atwood', 'Card', 'Simmons', 'Cixin', 'Leckie', 'Chambers', 'Wells',
    'Sterling', 'Banks', 'Reynolds', 'Hamilton', 'Bear', 'Stephenson', 'Bacigalupi', 'Jemisin',
    'Liu', 'Cadigan', 'Rucker', 'Vinge', 'Egan', 'Watts', 'Stross', 'Doctorow', 'McDonald',
    'Mieville', 'Scalzi', 'Anders', 'Leckie', 'Hurley', 'Valente', 'Palmer', 'Kowal', 'Ahmed',
    'Okorafor', 'Older', 'Gladstone', 'Martine', 'Solomon', 'El-Mohtar', 'Roanhorse', 'Butler'
  ];
  
  // Title word components for sci-fi books
  const sciFiTitleWords1 = [
    'The', 'A', 'Last', 'First', 'Lost', 'Hidden', 'Secret', 'Ancient', 'Future', 'Dark',
    'Digital', 'Quantum', 'Neural', 'Solar', 'Stellar', 'Galactic', 'Cosmic', 'Electric',
    'Synthetic', 'Virtual', 'Infinite', 'Terminal', 'Final', 'Ultimate', 'Prime', 'Alpha'
  ];
  
  const sciFiTitleWords2 = [
    'Foundation', 'Empire', 'Galaxy', 'Planet', 'Station', 'Colony', 'City', 'Ship', 'World',
    'Network', 'Matrix', 'Protocol', 'Algorithm', 'Interface', 'System', 'Machine', 'Android',
    'Cyborg', 'Robot', 'AI', 'Mind', 'Memory', 'Dream', 'Vision', 'Signal', 'Code', 'Data',
    'War', 'Peace', 'Dawn', 'Dusk', 'Storm', 'Fire', 'Ice', 'Light', 'Shadow', 'Time',
    'Space', 'Void', 'Star', 'Sun', 'Moon', 'Earth', 'Mars', 'Titan', 'Europa', 'Luna'
  ];
  
  // Title word components for science (non-fiction) books
  const scienceTitleWords1 = [
    'Introduction to', 'Advanced', 'Fundamentals of', 'Principles of', 'Understanding', 'Exploring',
    'Modern', 'Applied', 'Theoretical', 'Practical', 'Essential', 'Comprehensive'
  ];
  
  const scienceTitleWords2 = [
    'Quantum Mechanics', 'Molecular Biology', 'Organic Chemistry', 'Linear Algebra', 'Data Structures',
    'Astrophysics', 'Genetics', 'Biochemistry', 'Calculus', 'Algorithms', 'Cosmology', 'Evolution',
    'Thermodynamics', 'Statistics', 'Programming', 'Neuroscience', 'Ecology', 'Physics',
    'Mathematics', 'Computer Science', 'Astronomy', 'Chemistry', 'Biology'
  ];
  
  const books: Book[] = [];
  
  // Generate 190 science fiction books and 50 science (non-fiction) books for total of 240
  for (let i = 0; i < 240; i++) {
    const firstName = firstNames[Math.floor(rng.next() * firstNames.length)];
    const lastName = lastNames[Math.floor(rng.next() * lastNames.length)];
    const author = `${firstName} ${lastName}`;
    
    // Determine if this is a science fiction book (first 190) or science book (last 50)
    const isScienceFiction = i < 190;
    
    let title: string;
    let genre: string;
    let description: string;
    
    if (isScienceFiction) {
      // Science fiction book
      const word1 = sciFiTitleWords1[Math.floor(rng.next() * sciFiTitleWords1.length)];
      const word2 = sciFiTitleWords2[Math.floor(rng.next() * sciFiTitleWords2.length)];
      title = `${word1} ${word2}`;
      
      // Add third word sometimes for variety
      if (rng.next() < 0.4) {
        const word3 = sciFiTitleWords2[Math.floor(rng.next() * sciFiTitleWords2.length)];
        title += ` ${word3}`;
      }
      
      genre = scienceFictionGenres[Math.floor(rng.next() * scienceFictionGenres.length)];
      description = `A compelling ${genre.toLowerCase()} novel exploring themes of technology, humanity, and the future.`;
    } else {
      // Science (non-fiction) book
      const word1 = scienceTitleWords1[Math.floor(rng.next() * scienceTitleWords1.length)];
      const word2 = scienceTitleWords2[Math.floor(rng.next() * scienceTitleWords2.length)];
      title = `${word1} ${word2}`;
      
      genre = scienceGenres[Math.floor(rng.next() * scienceGenres.length)];
      description = `An educational textbook covering essential concepts and principles in ${genre.toLowerCase()}.`;
    }
    
    // Generate publication year with exactly 45 science fiction books published after 2020 (excluding 2020)
    // For science fiction books: first 45 will be published 2021-2024, rest 1985-2020  
    // For science books: 10 will be published 2021-2024, rest 1985-2020
    let year: number;
    if (isScienceFiction && i < 45) {
      // Science fiction books published after 2020 (2021-2024, excluding 2020)
      year = 2021 + Math.floor(rng.next() * 4); // 2021, 2022, 2023, 2024
    } else if (!isScienceFiction && (i - 190) < 10) {
      // First 10 science books published after 2020 (2021-2024, excluding 2020)
      year = 2021 + Math.floor(rng.next() * 4); // 2021, 2022, 2023, 2024
    } else {
      // Books published 1985-2020 (remaining science fiction and science books)
      year = 1985 + Math.floor(rng.next() * 36); // 1985-2020
    }
    
    const pages = 200 + Math.floor(rng.next() * 600); // 200-799 pages
    const isbn = `978-${Math.floor(rng.next() * 10)}${Math.floor(rng.next() * 100000000).toString().padStart(8, '0')}`;
    
    books.push({
      id: i + 1,
      title,
      author,
      year,
      genre,
      isbn,
      pages,
      description
    });
  }
  
  // Shuffle the books to distribute target books across pages
  // Use Fisher-Yates shuffle with seeded random
  for (let i = books.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [books[i], books[j]] = [books[j], books[i]];
  }
  
  return books;
};

const Task17: React.FC = () => {
  const [allBooks] = useState<Book[]>(() => generateBookData());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [readingList, setReadingList] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const BOOKS_PER_PAGE = 20;
  
  // Expose app state for testing
  useEffect(() => {
    const booksAfter2020 = allBooks.filter(book => book.year > 2020);
    const scienceFictionBooks = allBooks.filter(book => 
      book.genre === 'Hard Science Fiction' || 
      book.genre === 'Space Opera' || 
      book.genre === 'Cyberpunk' || 
      book.genre === 'Dystopian Fiction'
    );
    const scienceFictionBooksAfter2020 = scienceFictionBooks.filter(book => book.year > 2020);
    const scienceBooks = allBooks.filter(book => 
      book.genre === 'Physics' || 
      book.genre === 'Biology' || 
      book.genre === 'Chemistry' || 
      book.genre === 'Mathematics' || 
      book.genre === 'Computer Science' || 
      book.genre === 'Astronomy'
    );
    const scienceBooksAfter2020 = scienceBooks.filter(book => book.year > 2020);
    const searchResultsAfter2020 = searchResults.filter(book => book.year > 2020);
    const readingListAfter2020 = readingList.filter(book => book.year > 2020);
    const readingListScienceFiction = readingList.filter(book => 
      book.genre === 'Hard Science Fiction' || 
      book.genre === 'Space Opera' || 
      book.genre === 'Cyberpunk' || 
      book.genre === 'Dystopian Fiction'
    );
    
    (window as any).app_state = {
      allBooks,
      searchResults,
      readingList,
      searchTerm,
      currentPage,
      hasSearched,
      booksAfter2020,
      scienceFictionBooks,
      scienceFictionBooksAfter2020,
      scienceBooks,
      scienceBooksAfter2020,
      searchResultsAfter2020,
      readingListAfter2020,
      readingListScienceFiction,
      totalBooks: allBooks.length,
      booksAfter2020Count: booksAfter2020.length,
      scienceFictionBooksCount: scienceFictionBooks.length,
      scienceFictionBooksAfter2020Count: scienceFictionBooksAfter2020.length,
      scienceBooksCount: scienceBooks.length,
      scienceBooksAfter2020Count: scienceBooksAfter2020.length,
      readingListCount: readingList.length,
      readingListAfter2020Count: readingListAfter2020.length,
      readingListScienceFictionCount: readingListScienceFiction.length
    };
  }, [allBooks, searchResults, readingList, searchTerm, currentPage, hasSearched]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    if (!term.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    const filtered = allBooks.filter(book =>
      book.title.toLowerCase().includes(term.toLowerCase()) ||
      book.author.toLowerCase().includes(term.toLowerCase()) ||
      book.genre.toLowerCase().includes(term.toLowerCase())
    );
    
    setSearchResults(filtered);
    setHasSearched(true);
  };
  
  const getPaginatedResults = () => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    return searchResults.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  };
  
  const getTotalPages = () => {
    return Math.ceil(searchResults.length / BOOKS_PER_PAGE);
  };
  
  const addToReadingList = (book: Book) => {
    if (!readingList.find(b => b.id === book.id)) {
      setReadingList(prev => [...prev, book]);
    }
  };
  
  const removeFromReadingList = (bookId: number) => {
    setReadingList(prev => prev.filter(b => b.id !== bookId));
  };
  
  const isInReadingList = (bookId: number) => {
    return readingList.some(b => b.id === bookId);
  };
  
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel - Library Catalog */}
      <div className="w-2/3 p-4 bg-white border-r overflow-auto">
        <div className="flex items-center gap-2 mb-4">
          <Book size={24} className="text-blue-600" />
          <h1 className="text-xl font-semibold">Digital Library Catalog</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search books by title, author, or genre..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Search Results or Instructions */}
        {!hasSearched ? (
          <div className="text-center py-12 text-gray-500">
            <Book size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Search the Library Catalog</h3>
            <p>Enter a search term to find books in our collection.</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Results Found</h3>
            <p>No books found matching "{searchTerm}". Try a different search term.</p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Search Results for "{searchTerm}"
              </h2>
              <div className="text-sm text-gray-600">
                {searchResults.length} books found
              </div>
            </div>
            
            {/* Book Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {getPaginatedResults().map(book => (
                <div key={book.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    {/* Book Cover Placeholder */}
                    <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      <Book size={20} className="text-gray-400" />
                    </div>
                    
                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">
                        {book.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <User size={14} />
                        <span>{book.author}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                        <Calendar size={14} />
                        <span>{book.year}</span>
                      </div>
                      
                      <div className="text-sm text-blue-600 mb-2">
                        {book.genre}
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        {book.pages} pages • ISBN: {book.isbn}
                      </div>
                      
                      <button
                        onClick={() => addToReadingList(book)}
                        disabled={isInReadingList(book.id)}
                        className={`text-sm px-3 py-1 rounded transition-colors ${
                          isInReadingList(book.id)
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isInReadingList(book.id) ? 'Added to List' : 'Add to Reading List'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {getTotalPages() > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                  disabled={currentPage === getTotalPages()}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Page {currentPage} of {getTotalPages()} • 
              Showing {getPaginatedResults().length} of {searchResults.length} results
            </div>
          </>
        )}
      </div>
      
      {/* Right Panel - Reading List */}
      <div className="w-1/3 p-4 bg-gray-50 overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Reading List</h2>
        
        {readingList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Book size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Your reading list is empty.</p>
            <p className="text-xs mt-1">Search for books and add them to build your list.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded border overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-2 py-2 text-left font-medium">Title</th>
                    <th className="border border-gray-300 px-2 py-2 text-left font-medium">Author</th>
                    <th className="border border-gray-300 px-2 py-2 text-left font-medium">Year</th>
                    <th className="border border-gray-300 px-2 py-2 text-left font-medium">Genre</th>
                    <th className="border border-gray-300 px-2 py-2 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {readingList.map((book, index) => (
                    <tr key={book.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-2 py-2">
                        <div className="truncate max-w-32" title={book.title}>
                          {book.title}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <div className="truncate max-w-24" title={book.author}>
                          {book.author}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {book.year}
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <div className="truncate max-w-20" title={book.genre}>
                          {book.genre}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        <button
                          onClick={() => removeFromReadingList(book.id)}
                          className="text-red-500 hover:text-red-700 text-xs px-1 py-1 rounded"
                          title="Remove from reading list"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-sm text-gray-600">
              {readingList.length} book{readingList.length !== 1 ? 's' : ''} in your reading list
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Task17;
