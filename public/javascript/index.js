$(document).ready(function() {
    // Setting a reference to the article-container div where all the dynamic content will go
    // Adding event listeners to any dynmaically generated "save article"
    // and "scrape new artticle" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);

    // Once the page is ready, run the initPage function to kick things off
    initPage();

    function initPage() {
        // Empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
        .then(function(data) {
            // If we have headlines, render them to the page
            if (data && data.length) {
                renderArticles(data);
            }
         else {
            // Otherwise render a message explaining we have no articles
            renderEmpty();
        }
    });
}

function renderArticles(articles) {
    // This function handles appending HTML containing our article data to the page
    // We are passed an array of JSON containing all available articles in our database
    var articlePanels = [];
    // We pass each article JSON object to the createPanel function which returns a bootstrap
    for (var i = 0; i < articles.length; i++) {
        articlePanels.push(createPanel(articles[i]));
    }
    // Once we have all of the HTML for the articles stored in our articlePanels array,
    // append them to the articlePanels container
    articleContainer.append(articlePanels);
}

function createPanel(article) {
    // This function takes in a single JSON object for an article/headline
    // It constructs a jQuery element containing all of the formatted HTML for the
    // article panel
    var panel = 
    $(["<div class='panel panel-default'>",
    "<div class='panel-heading'>",
    "<h3>",
    article.headline,
    "<a class='btn btn-success save'>",
    "Save Article",
    "</a>",
    "</h3>",
    "</div>",
    "<div class='panel-body'>",
    article.summary,
    "</div>",
    "</div>"
].join(""));
// We attach the article's id to the jQuery element
// We will use ths when trying to figure out which article user wants to save
panel.data("_id", article.id);
// We return the constructed panel jQuery element
return panel;
}

function renderEmpty() {
    // This function renders some HTML to the page explaining we don't have any articles to view
    // Using a jouned array of HTML string data because it's easier to read/change than a concatenated string
    var emptyAlert = $([
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>What Would You Like To do?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
    ].join(""))
    // Appending this data to the page
    articleContainer.append(emptyAlert);
}

function handleArticleSave() {
    // This function is triggered when the user wants to save an article
    // When we rendered the article initially, we attached a javascript object containing the headline id
    // to the element using the .data method. Here we retrieve that
    var articleToSave = $(this).parents(".panel").data();
    articleToSave.saved = true;
    // Using a patch method to be semantic since this an update to an existing record in our collection
    $.ajax({
        method: "PATCH",
        url: "/api/headlines",
        data: articleToSave
    })
    .then(function(data) {
        // If successful, mongoose will send back an object containing a key of "ok" with the value of 1
        // Which casts to 'true'
        if (data.ok) {
            // Run the initPage function again. This will reload the entire list of articles
            initPage(); 
        }
    });
}
    function handleArticleScrape() {
        // This function handles the user clicking any "scrape new article" buttons
        $.get("/api/fetch")
        .then(function(data) {
            // If we are able to sucessfully scrape the NYTIMES and compare the articles to those
            // already in our collection, re render the articles on the page
            // and let the user know how many unique articles we were able to save
            initPage();
            bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>")
        });
    }
});
