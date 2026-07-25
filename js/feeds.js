//For learning purposes, the NewsData.io API key is currently stored directly in the JavaScript file instead of an environment (.env) file.
//I understand that exposing API keys in client-side code is not a recommended practice for production applications. In a real-world project, 
//I would store sensitive API keys securely using environment variables and a backend server or serverless function.

const API_CONFIG = {
    ENDPOINT: 'https://newsdata.io/api/1/latest',
    KEY: 'pub_37cb3f9d1ece4e1da0c15c0d9eda6a24',
    LANGUAGE: 'en'
};

const state = {
    currentCategory: '',
    searchQuery: '',
    nextPageId: null,
    cachedArticles: [],     
    placeholderImage: 'https://via.placeholder.com/600x400/1e293b/f8fafc?text=DailyNewsHub'
};

const DOM = {
    searchField: document.getElementById('news-search'),
    clearSearchBtn: document.getElementById('clear-search'),
    categoryButtons: document.querySelectorAll('.category-btn'),
    container: document.querySelector('.articles-container'),
    loadMoreBtn: document.getElementById('load-more'),
    loadingNode: document.getElementById('feed-loading'),
    errorNode: document.getElementById('feed-error'),
    noResultsNode: document.getElementById('feed-no-results')
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    if (DOM.searchField) {
        DOM.searchField.addEventListener('input', handleSearchInput);
    }
    
    if (DOM.clearSearchBtn) {
        DOM.clearSearchBtn.addEventListener('click', clearSearchAction);
    }
    
    if (DOM.loadMoreBtn) {
        DOM.loadMoreBtn.addEventListener('click', loadMoreNews);
    }
    
    if (DOM.categoryButtons) {
        DOM.categoryButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => filterByCategory(e));
            }
        });
    }

    // Initial API Fetch
    fetchNews();
}

