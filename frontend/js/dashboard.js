/* ======================================
   DASHBOARD – BACKEND INTEGRATED
   Developed by Satheesh Kumar
====================================== */

document.addEventListener("DOMContentLoaded", async () => {
    // Check if logged in (using localStorage flag directly)
    const logged = localStorage.getItem("bmf_logged") === "true";

    if (!logged) {
        alert("Please login to access your dashboard!");
        window.location.href = "login.html";
        return;
    }

    await loadDashboard();
});

async function loadDashboard() {
    await loadUserProfile();
    await loadDiary();
    await loadStats();
    loadWatchlist();
    loadFavourites();
}

// Load user profile info
async function loadUserProfile() {
    let user = null;

    // Try backend if available
    if (typeof USE_BACKEND !== 'undefined' && USE_BACKEND) {
        try {
            const result = await apiRequest("/user/profile");
            if (result.success) {
                user = result.data;
            }
        } catch (e) {
            console.log("Backend unavailable, using localStorage");
        }
    }

    // Fallback to localStorage
    if (!user) {
        const username = localStorage.getItem("bmf_user") || "User";
        const email = localStorage.getItem("bmf_email") || "";

        const users = JSON.parse(localStorage.getItem("bmf_users") || "[]");
        const userId = localStorage.getItem("bmf_user_id");
        const storedUser = users.find(u => u.id === userId);

        user = {
            username: username,
            email: email,
            bio: storedUser?.bio || ""
        };
    }

    const container = document.getElementById("profileSection");
    if (!container) return;

    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar-large">
                <span>${user.username?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <div class="profile-details">
                <h2>${user.username}</h2>
                <p class="profile-email">${user.email}</p>
                <p class="profile-bio">${user.bio || "No bio yet. Add one in Edit Profile!"}</p>
                <a href="edit-profile.html" class="btn secondary">✏️ Edit Profile</a>
            </div>
        </div>
    `;
}

// Load diary (movie logs)
async function loadDiary() {
    let userLogs = [];
    const userId = localStorage.getItem("bmf_user_id");

    // Use localStorage for logs
    const diary = JSON.parse(localStorage.getItem("bmf_diary") || "[]");
    const oldLogs = JSON.parse(localStorage.getItem("bmf_movie_logs") || "[]");
    const allLogs = [...diary, ...oldLogs];

    // Filter logs for current user
    if (userId) {
        userLogs = allLogs.filter(log => log.userId === userId || log.username === localStorage.getItem("bmf_user"));

        // Remove duplicates by id
        const seen = new Set();
        userLogs = userLogs.filter(log => {
            const key = `${log.id || log.movieId || log.tmdbId}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Sort by date (newest first)
        userLogs.sort((a, b) => new Date(b.watchedAt || b.createdAt) - new Date(a.watchedAt || a.createdAt));
    }

    // Store globally for filtering
    allUserLogs = userLogs;

    const container = document.getElementById("diarySection");
    if (!container) return;

    if (userLogs.length === 0) {
        container.innerHTML = `
            <h2>📓 My Diary</h2>
            <div class="empty-state">
                <span>🎬</span>
                <p>Your movie diary is empty!</p>
                <a href="log-movie.html" class="btn primary">Log Your First Movie</a>
            </div>
        `;
        return;
    }

    // Build filter controls
    const years = getUniqueYears(userLogs);
    const filterHTML = `
        <div class="diary-filters">
            <div class="diary-search-wrapper">
                <input 
                    type="text" 
                    id="diarySearchInput" 
                    placeholder="🔍 Search logged movies..." 
                    onkeyup="searchDiary()"
                    class="diary-search-input"
                />
            </div>
            
            <div class="filter-controls">
                <label class="filter-label">📅 Filter by:</label>
                <select id="diaryFilterType" onchange="updateDiaryFilters()">
                    <option value="all">All Time</option>
                    <option value="year">Year</option>
                    <option value="month">Month</option>
                </select>
                
                <select id="diaryYearFilter" style="display:none" onchange="applyDiaryFilter()">
                    ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
                </select>
                
                <select id="diaryMonthFilter" style="display:none" onchange="applyDiaryFilter()">
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
                
                <button onclick="resetDiaryFilter()" class="btn-reset">🔄 Reset</button>
                <span class="filter-count" id="filterCount"></span>
            </div>
        </div>
    `;

    container.innerHTML = `
        <h2>📓 My Diary (${userLogs.length} entries)</h2>
        ${filterHTML}
        <div class="diary-grid" id="diaryGrid">
            ${userLogs.slice(0, 10).map(log => createDiaryCard(log)).join("")}
        </div>
        ${userLogs.length > 10 ? `<button class="load-more-btn" onclick="showAllDiary()">Show All (${userLogs.length})</button>` : ""}
    `;
}

