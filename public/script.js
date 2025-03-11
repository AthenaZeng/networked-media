function filterPosts(tag) {
  let posts = document.querySelectorAll(".post-item");

  posts.forEach((post) => {
    if (tag == "all") {
      post.style.display = "block";
    } else if (post.getAttribute("data-tag") == tag) {
      post.style.display = "block";
    } else {
      post.style.display = "none";
    }
  });
}