import axios from 'axios';

// Google Books API search
export async function searchExternalBooks(query) {
  if (!query) return [];
  try {
    const res = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults: 10,
      },
    });
    // Map Google Books API data to your book format
    return res.data.items?.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      status: 'Want to Read', // default shelf
      rating: item.volumeInfo.averageRating || 0,
      cover: item.volumeInfo.imageLinks?.thumbnail || '📖',
      totalPages: item.volumeInfo.pageCount || 0,
      yearPublished: item.volumeInfo.publishedDate?.split('-')[0] || 'N/A',
    })) || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}
