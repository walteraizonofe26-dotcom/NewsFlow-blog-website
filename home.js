//For learning purposes, the NewsData.io API key is currently stored directly in the JavaScript file instead of an environment (.env) file.
//I understand that exposing API keys in client-side code is not a recommended practice for production applications. In a real-world project, 
//I would store sensitive API keys securely using environment variables and a backend server or serverless function.

const API_KEY = "pub_37cb3f9d1ece4e1da0c15c0d9eda6a24";

const API_URL = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en`;



async function getLatestNews() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch news.");
        }

        const data = await response.json();
        renderArticles(data.results);

    }

    catch(error){

        console.log(error);

        document.querySelector(".articles-grid").innerHTML = `
            <h2>Unable to load news.</h2>
        `;

    }

}



function renderArticles(news){

    const grid = document.querySelector(".articles-grid");

    grid.innerHTML = "";

    news.forEach(articleData => {

        const article = document.createElement("article");

        article.classList.add("article-card");



        article.innerHTML = `

            <img
                src="${articleData.image_url || 'https://via.placeholder.com/400x250'}"
                alt="${articleData.title}"
            >

            <div class="card-content">

                <span class="category">
                    ${articleData.category ? articleData.category[0] : "General"}
                </span>

                <h3 class="card-title">
                    ${articleData.title}
                </h3>

                <p class="card-description">
                    ${articleData.description || "No description available."}
                </p>

                <small>
                    ${articleData.pubDate}
                </small>

                <br><br>

                <button class="read-more-button">
                    Read More
                </button>

            </div>

        `;
        article
            .querySelector(".read-more-button")
            .addEventListener("click", () => {

                localStorage.setItem(
                    "selectedArticle",
                    JSON.stringify(articleData)
                );

                window.location.href = "articles.html";

            });

        grid.appendChild(article);

    });

}

getLatestNews();