async function fetchNews(appendMode = false) {
    if (!appendMode) {
        showLoading();
        hideError();
        hideNoResults();
        if (DOM.container) {
            DOM.container.innerHTML = '';
        }
        state.cachedArticles = [];
        state.nextPageId = null;
    }

    try {
        let url = `${API_CONFIG.ENDPOINT}?apikey=${API_CONFIG.KEY}&language=${API_CONFIG.LANGUAGE}`;
        
        if (state.currentCategory) {
            url += `&category=${state.currentCategory}`;
        }

        if (state.searchQuery) {
            url += `&q=${encodeURIComponent(state.searchQuery)}`;   // Real API search
        }

        if (state.nextPageId) {
            url += `&page=${state.nextPageId}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP Error Status Encountered: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'error') {
            throw new Error(data.results?.message || 'API processing exception occurred.');
        }

        const articlesReceived = data.results || [];
        state.nextPageId = data.nextPage || null;

        if (articlesReceived.length === 0 && !appendMode) {
            showNoResults();
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.style.display = 'none';
            }
            return;
        }
        state.cachedArticles = [...state.cachedArticles, ...articlesReceived];
        executeRenderWorkflow();

    } catch (error) {
        console.error('App Network/Execution Catch Triggered:', error);
        showError(`Failed to fetch the latest updates. Error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function executeRenderWorkflow() {
    let workingSet = [...state.cachedArticles];

    // Local real-time search filtration matching
    if (state.searchQuery) {
        workingSet = workingSet.filter(article => {
            const searchableTitle = (article.title || '').toLowerCase();
            const searchableDesc = (article.description || '').toLowerCase();
            return searchableTitle.includes(state.searchQuery) || searchableDesc.includes(state.searchQuery);
        });
    }

    if (workingSet.length === 0) {
        showNoResults();
        if (DOM.container) {
            DOM.container.innerHTML = '';
        }
        if (DOM.loadMoreBtn) {
            DOM.loadMoreBtn.style.display = 'none';
        }
    } else {
        hideNoResults();
        renderArticles(workingSet);
        
        if (state.nextPageId) {
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.style.display = 'inline-block';
            }
        } else {
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.style.display = 'none';
            }
        }
    }
}

function renderArticles(newsSet) {
    if (!DOM.container) return;
    DOM.container.innerHTML = ''; 

    newsSet.forEach((article, index) => {
        const cardImage = article.image_url || state.placeholderImage;
        const cardTitle = article.title || 'Untitled Coverage';
        const cardDesc = article.description 
            ? article.description.slice(0, 150) + "..." 
            : "No description available.";
        const cardAuthor = (article.creator && article.creator.length > 0) 
            ? article.creator.join(', ') 
            : 'Unknown Author';
        const cardSource = article.source_id || 'Global News Network';
        const cardCategory = (article.category && article.category.length > 0) 
            ? article.category[0] 
            : 'General';
        
        let cardDate = 'Recent Content';
        if (article.pubDate) {
            try {
                const parsedDate = new Date(article.pubDate);
                cardDate = parsedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            } catch(e) {}
        }

        // Unified navigation function
        function navigateToArticleDetail(article) {
            try {
                localStorage.setItem(
                    'selectedArticle',
                    JSON.stringify(article)
                );

                window.location.href = 'articles.html';

            } catch (error) {
                console.error(
                    'Unable to save selected article:',
                    error
                );

                showError(
                    'Unable to open the article. Please try again.'
                );
            }
        }

        // Secure DOM creation (No innerHTML)
        const articleCard = document.createElement('article');
        articleCard.className = 'feed-card-item';

        // Media Wrapper
        const mediaWrapper = document.createElement('div');
        mediaWrapper.className = 'card-media-wrapper';

        const cardImg = document.createElement('img');
        cardImg.className = 'card-img';
        cardImg.loading = 'lazy';
        cardImg.src = cardImage;
        cardImg.alt = cardTitle;
        // Improved image fallback
        cardImg.onerror = () => {
            if (cardImg.src !== state.placeholderImage) {
                cardImg.src = state.placeholderImage;
            }
        };

        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'card-badge-category';
        categoryBadge.textContent = cardCategory.toUpperCase();

        mediaWrapper.appendChild(cardImg);
        mediaWrapper.appendChild(categoryBadge);

        // Body Wrapper
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'card-body-wrapper';

        const metaUpper = document.createElement('div');
        metaUpper.className = 'card-meta-upper';

        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'card-source';
        sourceSpan.textContent = cardSource;

        const divider = document.createElement('span');
        divider.className = 'card-divider';
        divider.textContent = '•';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'card-date';
        dateSpan.textContent = cardDate;

        metaUpper.append(sourceSpan, divider, dateSpan);

        const headline = document.createElement('h3');
        headline.className = 'card-headline-title';
        headline.textContent = cardTitle;

        const excerpt = document.createElement('p');
        excerpt.className = 'card-excerpt-text';
        excerpt.textContent = cardDesc;

        const footerLower = document.createElement('div');
        footerLower.className = 'card-footer-lower';

        const byline = document.createElement('span');
        byline.className = 'card-byline';
        byline.textContent = `By: ${cardAuthor}`;

        const readBtn = document.createElement('button');
        readBtn.type = 'button';
        readBtn.className = 'btn-read-story';
        readBtn.textContent = 'Read More';
        // Improved accessibility with aria-label
        readBtn.setAttribute('aria-label', `Read more about ${cardTitle}`);
        readBtn.addEventListener('click', () => navigateToArticleDetail(article));

        footerLower.append(byline, readBtn);

        bodyWrapper.append(metaUpper, headline, excerpt, footerLower);

        articleCard.append(mediaWrapper, bodyWrapper);

        DOM.container.appendChild(articleCard);
    });
}

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

const debouncedSearch = debounce(async (searchTerm) => {
    state.searchQuery = searchTerm;

    if (DOM.clearSearchBtn && state.searchQuery.length > 0) {
        DOM.clearSearchBtn.style.display = 'block';
    } else if (DOM.clearSearchBtn) {
        DOM.clearSearchBtn.style.display = 'none';
    }

    // Reset pagination when search changes
    state.nextPageId = null;
    state.cachedArticles = [];

    await fetchNews(); 
}, 500);   

function handleSearchInput(e) {
    const searchTerm = e.target.value.trim();
    debouncedSearch(searchTerm);
}

function clearSearchAction() {
    if (DOM.searchField) {
        DOM.searchField.value = '';
    }
    state.searchQuery = '';
    if (DOM.clearSearchBtn) {
        DOM.clearSearchBtn.style.display = 'none';
    }
    state.nextPageId = null;
    fetchNews();
}

function filterByCategory(event) {
    const chosenButton = event.currentTarget;
    if (!chosenButton) return;
    
    const newCategorySelection = chosenButton.getAttribute('data-category');

    if (state.currentCategory === newCategorySelection) return;

    if (DOM.categoryButtons) {
        DOM.categoryButtons.forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
    }
    chosenButton.classList.add('active');

    // Set systemic runtime execution value
    state.currentCategory = newCategorySelection;

    fetchNews();
}

function loadMoreNews() {
    if (state.nextPageId) {
        fetchNews(true); 
    }
}

function showLoading() { 
    if (DOM.loadingNode) {
        DOM.loadingNode.style.display = 'block'; 
    }
}
function hideLoading() { 
    if (DOM.loadingNode) {
        DOM.loadingNode.style.display = 'none'; 
    }
}

function showError(msg) {
    if (DOM.errorNode) {
        DOM.errorNode.textContent = msg;
        DOM.errorNode.style.display = 'block';
    }
}
function hideError() {
    if (DOM.errorNode) {
        DOM.errorNode.textContent = '';
        DOM.errorNode.style.display = 'none';
    }
}

function showNoResults() { 
    if (DOM.noResultsNode) {
        DOM.noResultsNode.style.display = 'block'; 
    }
}
function hideNoResults() { 
    if (DOM.noResultsNode) {
        DOM.noResultsNode.style.display = 'none'; 
    }
}