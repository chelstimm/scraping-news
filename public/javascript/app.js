// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />" + data[i].link +"</p>");
//   }
// });

// Whenever someone clicks a p tag
$(document).on("click", ".collapsible-header", function(event) {
    event.preventDefault();
    // Empty the notes from the note section
    var viewComment = $(this).parent().find(".collection");
    viewComment.empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data.comments);
        for(var i = 0; i < data.comments.length; i++) {
         var li = $('<li class="collection-item"><b>' + data.comments[i].author + '</b><span class="badge">' +
         '<form class="delete-form" action="./" method="post">' +
        '<input class="btn-small delete-comment-button" data-id="' + data.comments[i]._id + '" type="submit" value="Delete" style="color: white; background-color: gray; border-color: gray">' +
         '</form></span><br>' + data.comments[i].content + '</li>');
        
         viewComment.append(li);
        }
        // The title of the article
        // viewComment.append("<h2>" + data.title + "</h2>");
        // // An input to enter a new title
        // viewComment.append("<input id='titleinput' name='title' >");
        // // A textarea to add a new note body
        // viewComment.append("<textarea id='bodyinput' name='body'></textarea>");
        // // A button to submit a new note, with the id of the article saved to it
        // viewComment.append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");
  
        // If there's a note in the article
        if (data.comment) {
          // Place the title of the note in the title input
          $("#author_name").val(data.comment.title);
          // Place the body of the comment in the body textarea
          $("#comment_box").val(data.comment.body);
        }
      });
  });
  
  // When you click the savecomment button
  $(document).on("submit", ".comment-form", function(event) {
    event.preventDefault();
  console.log("yo");
    // Grab the id associated with the article from the submit button
    var thisId = $(this).find(".add-comment-button").attr("data-id");
  
    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        author: $(this).find("#author_name").val(),
        // Value taken from comment textarea
        content: $(this).find("#comment_box").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the comments section
        viewComment.empty();
      });
  
    // Also, remove the values entered in the input and textarea for comment entry
    $("#author_name").val("");
    $("#comment_box").val("");
  });
  
  $(document).on("submit", ".delete-form", function(event) {
    event.preventDefault();
    var commentId = $(this).find(".delete-comment-button").attr("data-id");
    console.log("todo delete", commentId);
  
    //ajax call with delete method call the route (/deleteComment/:id")
    $.ajax({
      method: "DELETE",
      url: "/deleteComment/:id" + commentId,
    }).then(function(){
      // $(".viewComment").removeAttr("data-id");
      viewComment.removeAttr("data-id");
      console.log("comment deleted");
  });
  });