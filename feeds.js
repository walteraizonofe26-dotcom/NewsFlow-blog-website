//For learning purposes, the NewsData.io API key is currently stored directly in the JavaScript file instead of an environment (.env) file.
//I understand that exposing API keys in client-side code is not a recommended practice for production applications. In a real-world project, 
//I would store sensitive API keys securely using environment variables and a backend server or serverless function.

        const API_CONFIG = {
            ENDPOINT: 'https://newsdata.io/api/1/news',
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
            
            DOM.searchField.addEventListener('input', handleSearchInput);
            DOM.clearSearchBtn.addEventListener('click', clearSearchAction);
            DOM.loadMoreBtn.addEventListener('click', loadMoreNews);
            
            DOM.categoryButtons.forEach(btn => {
                btn.addEventListener('click', (e) => filterByCategory(e));
            });

            // Initial API Fetch
            fetchNews();
        }

        async function fetchNews(appendMode = false) {
            if (!appendMode) {
                showLoading();
                hideError();
                hideNoResults();
                DOM.container.innerHTML = '';
                state.cachedArticles = [];
                state.nextPageId = null;
            }

            try {
                
                let url = `${API_CONFIG.ENDPOINT}?apikey=${API_CONFIG.KEY}&language=${API_CONFIG.LANGUAGE}`;
                
                if (state.currentCategory) {
                    url += `&category=${state.currentCategory}`;
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
                    DOM.loadMoreBtn.style.display = 'none';
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

            // Empty container evaluations
            if (workingSet.length === 0) {
                showNoResults();
                DOM.container.innerHTML = '';
                DOM.loadMoreBtn.style.display = 'none';
            } else {
                hideNoResults();
                renderArticles(workingSet);
                
                if (state.nextPageId) {
                    DOM.loadMoreBtn.style.display = 'inline-block';
                } else {
                    DOM.loadMoreBtn.style.display = 'none';
                }
            }
        }

        function renderArticles(newsSet) {
            DOM.container.innerHTML = ''; 

            newsSet.forEach((article, index) => {
                // Formatting fallback variables safety checks
                const cardImage = article.image_url || state.placeholderImage;
                const cardTitle = article.title || 'Untitled Coverage';
                const cardDesc = article.description || 'No description available.';
                const cardAuthor = (article.creator && article.creator.length > 0) ? article.creator.join(', ') : 'Unknown Author';
                const cardSource = article.source_id || 'Global News Network';
                const cardCategory = (article.category && article.category.length > 0) ? article.category[0] : 'General';
                
                // Date extraction processing safely
                let cardDate = 'Recent Content';
                if (article.pubDate) {
                    try {
                        const parsedDate = new Date(article.pubDate);
                        cardDate = parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    } catch(e) { cardDate = article.pubDate; }
                }

                // Generating DOM structure cleanly using string template literals
                const articleCard = document.createElement('article');
                articleCard.className = 'feed-card-item';
                
                articleCard.innerHTML = `
                    <div class="card-media-wrapper">
                        <img src="${cardImage}" alt="${cardTitle}" class="card-img" loading="lazy">
                        <span class="card-badge-category">${cardCategory.toUpperCase()}</span>
                    </div>
                    <div class="card-body-wrapper">
                        <div class="card-meta-upper">
                            <span class="card-source">${cardSource}</span>
                            <span class="card-divider">•</span>
                            <span class="card-date">${cardDate}</span>
                        </div>
                        <h3 class="card-headline-title">${cardTitle}</h3>
                        <p class="card-excerpt-text">${cardDesc}</p>
                        <div class="card-footer-lower">
                            <span class="card-byline">By: ${cardAuthor}</span>
                            <button type="button" class="btn-read-story" data-index="${index}">Read More</button>
                        </div>
                    </div>
                `;

    
                const readBtn = articleCard.querySelector('.btn-read-story');
                readBtn.addEventListener('click', () => {
                    navigateToArticleDetail(article);
                });

                DOM.container.appendChild(articleCard);
            });
        }

    
        function navigateToArticleDetail(articleObject) {
            try {
                localStorage.setItem('selectedArticle', JSON.stringify(articleObject));
                window.location.href = 'articles.html';
            } catch (storageError) {
                console.error('LocalStorage write execution access failed:', storageError);
                alert('Unable to load full article view. Local storage permissions might be disabled.');
            }
        }

        function handleSearchInput(e) {
            state.searchQuery = e.target.value.toLowerCase().trim();
            
            if (state.searchQuery.length > 0) {
                DOM.clearSearchBtn.style.display = 'block';
            } else {
                DOM.clearSearchBtn.style.display = 'none';
            }

            executeRenderWorkflow();
        }

        function clearSearchAction() {
            DOM.searchField.value = '';
            state.searchQuery = '';
            DOM.clearSearchBtn.style.display = 'none';
            executeRenderWorkflow();
        }

        function filterByCategory(event) {
            const chosenButton = event.currentTarget;
            const newCategorySelection = chosenButton.getAttribute('data-category');

            if (state.currentCategory === newCategorySelection) return;

            DOM.categoryButtons.forEach(btn => btn.classList.remove('active'));
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

        function showLoading() { DOM.loadingNode.style.display = 'block'; }
        function hideLoading() { DOM.loadingNode.style.display = 'none'; }
        
        function showError(msg) {
            DOM.errorNode.textContent = msg;
            DOM.errorNode.style.display = 'block';
        }
        function hideError() {
            DOM.errorNode.textContent = '';
            DOM.errorNode.style.display = 'none';
        }

        function showNoResults() { DOM.noResultsNode.style.display = 'block'; }
        function hideNoResults() { DOM.noResultsNode.style.display = 'none'; }
