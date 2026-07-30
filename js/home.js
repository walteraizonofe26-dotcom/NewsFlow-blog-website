//For learning purposes, the NewsData.io API key is currently stored directly in the JavaScript file instead of an environment (.env) file.
//I understand that exposing API keys in client-side code is not a recommended practice for production applications. In a real-world project, 
//I would store sensitive API keys securely using environment variables and a backend server or serverless function.

// 1. CONSTANTS & CONFIGURATION
const API_CONFIG = {
    ENDPOINT: 'https://newsdata.io/api/1/latest',
    KEY: 'pub_37cb3f9d1ece4e1da0c15c0d9eda6a24',
    LANGUAGE: 'en'
};

const UI_STRINGS = {
    DEFAULT_DESCRIPTION: 'No description available.',
    DEFAULT_AUTHOR: 'Unknown Author',
    DEFAULT_CATEGORY: 'General',
    DEFAULT_SOURCE: 'Global Feed',
    PLACEHOLDER_IMAGE: 'https://via.placeholder.com/600x400/1e293b/f8fafc?text=DailyNewsHub',
    MSG_LOADING: 'Loading breaking stories...',
    MSG_ERROR: 'Unable to load news at this moment. Please try again later.',
    MSG_EMPTY: 'No articles available matching the selected criteria.'
};

const DOM = {
    articlesGrid: document.querySelector('.articles-grid'),
    categoryButtons: document.querySelectorAll('.categories-filter-wrapper .category-btn'),
    heroSection: document.querySelector('.hero-section'),
    headlinesSection: document.querySelector('#headlines')
};

const AppState = {
    currentCategory: ''
};

// 3. UTILITY FUNCTIONS
/**
 * Safely parses and humanizes ISO timestamps without external libraries.
 * @param {string} dateString 
 * @returns {string} Formatted localized date or fallback string
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Recent Content';
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return dateString;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Recent Content';
    }
};

/**
 * Encapsulates client-side persistent serialization layer securely.
 * @param {Object} article 
 */
const saveSelectedArticle = (article) => {
    try {
        localStorage.setItem('selectedArticle', JSON.stringify(article));
    } catch (error) {
        console.error('Failed to commit article data to local persistence storage Layer:', error);
    }
};

// 4. RENDERING FUNCTIONS
const clearGrid = () => {
    if (DOM.articlesGrid) {
        DOM.articlesGrid.innerHTML = '';
    }
};

const showLoading = () => {
    clearGrid();
    const loadingElement = document.createElement('div');
    loadingElement.className = 'status-msg status-loading';
    loadingElement.textContent = UI_STRINGS.MSG_LOADING;
    if (DOM.articlesGrid) {
        DOM.articlesGrid.appendChild(loadingElement);
    }
};

const showError = (message) => {
    clearGrid();
    const errorElement = document.createElement('div');
    errorElement.className = 'status-msg status-error';
    errorElement.textContent = message || UI_STRINGS.MSG_ERROR;
    if (DOM.articlesGrid) {
        DOM.articlesGrid.appendChild(errorElement);
    }
};

const showEmptyState = () => {
    clearGrid();
    const emptyElement = document.createElement('div');
    emptyElement.className = 'status-msg status-empty';
    emptyElement.textContent = UI_STRINGS.MSG_EMPTY;
    if (DOM.articlesGrid) {
        DOM.articlesGrid.appendChild(emptyElement);
    }
};

/**
 * Creates, configures, and hooks up an article card utilizing node generation.
 * Mitigates DOM injection vulnerabilities entirely.
 * @param {Object} article 
 * @returns {HTMLElement} Custom programmatic layout matching feeds/home specifications
 */
