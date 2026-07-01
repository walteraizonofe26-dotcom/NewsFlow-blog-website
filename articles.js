// Get the article from Local Storage
const savedArticle = localStorage.getItem("selectedArticle");

// Check if an article exists
if (!savedArticle) {
    document.querySelector(".article-page").innerHTML = `
        <div class="not-found">
            <h1>Article Not Found</h1>
            <p>The article you are looking for does not exist.</p>

            <a href="home.html">
                <button>Go Back Home</button>
            </a>

            <a href="feeds.html">
                <button>Go To Feeds</button>
            </a>
        </div>
    `;
} else {

    // Convert the string back into an object
    const article = JSON.parse(savedArticle);

    // Select HTML elements
    const articleTitle = document.querySelector(".article-title");
    const authorName = document.querySelector(".author-name");
    const articleDate = document.querySelector("time");
    const articleImage = document.querySelector(".featured-image img");
    const articleCaption = document.querySelector(".featured-image figcaption");
    const articleContent = document.querySelector(".article-content");

    // Display the article
    articleTitle.textContent = article.title;

    authorName.textContent = article.author || "Unknown Author";

    articleDate.textContent = article.date;
    articleDate.setAttribute("datetime", article.date);

    articleImage.src = article.image;
    articleImage.alt = article.title;

    articleCaption.textContent = article.category;

    articleContent.innerHTML = `
        <p>${article.description}</p>
    `;
}