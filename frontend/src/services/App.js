import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Library from './Pages/Library';
import BookDetails from './Pages/BookDetails';
import Dashboard from './Pages/Dashboard';
import BookShelves from './Pages/BookShelves';
import ProgressTracker from './Pages/ProgressTracker';
import Recommendations from './Pages/Recommendations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/library"        element={<Library />} />
        <Route path="/bookdetails/:id" element={<BookDetails />} />
        <Route path="/bookshelves"    element={<BookShelves />} />
        <Route path="/progress"       element={<ProgressTracker />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;