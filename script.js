// --- DEFINE YOUR DATA SOURCE ---
// IMPORTANT: Replace this placeholder with your real, live Cloudflare Worker URL.
// Example: const MOVIES_DATA_URL = 'https://my-movies-api.your-username.workers.dev';
const MOVIES_DATA_URL = 'https://your-real-api-url.workers.dev';

// A global variable to hold the original list of all movies, so we don't have to re-fetch it.
let allMovies = [];

// --- HELPER FUNCTIONS ---
function getYouTubeVideoID(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function getYouTubeThumbnailUrl(videoID) {
    if (!videoID) return null;
    return `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`;
}

// --- MAIN APPLICATION LOGIC ---
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
        movieGrid.innerHTML = `<p class="grid-message">Could not load movies. Please check the API URL and your internet connection.</p>`;
        return [];
    }
}

function createMovieCard(movie) {
    const movieCard = document.createElement('a');
    movieCard.className = 'movie-card';
    movieCard.href = movie.redirectUrl;
    movieCard.target = '_blank';
    movieCard.rel = 'noopener noreferrer';

    let finalThumbnailUrl = 'https://via.placeholder.com/200x300?text=Image+Not+Found';

    if (movie.thumbnailUrl && movie.thumbnailUrl.trim() !== '') {
        finalThumbnailUrl = movie.thumbnailUrl;
    } else {
        const videoID = getYouTubeVideoID(movie.redirectUrl);
        if (videoID) {
            finalThumbnailUrl = getYouTubeThumbnailUrl(videoID);
        }
    }
    
    movieCard.innerHTML = `
        <img src="${finalThumbnailUrl}" alt="${movie.title || 'Movie Poster'}" onerror="this.src='https://via.placeholder.com/200x300?text=Image+Not+Found'">
        <div class="movie-info">
            <div class="movie-title">${movie.title || ''}</div>
            <div class="movie-year">${movie.year || ''}</div>
        </div>
    `;
    
    return movieCard;
}

function displayMovies(movies) {
    const movieGrid = document.getElementById('movie-grid');
    movieGrid.innerHTML = '';

    if (!movies || movies.length === 0) {
        movieGrid.innerHTML = `<p class="grid-message">No movies found matching your search.</p>`;
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieGrid.appendChild(movieCard);
    });
}

/**
 * Handles the search functionality by filtering the master list of movies.
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();

    const filteredMovies = allMovies.filter(movie => {
        // This ensures the movie has a title before trying to search it.
        return movie.title && movie.title.toLowerCase().includes(searchTerm);
    });

    displayMovies(filteredMovies);
}

/**
 * The main function that runs when the page loads.
 */
async function initializeApp() {
    const movieGrid = document.getElementById('movie-grid');
    const searchInput = document.getElementById('search-input');

    movieGrid.innerHTML = `<p class="grid-message">Loading movies...</p>`;

    // Fetch all movies and store them in our global "master list".
    allMovies = await fetchMovies(); 
    
    // Display all movies for the first time.
    displayMovies(allMovies);

    // Add the event listener to the search bar that calls handleSearch every time you type.
    searchInput.addEventListener('input', handleSearch);

    setupStaticLinks();
}

function setupStaticLinks() {
    const links = document.querySelectorAll('.nav-link, .watch-now-btn, .my-list-btn, .footer-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://www.youtube.com/@techpk3013', '_blank');
        });
    });
}

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// This line starts the entire application once the webpage is ready.
document.addEventListener('DOMContentLoaded', initializeApp);
