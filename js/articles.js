'use strict';

// 1. REUSABLE CONFIGURATION & APP STRINGS
const APP_CONFIG = {
    STORAGE_KEY: 'selectedArticle',
    ROUTE_HOME: 'home.html',
    ROUTE_FEEDS: 'feeds.html',
    FALLBACK_IMAGE: 'https://via.placeholder.com/900x500/1e293b/f8fafc?text=DailyNewsHub+Coverage'
};

const TEXT_STRINGS = {
    DEFAULT_SOURCE: 'Verified Publisher',
    DEFAULT_CATEGORY: 'General News',
    DEFAULT_AUTHOR: 'Unknown Author',
    DEFAULT_DESCRIPTION: 'No additional overview summary metrics provided for this story tracking stream.',
    NOTICE_EXTERNAL: 'To read the complete story, visit the original publisher using the link provided below.'
};

const rootTarget = document.getElementById('root-render-target');

/**
 * Transforms standard temporal string models into standardized portfolio strings.
 * @param {string} rawDate ISO format string mapping properties
 * @returns {string} Fully humanized string structure
 */
const formatDate = (rawDate) => {
    if (!rawDate) return 'Published Recently';
    try {
        const parsed = new Date(rawDate);
        if (isNaN(parsed.getTime())) return rawDate;
        return parsed.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Published Recently';
    }
};

const handleBackHome = () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = APP_CONFIG.ROUTE_HOME;
    }
};

/**
 * Directs viewport context toward outside news node tabs securely.
 * @param {string} URLDestination Target news node URL
 */
const handleReadOriginal = (url) => {
    try {
        const parsedUrl = new URL(url);

        if (
            parsedUrl.protocol !== "https:" &&
            parsedUrl.protocol !== "http:"
        ) {
            return;
        }

        window.open(
            parsedUrl.href,
            "_blank",
            "noopener,noreferrer"
        );

    } catch {
        console.error("Invalid URL");
    }
};

const showLoading = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "article-skeleton";

    for (let i = 0; i < 5; i++) {
        const line = document.createElement("div");
        line.className = "skeleton-line";
        wrapper.appendChild(line);
    }

    if (rootTarget) {
        rootTarget.replaceChildren(wrapper);
    }
};

const showEmptyState = () => {
    const card = document.createElement('section');
    card.className = 'empty-state-card';

    const icon = document.createElement('span');
    icon.className = 'empty-state-icon';
    icon.textContent = '📰';
    icon.setAttribute('aria-hidden', 'true');

    const title = document.createElement('h1');
    title.className = 'empty-state-title';
    title.textContent = 'No Article Selected';

    const text = document.createElement('p');
    text.className = 'empty-state-text';
    text.textContent = 'It looks like you opened this page directly. Select an article from the Home or Feeds page to start reading.';

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'empty-state-actions';

    const backHomeBtn = document.createElement('button');
    backHomeBtn.className = 'btn-action btn-action-secondary';
    backHomeBtn.textContent = '← Back to Home';
    backHomeBtn.addEventListener('click', handleBackHome);

    const browseBtn = document.createElement('button');
    browseBtn.className = 'btn-action btn-action-primary';
    browseBtn.textContent = 'Browse News';
    browseBtn.addEventListener('click', () => {
        window.location.href = APP_CONFIG.ROUTE_FEEDS;
    });

    actionsContainer.appendChild(backHomeBtn);
    actionsContainer.appendChild(browseBtn);
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(actionsContainer);

    if (rootTarget) {
        rootTarget.replaceChildren(card);
    }
};

/**
 * Assembles and transforms structural parsing trees into pristine article views.
 * Programmatic Node manipulation eliminates XSS vector exploitation entirely.
 * @param {Object} article Raw item mapped dataset schema
 */