// Get unique years from logs
function getUniqueYears(logs) {
    const years = new Set();
    logs.forEach(log => {
        const date = new Date(log.watchedAt || log.createdAt);
        years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
}

// Update filter dropdowns visibility
function updateDiaryFilters() {
    const filterType = document.getElementById('diaryFilterType').value;
    const yearFilter = document.getElementById('diaryYearFilter');
    const monthFilter = document.getElementById('diaryMonthFilter');

    if (filterType === 'year') {
        yearFilter.style.display = 'inline-block';
        monthFilter.style.display = 'none';
        applyDiaryFilter();
    } else if (filterType === 'month') {
        yearFilter.style.display = 'inline-block';
        monthFilter.style.display = 'inline-block';
        applyDiaryFilter();
    } else {
        yearFilter.style.display = 'none';
        monthFilter.style.display = 'none';
        renderDiaryGrid(allUserLogs);
    }
}

// Apply diary filter
function applyDiaryFilter() {
    const filterType = document.getElementById('diaryFilterType').value;
    let filteredLogs = allUserLogs;

    if (filterType === 'year') {
        const selectedYear = document.getElementById('diaryYearFilter').value;
        filteredLogs = allUserLogs.filter(log => {
            const logYear = new Date(log.watchedAt || log.createdAt).getFullYear();
            return logYear == selectedYear;
        });
    } else if (filterType === 'month') {
        const selectedYear = document.getElementById('diaryYearFilter').value;
        const selectedMonth = document.getElementById('diaryMonthFilter').value;

        if (!selectedMonth) {
            // If no month selected, show all for selected year
            filteredLogs = allUserLogs.filter(log => {
                const logYear = new Date(log.watchedAt || log.createdAt).getFullYear();
                return logYear == selectedYear;
            });
        } else {
            filteredLogs = allUserLogs.filter(log => {
                const logDate = new Date(log.watchedAt || log.createdAt);
                const logYear = logDate.getFullYear();
                const logMonth = String(logDate.getMonth() + 1).padStart(2, '0');
                return logYear == selectedYear && logMonth === selectedMonth;
            });
        }
    }

    renderDiaryGrid(filteredLogs);
}

// Reset diary filter
function resetDiaryFilter() {
    document.getElementById('diaryFilterType').value = 'all';
    document.getElementById('diaryYearFilter').style.display = 'none';
    document.getElementById('diaryMonthFilter').style.display = 'none';
    document.getElementById('diaryMonthFilter').value = '';
    document.getElementById('diarySearchInput').value = ''; // Clear search
    renderDiaryGrid(allUserLogs);
}

// Render diary grid with filtered logs
function renderDiaryGrid(logs) {
    const grid = document.getElementById('diaryGrid');
    if (!grid) return;

    const filterCount = document.getElementById('filterCount');
    if (filterCount) {
        filterCount.textContent = logs.length !== allUserLogs.length
            ? `(Showing ${logs.length} of ${allUserLogs.length})`
            : '';
    }

    if (logs.length === 0) {
        grid.innerHTML = '<div class="empty-state"><span>🔍</span><p>No logs found for selected period.</p></div>';
        return;
    }

    grid.innerHTML = logs.slice(0, 10).map(log => createDiaryCard(log)).join("");

    // Update or remove "Show All" button
    const existingBtn = grid.nextElementSibling;
    if (existingBtn && existingBtn.classList.contains('load-more-btn')) {
        if (logs.length > 10) {
            existingBtn.textContent = `Show All (${logs.length})`;
            existingBtn.style.display = 'block';
        } else {
            existingBtn.style.display = 'none';
        }
    }
}


// Show all diary entries
function showAllDiary() {
    const grid = document.getElementById('diaryGrid');
    const filterType = document.getElementById('diaryFilterType').value;

    let logsToShow = allUserLogs;
    if (filterType !== 'all') {
        // Reapply current filter to get filtered logs
        applyDiaryFilter();
        return;
    }

    grid.innerHTML = logsToShow.map(log => createDiaryCard(log)).join("");

    const btn = grid.nextElementSibling;
    if (btn && btn.classList.contains('load-more-btn')) {
        btn.style.display = 'none';
    }
}

// Search diary by movie title
function searchDiary() {
    const searchInput = document.getElementById('diarySearchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterType = document.getElementById('diaryFilterType').value;

    // Get filtered logs based on current date filter
    let logsToSearch = allUserLogs;

    if (filterType === 'year') {
        const selectedYear = document.getElementById('diaryYearFilter').value;
        logsToSearch = allUserLogs.filter(log => {
            const logYear = new Date(log.watchedAt || log.createdAt).getFullYear();
            return logYear == selectedYear;
        });
    } else if (filterType === 'month') {
        const selectedYear = document.getElementById('diaryYearFilter').value;
        const selectedMonth = document.getElementById('diaryMonthFilter').value;

        if (selectedMonth) {
            logsToSearch = allUserLogs.filter(log => {
                const logDate = new Date(log.watchedAt || log.createdAt);
                const logYear = logDate.getFullYear();
                const logMonth = String(logDate.getMonth() + 1).padStart(2, '0');
                return logYear == selectedYear && logMonth === selectedMonth;
            });
        } else {
            logsToSearch = allUserLogs.filter(log => {
                const logYear = new Date(log.watchedAt || log.createdAt).getFullYear();
                return logYear == selectedYear;
            });
        }
    }

    // Apply search filter if search term exists
    if (searchTerm) {
        logsToSearch = logsToSearch.filter(log =>
            log.title.toLowerCase().includes(searchTerm)
        );
    }

    renderDiaryGrid(logsToSearch);
}

// Create diary card
function createDiaryCard(log) {
    const watchedAt = log.watchedAt || log.createdAt;
    const watchedDate = new Date(watchedAt);

    // Format full date and time
    const dateStr = watchedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    const timeStr = watchedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const ratingEmojis = ["😡", "😕", "😐", "🙂", "😄", "🔥", "💥", "🤯", "👑", "🐺"];
    const emoji = ratingEmojis[(log.rating || 1) - 1] || "";
    const poster = log.posterPath || log.poster;
    const mediaType = log.mediaType || log.type || "movie";
    const language = log.languageWatched || log.language || "Not specified";

    return `
        <div class="diary-card" onclick="goToDetails(${log.tmdbId || log.movieId}, '${mediaType}')">
            ${poster ? `<img src="${poster}" alt="${log.title}" />` : `<div class="no-poster">🎬</div>`}
            <div class="diary-card-info">
                <h4>${log.title}</h4>
                
                <!-- Log Metadata (Prominent) -->
                <div class="diary-meta-details">
                    <div class="meta-row">
                        <span class="meta-label">⏰ Watched:</span>
                        <span class="meta-value">${dateStr} at ${timeStr}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">🌍 Language:</span>
                        <span class="meta-value">${language}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">⭐ Rating:</span>
                        <span class="meta-value">${emoji} ${log.rating || "N/A"}/10</span>
                    </div>
                </div>
                
                ${log.review ? `
                    <div class="diary-review-full">
                        <span class="review-label">💭 Review:</span>
                        <p>"${log.review}"</p>
                    </div>
                ` : '<p class="no-review">No review written</p>'}
            </div>
        </div>
    `;
}


// Load stats
async function loadStats() {
    let userLogs = [];
    let profileData = null;
    const userId = localStorage.getItem("bmf_user_id");

    if (typeof USE_BACKEND !== 'undefined' && USE_BACKEND) {
        try {
            const logsResult = await apiRequest("/logs");
            if (logsResult.success) userLogs = logsResult.data;

            const profileResult = await apiRequest("/user/profile");
            if (profileResult.success) profileData = profileResult.data;
        } catch (e) {
            console.log("Backend unavailable for stats");
        }
    }

    // Get user logs from localStorage
    if (userLogs.length === 0) {
        const logs = JSON.parse(localStorage.getItem("bmf_movie_logs") || "[]");
        const diary = JSON.parse(localStorage.getItem("bmf_diary") || "[]");
        userLogs = [...logs, ...diary].filter(l => l.userId === userId);
    }

    // Calculate followers/following from localStorage
    let followers = 0;
    let following = 0;

    if (!profileData) {
        const users = JSON.parse(localStorage.getItem("bmf_users") || "[]");
        const currentUser = users.find(u => u.id === userId);

        // Count how many users follow current user
        followers = users.filter(u => {
            if (!u.following) return false;
            const followingList = typeof u.following === 'string' ? u.following.split(',') : u.following;
            return followingList.includes(userId);
        }).length;

        // Count how many users current user follows
        if (currentUser && currentUser.following) {
            const followingList = typeof currentUser.following === 'string'
                ? currentUser.following.split(',').filter(id => id.trim() !== '')
                : currentUser.following;
            following = followingList.length;
        }
    } else {
        followers = profileData.followersCount || 0;
        following = profileData.followingCount || 0;
    }

    const container = document.getElementById("statsSection");
    if (!container) return;

    const totalWatched = userLogs.length;
    const avgRating = totalWatched > 0
        ? (userLogs.reduce((sum, l) => sum + (l.rating || 0), 0) / totalWatched).toFixed(1)
        : 0;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-icon">🎬</span>
                <span class="stat-number">${totalWatched}</span>
                <span class="stat-label">Watched</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">⭐</span>
                <span class="stat-number">${avgRating}</span>
                <span class="stat-label">Avg Rating</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">👥</span>
                <span class="stat-number">${followers}</span>
                <span class="stat-label">Followers</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">👤</span>
                <span class="stat-number">${following}</span>
                <span class="stat-label">Following</span>
            </div>
        </div>
    `;
}

// Load watchlist (localStorage only for now)
function loadWatchlist() {
    const userId = localStorage.getItem("bmf_user_id");
    const allWatchlist = JSON.parse(localStorage.getItem("bmf_watchlist") || "[]");
    const watchlist = allWatchlist.filter(m => m.userId === userId);

    const container = document.getElementById("watchlistSection");
    if (!container) return;

    if (watchlist.length === 0) {
        container.innerHTML = `
            <h2>📋 Watchlist</h2>
            <div class="empty-state small">
                <p>No movies in your watchlist yet!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2>📋 Watchlist (${watchlist.length})</h2>
        <div class="watchlist-row">
            ${watchlist.map(m => `
                <div class="watchlist-item">
                    <img src="${m.poster || 'https://via.placeholder.com/100x150/020b2d/facc15?text=🎬'}" alt="${m.title}" onclick="goToDetails(${m.id}, '${m.type}')" />
                    <span>${m.title}</span>
                    <button class="remove-btn" onclick="removeFromWatchlist(${m.id})" title="Remove">✖</button>
                </div>
            `).join("")}
        </div>
    `;
}

// Load favourites (localStorage only for now)
function loadFavourites() {
    const userId = localStorage.getItem("bmf_user_id");
    const allFavorites = JSON.parse(localStorage.getItem("bmf_favorites") || "[]");
    const favourites = allFavorites.filter(m => m.userId === userId);

    const container = document.getElementById("favouritesSection");
    if (!container) return;

    if (favourites.length === 0) {
        container.innerHTML = `
            <h2>❤️ Favourites</h2>
            <div class="empty-state small">
                <p>No favourite movies yet!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2>❤️ Favourites (${favourites.length})</h2>
        <div class="favourites-row">
            ${favourites.map(m => `
                <div class="favourite-item">
                    <img src="${m.poster}" alt="${m.title}" onclick="goToDetails(${m.id}, '${m.type}')" />
                    <button class="remove-btn" onclick="removeFromFavorites(${m.id})" title="Remove">✖</button>
                </div>
            `).join("")}
        </div>
    `;
}

// Remove from Watchlist
function removeFromWatchlist(id) {
    const userId = localStorage.getItem("bmf_user_id");
    let watchlist = JSON.parse(localStorage.getItem("bmf_watchlist") || "[]");
    watchlist = watchlist.filter(m => !(m.id == id && m.userId === userId));
    localStorage.setItem("bmf_watchlist", JSON.stringify(watchlist));
    loadWatchlist();
}

// Remove from Favorites
function removeFromFavorites(id) {
    const userId = localStorage.getItem("bmf_user_id");
    let favorites = JSON.parse(localStorage.getItem("bmf_favorites") || "[]");
    favorites = favorites.filter(m => !(m.id == id && m.userId === userId));
    localStorage.setItem("bmf_favorites", JSON.stringify(favorites));
    loadFavourites();
}

// Navigate to details
function goToDetails(id, type) {
    window.location.href = `movie-details.html?id=${id}&type=${type}`;
}
