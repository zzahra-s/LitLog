import axios from 'axios';//axios → a library used to make HTTP requests (talk to APIs / servers)

// Google Books API search
//export → makes this function usable in other files
//async → this function will do something that takes time (like calling an API)
//(query) → input to the function (what the user searches, like "Harry Potter")
export async function searchExternalBooks(query) {
  if (!query) return [];//If user didn’t type anything, return no books.
  try {
//API CALL------
//axios.get(...) → make a GET request (fetch data)
//params → query parameters sent to API
//q: query → search term (like "Harry Potter")
//maxResults: 10 → return max 10 books
    const res = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        maxResults: 10,
      },
    });

    // Map Google Books API data to your book format
    //first line meaning:
    //send data back from function(return),which was actual response from API(res.data) 
    // as list(.items) ?. → optional chaining (prevents crash if items is undefined)
    //.map(...) → loop through each book
    //item => (...) → for each book, create a new object
    //so “Take each book from API and convert it into our format.”
    return res.data.items?.map(item => ({
      //MAPPING EACH BOOK
      id: item.id,
      title: item.volumeInfo.title,

//authors → array like ["J.K. Rowling"],?. → safe access
//.join(', ') → convert array into string
//|| 'Unknown' → if no author, use "Unknown"
//eg ["A", "B"] → "A, B"
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      status: 'Want to Read', // default shelf
      rating: item.volumeInfo.averageRating || 0,//averageRating → rating from API, if none given put 0
      cover: item.volumeInfo.imageLinks?.thumbnail || '📖',//imageLinks.thumbnail → book cover image,if not present show emoji
      totalPages: item.volumeInfo.pageCount || 0,//if missing → 0
      yearPublished: item.volumeInfo.publishedDate?.split('-')[0] || 'N/A',
      genre: 'Unknown',  
       notes: null,       
    })) || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}