// --- STEP 1: DEFINE YOUR DATA SOURCE ---
// Replace this URL with the URL of your own Cloudflare Worker.
const MOVIES_DATA_URL = 'https://my-movie-api.your-username.workers.dev';

/* 
 * Your movies.json file on GitHub should look like this:
 * An array of objects, where each object has a `thumbnailUrl` and a `redirectUrl`.
 *
 * [
 *   {
 *     "thumbnailUrl": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
 *     "redirectUrl": "https://www.youtube.com/watch?v=some_video_id"
 *   },
 *   {
 *     "thumbnailUrl": "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
 *     "redirectUrl": "https://www.another-video-site.com/watch/12345"
 *   }
 * ]
 */

// --- STEP 2: DYNAMICALLY CREATE AND DISPLAY MOVIE CARDS ---

/**
 * Fetches movie data from the specified URL.
 * @returns {Promise<Array>} A promise that resolves to an array of movie objects.
 */
async function fetchMovies() {
    const movieGrid = document.getElementById('movie-grid');
    try {
        const response = await fetch(MOVIES_DATA_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok (status: ${response.status})`);
        }
        const movies = await response.json();
        return movies;
    } catch (error) {
        console.error('Failed to fetch movies:', error);
        // Display an error message to the user in the grid
        movieGrid.innerHTML = `<p class="grid-message">Could not load movies. Please try again later.</p>`;
        return []; // Return an empty array on failure
    }
}

/**
 * Creates a single movie card element.
 * @param {object} movie - A movie object with `thumbnailUrl` and `redirectUrl`.
 * @returns {HTMLElement} The movie card element.
 */
function createMovieCard(movie) {
    const movieCard = document.createElement('a'); // Changed to an anchor tag for semantics
    movieCard.className = 'movie-card';
    movieCard.href = movie.redirectUrl; // Set the redirect URL
    movieCard.target = '_blank'; // Ensure it opens in a new tab
    movieCard.rel = 'noopener noreferrer';

    // Use the thumbnail URL from the data. Add a placeholder in case of error.
    movieCard.innerHTML = `
        <img src="${movie.thumbnailUrl}" alt="Movie Poster" onerror="this.src='https://via.placeholder.com/200x300?text=Image+Not+Found'">
    `;
    
    return movieCard;
}

/**
 * Renders a list of movies into the main grid.
 * @param {Array} movies - An array of movie objects.
 */
function displayMovies(movies) {
    const movieGrid = document.getElementById('movie-grid');
    
    // Clear any previous content (like loading or error messages)
    movieGrid.innerHTML = '';

    if (!movies || movies.length === 0) {
        movieGrid.innerHTML = `<p class="grid-message">No movies found.</p>`;
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieGrid.appendChild(movieCard);
    });
}

// --- STEP 3: INITIALIZE THE APPLICATION ---

/**
 * The main function to initialize the page.
 */
async function initializeApp() {
    const movieGrid = document.getElementById('movie-grid');
    movieGrid.innerHTML = `<p class="grid-message">Loading movies...</p>`;

    const movies = await fetchMovies();
    displayMovies(movies);

    // Setup other links (optional, if they have a consistent target)
    setupStaticLinks();
}

/**
 * Function to handle all static link clicks (header, footer, etc.).
 */
function setupStaticLinks() {
    const links = document.querySelectorAll('.nav-link, .watch-now-btn, .my-list-btn, .footer-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // You can set a default link for these, or handle them differently
            window.open('https://www.youtube.com/@techpk3013', '_blank');
        });
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
