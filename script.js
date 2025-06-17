// --- DEFINE YOUR DATA SOURCE ---
// IMPORTANT: You MUST replace this placeholder with your REAL, LIVE Cloudflare Worker URL.
const MOVIES_DATA_URL = 'https://movie-heaven.digimoviesvault.workers.dev';

// A global variable to hold the original list of all movies.
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
        movieGrid.innerHTML = `<p class="grid-message">Could not load movies. Please check your connection or try again later.</p>`;
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

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredMovies = allMovies.filter(movie => {
        return movie.title && movie.title.toLowerCase().includes(searchTerm);
    });
    displayMovies(filteredMovies);
}

async function initializeApp() {
    const movieGrid = document.getElementById('movie-grid');
    const searchInput = document.getElementById('search-input');

    movieGrid.innerHTML = `<p class="grid-message">Loading movies...</p>`;

    allMovies = await fetchMovies(); 
    displayMovies(allMovies);

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

document.addEventListener('DOMContentLoaded', initializeApp);
