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
export async function getBooks(userID) {
  const res = await fetch(`${BASE_URL}/books/${userID}`);
  const data = await handleResponse(res);

  return data.map(b => ({
    id: b.BookID,
    title: b.Title,
    author: b.Author,
    genre: b.Genre,
    totalPages: b.TotalPages,
    yearPublished: b.YearPublished,
    rating: b.Rating,
    status: b.Status,
    notes: b.Notes || null,
    userID: b.UserID
  }));
}

export async function deleteBook(bookID) {
  const res = await fetch(`${BASE_URL}/books/${bookID}`, { method: 'DELETE' });
  return handleResponse(res);
}

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
  const b = await handleResponse(res);

  return {
    id: b.BookID,
    title: b.Title,
    author: b.Author,
    genre: b.Genre,
    totalPages: b.TotalPages,
    yearPublished: b.YearPublished,
    rating: b.Rating,
    status: b.Status,
    notes: b.Notes || null,
    userID: b.UserID
  };
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


// Log pages read for a book
export async function logProgress(bookID, pagesRead) {
  const res = await fetch(`${BASE_URL}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookID, pagesRead })
  });
  return handleResponse(res);
}

// Get latest progress for a book
export async function getProgress(bookID) {
  const res = await fetch(`${BASE_URL}/progress/${bookID}`);
  const data = await handleResponse(res);
  return data.PagesRead || 0;
}

//Goals

// Get all goals for a user
export async function getGoals(userID) {
  const res = await fetch(`${BASE_URL}/goals/${userID}`);
  return handleResponse(res);
}

// Set a new reading goal
export async function setGoal(userID, goalType, targetBooks, year, month) {
  const res = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userID, goalType, targetBooks, year, month: month || null })
  });
  return handleResponse(res);
}

// Update an existing goaltarget
export async function updateGoal(goalID, targetBooks) {
  const res = await fetch(`${BASE_URL}/goals/${goalID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetBooks })
  });
  return handleResponse(res);
}
