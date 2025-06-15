// --- DEFINE YOUR DATA SOURCE ---
// IMPORTANT: Replace this placeholder with the real URL of your Cloudflare Worker.
const MOVIES_DATA_URL = 'https://your-api-url.workers.dev';

/* 
 * This script expects your movies.json file on GitHub to have four fields:
 * [
 *   {
 *     "thumbnailUrl": "URL_TO_THE_POSTER_IMAGE",
 *     "redirectUrl": "URL_TO_THE_VIDEO_OR_WEBSITE",
 *     "title": "The Movie's Title",
 *     "year": "2023"
 *   }
 * ]
 */

/**
 * Fetches movie data from your API.
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
        movieGrid.innerHTML = `<p class="grid-message">Could not load movies. Please try again later.</p>`;
        return [];
    }
}

/**
 * Creates a single movie card element with the hover information.
 * @param {object} movie - A movie object with title, year, thumbnailUrl, and redirectUrl.
 * @returns {HTMLElement} The complete movie card element.
 */
function createMovieCard(movie) {
    const movieCard = document.createElement('a');
    movieCard.className = 'movie-card';
    movieCard.href = movie.redirectUrl;
    movieCard.target = '_blank';
    movieCard.rel = 'noopener noreferrer';

    // This block builds the HTML for each card, including the hidden hover info.
    movieCard.innerHTML = `
        <img src="${movie.thumbnailUrl}" alt="${movie.title || 'Movie Poster'}" onerror="this.src='https://via.placeholder.com/200x300?text=Image+Not+Found'">
        <div class="movie-info">
            <div class="movie-title">${movie.title || ''}</div>
            <div class="movie-year">${movie.year || ''}</div>
        </div>
    `;
    
    return movieCard;
}

/**
 * Renders the full list of movies into the grid on the webpage.
 * @param {Array} movies - An array of movie objects.
 */
function displayMovies(movies) {
    const movieGrid = document.getElementById('movie-grid');
    movieGrid.innerHTML = ''; // Clear any "Loading..." message.

    if (!movies || movies.length === 0) {
        movieGrid.innerHTML = `<p class="grid-message">No movies found.</p>`;
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieGrid.appendChild(movieCard);
    });
}

/**
 * The main function that runs when the page loads.
 */
async function initializeApp() {
    const movieGrid = document.getElementById('movie-grid');
    movieGrid.innerHTML = `<p class="grid-message">Loading movies...</p>`;

    const movies = await fetchMovies();
    displayMovies(movies);

    setupStaticLinks();
}

/**
 * A helper function to make sure all other links on the page work.
 */
function setupStaticLinks() {
    const links = document.querySelectorAll('.nav-link, .watch-now-btn, .my-list-btn, .footer-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // You can change this default link later if you want.
            window.open('https://www.youtube.com/@techpk3013', '_blank');
        });
    });
}

// Adds the "scrolled" effect to the header when you scroll down.
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// This line starts the entire process once the webpage is ready.
document.addEventListener('DOMContentLoaded', initializeApp);