const createArticleLayout = (article) => {

    const category = (article.category && article.category.length > 0) ? article.category[0] : TEXT_STRINGS.DEFAULT_CATEGORY;
    const source = article.source_id ?? TEXT_STRINGS.DEFAULT_SOURCE;
    const image = article.image_url ?? APP_CONFIG.FALLBACK_IMAGE;
    const headlineText = article.title ?? 'Untitled Article';
    const descriptionText = article.description ?? TEXT_STRINGS.DEFAULT_DESCRIPTION;
    const authorText = (article.creator && article.creator.length > 0) ? article.creator.join(', ') : TEXT_STRINGS.DEFAULT_AUTHOR;
    const publishDateFormatted = formatDate(article.pubDate);
    const contentText = article.content;

    const articleContainer = document.createElement('article');
    articleContainer.className = 'article-wrapper';

    const heroFigure = document.createElement('figure');
    heroFigure.className = 'article-hero-figure';

    const heroImg = document.createElement('img');
    heroImg.className = 'article-hero-img';
    if (image) {
        try {
            heroImg.src = new URL(image).href;
        } catch {
            heroImg.src = APP_CONFIG.FALLBACK_IMAGE;
        }
    } else {
        heroImg.src = APP_CONFIG.FALLBACK_IMAGE;
    }

    heroImg.onerror = () => {
        if (heroImg.src !== APP_CONFIG.FALLBACK_IMAGE) {
            heroImg.src = APP_CONFIG.FALLBACK_IMAGE;
        }
    };

    const badgeOverlay = document.createElement('span');
    badgeOverlay.className = 'hero-badge-overlay';
    badgeOverlay.textContent = category.toUpperCase();

    heroFigure.appendChild(heroImg);
    heroFigure.appendChild(badgeOverlay);
    articleContainer.appendChild(heroFigure);

    const metaRow = document.createElement('div');
    metaRow.className = 'article-meta-row';

    const sourceElement = document.createElement('span');
    sourceElement.className = 'meta-source';
    sourceElement.textContent = source;

    const metaDivider = document.createElement('span');
    metaDivider.className = 'meta-divider';
    metaDivider.textContent = '•';
    metaDivider.setAttribute('aria-hidden', 'true');

    const dateElement = document.createElement('time');
    dateElement.className = 'meta-date';
    dateElement.setAttribute('datetime', article.pubDate ?? '');
    dateElement.textContent = publishDateFormatted;

    metaRow.appendChild(sourceElement);
    metaRow.appendChild(metaDivider);
    metaRow.appendChild(dateElement);
    articleContainer.appendChild(metaRow);

    const mainHeadlineNode = document.createElement('h1');
    mainHeadlineNode.className = 'article-main-headline';
    mainHeadlineNode.textContent = headlineText;
    articleContainer.appendChild(mainHeadlineNode);

    const authorBylineNode = document.createElement('div');
    authorBylineNode.className = 'article-author-byline';
    authorBylineNode.textContent = `Reported By: ${authorText}`;
    articleContainer.appendChild(authorBylineNode);

    const editorialSection = document.createElement('section');
    editorialSection.className = 'article-editorial-body';

    const standfirstDesc = document.createElement('p');
    standfirstDesc.className = 'article-standfirst-desc';
    standfirstDesc.textContent = descriptionText;
    editorialSection.appendChild(standfirstDesc);

    if (contentText && contentText.trim().length > 0) {

        const fragments = contentText.split('\n\n');
        fragments.forEach(chunk => {
            if (chunk.trim()) {
                const pNode = document.createElement('p');
                pNode.className = 'article-paragraph';
                pNode.textContent = chunk.trim();
                editorialSection.appendChild(pNode);
            }
        });
    } else {

        const emptyNoticeWrapper = document.createElement('div');
        emptyNoticeWrapper.className = 'publisher-notice-box';
        emptyNoticeWrapper.textContent = TEXT_STRINGS.NOTICE_EXTERNAL;
        editorialSection.appendChild(emptyNoticeWrapper);
    }

    articleContainer.appendChild(editorialSection);

    const actionLayoutWrapper = document.createElement('div');
    actionLayoutWrapper.className = 'article-actions-layout';

    const primaryActionBtn = document.createElement("a");

    primaryActionBtn.className =
        "btn-action btn-action-primary";

    primaryActionBtn.textContent =
        "Read Full Article ↗";

    primaryActionBtn.setAttribute(
        "aria-label",
        `Read the full article on the publisher's website`
    );

    try {
        const validatedUrl = new URL(article.link);

        if (
            validatedUrl.protocol === "https:" ||
            validatedUrl.protocol === "http:"
        ) {
            primaryActionBtn.href = validatedUrl.href;
            primaryActionBtn.target = "_blank";
            primaryActionBtn.rel = "noopener noreferrer";
        }
    } catch {
        primaryActionBtn.removeAttribute("href");
        primaryActionBtn.setAttribute("aria-disabled", "true");
    }
    actionLayoutWrapper.appendChild(primaryActionBtn);

    // Back Button
    const backButton = document.createElement("button");
    backButton.className = "btn-action btn-action-secondary";
    backButton.textContent = "← Back to previous page";

    backButton.addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "home.html";
        }
    });

    actionLayoutWrapper.appendChild(backButton);

    articleContainer.appendChild(actionLayoutWrapper);

    if (rootTarget) {
        rootTarget.replaceChildren(articleContainer);
    }
};

const initArticlePage = () => {
    showLoading();
    try {
        const structuralMemoryString = localStorage.getItem(APP_CONFIG.STORAGE_KEY);

        if (!structuralMemoryString) {
            showEmptyState();
            return;
        }
        const parsedArticleObject = JSON.parse(structuralMemoryString);

        if (
            !parsedArticleObject.title ||
            typeof parsedArticleObject !== "object" ||
            !parsedArticleObject.title ||
            !parsedArticleObject.link
        ) {
            showEmptyState();
            return;
        }
        createArticleLayout(parsedArticleObject)
    } catch (error) {
        console.error(error);
        showEmptyState();
    }
};

const menuButton = document.querySelector(".menu-btn");
const navigation = document.querySelector(".main-navigation");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        navigation.classList.toggle("mobile-nav-open");

        const expanded =
            menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute(
            "aria-expanded",
            String(!expanded)
        );
    });
}

document.addEventListener('DOMContentLoaded', initArticlePage);