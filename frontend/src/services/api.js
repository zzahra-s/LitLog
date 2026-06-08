const BASE_URL = 'http://localhost:5001';

// Helper to handle errors consistently
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// Register user
export async function registerUser(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  return handleResponse(res);
}

// Login user
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

// Get books for a user
export async function getBooks(userID) {
  const res = await fetch(`${BASE_URL}/books/${userID}`);
  const data = await handleResponse(res);
  // Normalize PascalCase SQL columns → camelCase for React
  return data.map(b => ({
    id: b.BookID,
    title: b.Title,
    author: b.Author,
    genre: b.Genre,
    totalPages: b.TotalPages,
    yearPublished: b.YearPublished,
    status: b.Status,
    rating: b.Rating,
  }));
}

// Delete a book
export async function deleteBook(bookID) {
  const res = await fetch(`${BASE_URL}/books/${bookID}`, { method: 'DELETE' });
  return handleResponse(res);
}

// Add a book (used for external books and BookDetails form)
export async function addBook(book) {
  const res = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userID: book.userID,
      title: book.title || 'Unknown',
      author: book.author || 'Unknown',
      genre: book.genre || 'Unknown',
      totalPages: Number(book.totalPages) || 0,
      yearPublished: Number(book.yearPublished) || null,
      status: book.status || 'Want to Read',
      rating: book.rating || null,
      notes: book.notes || null,
    })
  });
  return handleResponse(res);
}
// Get a single book by ID
export async function getBookById(id) {
  const res = await fetch(`${BASE_URL}/books/${id}`);
  return handleResponse(res);
}

// Update a book by ID
export async function updateBook(id, bookData) {
  const res = await fetch(`${BASE_URL}/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData)
  });
  return handleResponse(res);
}
