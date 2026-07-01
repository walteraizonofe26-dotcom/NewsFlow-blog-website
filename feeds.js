
const fakeNews = [

    {
        id: 1,
        title: "Messi Scores Brace as Inter Miami Crushes Orlando City",
        description: "Lionel Messi delivered another masterclass performance, scoring twice to lead Inter Miami to a convincing victory in the Leagues Cup.",
        category: "Football",
        image: "https://picsum.photos/id/1015/800/600",
        date: "June 25, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 2,
        title: "Arsenal Complete Record Signing of Brazilian Starlet",
        description: "Arsenal have made a huge statement in the transfer market by signing one of Brazil's most promising young talents.",
        category: "Football",
        image: "https://picsum.photos/id/1020/800/600",
        date: "June 24, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 3,
        title: "How AI is Revolutionizing Modern Football Tactics",
        description: "From player tracking to tactical analysis, artificial intelligence is changing how coaches prepare and make decisions during matches.",
        category: "Tech",
        image: "https://picsum.photos/id/201/800/600",
        date: "June 23, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 4,
        title: "NBA Finals: Celtics vs Warriors - Preview and Prediction",
        description: "A classic matchup returns as the Boston Celtics face the Golden State Warriors in what promises to be an epic NBA Finals series.",
        category: "Sports",
        image: "https://picsum.photos/id/133/800/600",
        date: "June 22, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 5,
        title: "Apple Vision Pro 2 Rumors: What to Expect in 2027",
        description: "New leaks suggest Apple is working on major improvements for the next version of their spatial computing headset.",
        category: "Tech",
        image: "https://picsum.photos/id/180/800/600",
        date: "June 21, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 6,
        title: "Manchester City Eyeing Shock Move for Kylian Mbappe",
        description: "According to reliable sources, Manchester City are preparing a massive bid to bring the French superstar to the Premier League.",
        category: "Football",
        image: "https://picsum.photos/id/201/800/600",
        date: "June 20, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 7,
        title: "The Rise of Esports: Why It's Becoming Big Business",
        description: "With millions of viewers and huge prize pools, esports has become one of the fastest growing industries in sports and entertainment.",
        category: "Sports",
        image: "https://picsum.photos/id/251/800/600",
        date: "June 19, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 8,
        title: "Tesla Unveils New Affordable Electric Vehicle Model",
        description: "Elon Musk has revealed details about Tesla's upcoming budget-friendly EV that could disrupt the entire market.",
        category: "Tech",
        image: "https://picsum.photos/id/180/800/600",
        date: "June 18, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 9,
        title: "Nigeria Super Eagles Qualify for 2026 World Cup",
        description: "The Super Eagles secured qualification with a dramatic late winner against their rivals in a tense qualifying match.",
        category: "Football",
        image: "https://picsum.photos/id/1015/800/600",
        date: "June 17, 2026",
        author: "Walter Okon",
        button: "Read More"
    },
    {
        id: 10,
        title: "Best Smartphones of 2026: Top Flagships Compared",
        description: "We compare the latest flagship phones from Samsung, Apple, Google, and Xiaomi to help you choose the best one.",
        category: "Business",
        image: "https://picsum.photos/id/201/800/600",
        date: "June 16, 2026",
        author: "Walter Okon",
        button: "Read More"
    }
];



function renderArticles(articles){
    let articlesContainer = document.querySelector(".articles-container");
    articlesContainer.innerHTML = "";    

    for (let i =0; i<articles.length; i++){
        let articleData = articles[i];

        const article = document.createElement("article");
        article.classList.add("feed-card");

        const image = document.createElement("img");
        image.src = articleData.image;
        image.alt = articleData.title
        image.classList.add("card-image");
        
        const articleTitle = document.createElement("h3");
        articleTitle.classList.add("card-title");
        articleTitle.textContent = articleData.title;

        const articleDescription = document.createElement("p")
        articleDescription.classList.add("card-summary");
        articleDescription.textContent = articleData.description;

        const articleCategory = document.createElement("span")
        articleCategory.classList.add("category-label");
        articleCategory.textContent = articleData.category

        const articleButton = document.createElement("button")
        articleButton.classList.add("article-button");
        articleButton.textContent = articleData.button


        article.appendChild(image);
        article.appendChild(articleTitle)
        article.appendChild(articleDescription)
        article.appendChild(articleCategory)
        article.appendChild(articleButton)
        

        articlesContainer.appendChild(article)
    }
}
renderArticles(fakeNews)

let searchInput = document.getElementById("news-search");
searchInput.addEventListener("input", function(){
        const searchTerm = searchInput.value.trim().toLowerCase();

        let filteredNews = fakeNews;

        if (searchTerm !== ''){
            filteredNews = fakeNews.filter(article =>
                article.category.toLowerCase().includes(searchTerm) ||
                article.description.toLowerCase().includes(searchTerm)
            )
        }
        renderArticles(filteredNews)
})