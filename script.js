// --- DEFINE YOUR DATA SOURCE ---
// IMPORTANT: Replace this placeholder with the real URL of your Cloudflare Worker.
const MOVIES_DATA_URL = 'https://movie-heaven.digimoviesvault.workers.dev';

/* 
 * This script expects your movies.json file on GitHub to have four fields:
 * [
 *   {
 *     "thumbnailUrl": "URL_TO_THE_POSTER_IMAGE_OR_LEAVE_BLANK",
 *     "redirectUrl": "URL_TO_THE_VIDEO_OR_WEBSITE",
 *     "title": "The Movie's Title",
 *     "year": "2023"
 *   }
 * ]
 */

// --- HELPER FUNCTIONS FOR YOUTUBE THUMBNAILS ---

/**
 * Extracts the video ID from various YouTube URL formats.
 * @param {string} url - The full YouTube URL.
 * @returns {string|null} The 11-character video ID, or null if not found.
 */
function getYouTubeVideoID(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Generates a high-quality YouTube thumbnail URL from a video ID.
 * @param {string} videoID - The YouTube video ID.
 * @returns {string|null} The full thumbnail URL, or null if no ID is provided.
 */
function getYouTubeThumbnailUrl(videoID) {
    if (!videoID) return null;
    return `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`;
}


// --- MAIN APPLICATION LOGIC ---

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
 * Creates a single movie card element with the new "smart" thumbnail logic.
 * @param {object} movie - A movie object.
 * @returns {HTMLElement} The complete movie card element.
 */
function createMovieCard(movie) {
    const movieCard = document.createElement('a');
    movieCard.className = 'movie-card';
    movieCard.href = movie.redirectUrl;
    movieCard.target = '_blank';
    movieCard.rel = 'noopener noreferrer';

    // --- "SMART" THUMBNAIL LOGIC ---
    let finalThumbnailUrl = 'https://via.placeholder.com/200x300?text=Image+Not+Found'; // Default placeholder

    // Priority 1: Use the provided thumbnailUrl if it exists.
    if (movie.thumbnailUrl && movie.thumbnailUrl.trim() !== '') {
        finalThumbnailUrl = movie.thumbnailUrl;
    }
    // Priority 2: If no thumbnailUrl, try to get one from a YouTube redirectUrl.
    else {
        const videoID = getYouTubeVideoID(movie.redirectUrl);
        if (videoID) {
            finalThumbnailUrl = getYouTubeThumbnailUrl(videoID);
        }
    }
    
    // This block builds the HTML for each card, including the hidden hover info.
    movieCard.innerHTML = `
        <img src="${finalThumbnailUrl}" alt="${movie.title || 'Movie Poster'}" onerror="this.src='https://via.placeholder.com/200x300?text=Image+Not+Found'">
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
