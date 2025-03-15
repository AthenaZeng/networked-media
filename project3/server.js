const express = require("express");
const parser = require("body-parser");
const multer = require("multer");

const app = express();
const encodedParser = parser.urlencoded({ extended: true });
const up = multer({ dest: "public/upload" });

app.use(express.static("public"));
app.use(encodedParser);
app.set("view engine", "ejs");

let box = [];
let allCards = [
  {
    name: "Xeno'jiiva",
    region: "Confluence of Fates",
    remarks: "Fear attacks with fire and poison attributes",
    imgUrl: "/dragon.png",
  },
  {
    name: "Ball",
    region: "Often appearing in parks",
    remarks: "Be careful of its cute appearance, its heart is a fierce beast",
    imgUrl: "/dog.jpg",
  },
];

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/forum", (req, res) => {
  res.render("forum.ejs", { allPosts: box });
});

app.get("/monsterCodex", (req, res) => {
  res.render("monsterCodex.ejs", { allCards: allCards });
});

app.post("/upload", up.single("theimage"), (req, res) => {
  let now = new Date();
  let post = {
    user: req.body.username || "Somebody",
    title: req.body.title || "None",
    text: req.body.text || "No content",
    tag: req.body.tag || "chat",
    date: now.toLocaleDateString(),
    likes: 0,
  };
  if (req.file) {
    post.imgUrl = "upload/" + req.file.filename;
  }
  box.unshift(post);
  res.redirect("/forum");
});

app.post("/add-monster", up.single("image"), (req, res) => {
  console.log(req.file); 
  let now = new Date();
  let newCard = {
    name: req.body.name,
    region: req.body.region || "None",
    remarks: req.body.remarks || "None",
  };
  if (req.file) {
    newCard.imgUrl = "upload/" + req.file.filename;
  } else {
    newCard.imgUrl = "upload/default.jpg";
  }
  allCards.push(newCard);
  res.redirect("/monsterCodex");
});

app.post("/like/:index", (req, res) => {
  let index = req.params.index;
  box[index].likes += 1;
  res.redirect("/forum");
});

app.listen(8912, () => {
  console.log("http://127.0.0.1:8912");
});