const createArticleCard = (article) => {
    const imageUrl = article.image_url ?? UI_STRINGS.PLACEHOLDER_IMAGE;
    const titleText = article.title ?? 'Untitled Coverage';
    const descriptionText = article.description ?? UI_STRINGS.DEFAULT_DESCRIPTION;
    const dateText = formatDate(article.pubDate);
    const sourceText = article.source_id ?? UI_STRINGS.DEFAULT_SOURCE;
    const categoryText = (article.category && article.category.length > 0)
        ? article.category[0]
        : UI_STRINGS.DEFAULT_CATEGORY;

    const cardElement = document.createElement('article');
    cardElement.className = 'feed-card-item';

    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = 'card-media-wrapper';

    const cardImg = document.createElement('img');
    cardImg.className = 'card-img';
    cardImg.setAttribute('loading', 'lazy');
    cardImg.setAttribute('src', imageUrl);
    cardImg.setAttribute('alt', titleText);
    cardImg.onerror = () => {
        if (cardImg.src !== UI_STRINGS.PLACEHOLDER_IMAGE) {
            cardImg.src = UI_STRINGS.PLACEHOLDER_IMAGE;
        }
    };

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'card-badge-category';
    categoryBadge.textContent = categoryText.toUpperCase();

    mediaWrapper.appendChild(cardImg);
    mediaWrapper.appendChild(categoryBadge);

    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'card-body-wrapper';

    const metaUpper = document.createElement('div');
    metaUpper.className = 'card-meta-upper';

    const sourceSpan = document.createElement('span');
    sourceSpan.className = 'card-source';
    sourceSpan.textContent = sourceText;

    const dividerSpan = document.createElement('span');
    dividerSpan.className = 'card-divider';
    dividerSpan.textContent = '•';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'card-date';
    dateSpan.textContent = dateText;

    metaUpper.appendChild(sourceSpan);
    metaUpper.appendChild(dividerSpan);
    metaUpper.appendChild(dateSpan);

    const headline = document.createElement('h3');
    headline.className = 'card-headline-title';
    headline.textContent = titleText;

    const excerpt = document.createElement('p');
    excerpt.className = 'card-excerpt-text';
    excerpt.textContent = descriptionText;

    // Footer Block Setup
    const footerLower = document.createElement('div');
    footerLower.className = 'card-footer-lower';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'card-byline';
    const authors = (article.creator && article.creator.length > 0) ? article.creator.join(', ') : UI_STRINGS.DEFAULT_AUTHOR;
    authorSpan.textContent = `By: ${authors}`;

    const readMoreBtn = document.createElement('button');
    readMoreBtn.setAttribute('type', 'button');
    readMoreBtn.className = 'btn-read-story';
    readMoreBtn.textContent = 'Read More';
    readMoreBtn.setAttribute('aria-label', `Read more about ${titleText}`);

    readMoreBtn.addEventListener('click', () => handleArticleNavigation(article));

    footerLower.appendChild(authorSpan);
    footerLower.appendChild(readMoreBtn);

    bodyWrapper.appendChild(metaUpper);
    bodyWrapper.appendChild(headline);
    bodyWrapper.appendChild(excerpt);
    bodyWrapper.appendChild(footerLower);

    cardElement.appendChild(mediaWrapper);
    cardElement.appendChild(bodyWrapper);

    return cardElement;
};

const renderArticles = (articlesArray) => {
    clearGrid();

    if (!articlesArray || articlesArray.length === 0) {
        showEmptyState();
        return;
    }

    if (DOM.articlesGrid) {
        DOM.articlesGrid.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    const fragment = document.createDocumentFragment();
    articlesArray.forEach(article => {
        const cardNode = createArticleCard(article);
        fragment.appendChild(cardNode);
    });

    if (DOM.articlesGrid) {
        DOM.articlesGrid.appendChild(fragment);
    }
};

// 5. API LAYER FUNCTIONS
/**
 * Asynchronously interacts with the backend NewsData ecosystem.
 * @param {string} category Filter category route parameters
 * @returns {Promise<Array>} Normalized dynamic array processing layer
 */
const fetchLatestNews = async (category = '') => {
    console.info('Fetching latest news...');
    let url = `${API_CONFIG.ENDPOINT}?apikey=${API_CONFIG.KEY}&language=${API_CONFIG.LANGUAGE}`;

    if (category) {
        url += `&category=${category}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Network returned bad response context status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'error') {
        throw new Error(data.results?.message || 'API process exception thrown.');
    }

    return data.results ?? [];
};

// 6. EVENT FUNCTIONS
const handleArticleNavigation = (article) => {
    saveSelectedArticle(article);
    window.location.href = 'articles.html';
};

const handleCategoryClick = async (event) => {
    const targetButton = event.currentTarget;
    if (!targetButton) return;
    
    const selectedCategory = targetButton.getAttribute('data-category') ?? '';

    if (AppState.currentCategory === selectedCategory) return;

    AppState.currentCategory = selectedCategory;

    if (DOM.categoryButtons) {
        DOM.categoryButtons.forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
    }
    targetButton.classList.add('active');

    const headlinesElement = document.querySelector("#headlines");
    if (headlinesElement) {
        headlinesElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    showLoading();
    try {
        const articles = await fetchLatestNews(AppState.currentCategory);
        renderArticles(articles);
        console.info('News loaded successfully.');
    } catch (error) {
        console.error('Category tracking execution context pipeline failed: ', error);
        showError(UI_STRINGS.MSG_ERROR);
    }
};

const initHomePage = async () => {
    if (!DOM.articlesGrid) {
        console.error('Core critical component anchor structure element not found. Initialization sequence halted.');
        return;
    }

    if (DOM.categoryButtons) {
        DOM.categoryButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', handleCategoryClick);
                if (btn.getAttribute('data-category') === '') {
                    btn.classList.add('active');
                }
            }
        });
    }

    showLoading();
    try {
        const initialArticles = await fetchLatestNews();
        renderArticles(initialArticles);
        console.info('News loaded successfully.');
    } catch (error) {
        console.error('Initialization application thread runtime exception caught: ', error);
        showError(UI_STRINGS.MSG_ERROR);
    }
};

history.scrollRestoration = "manual";
window.scrollTo(0, 0); 

// Ignite System Pipeline Execution
initHomePage();