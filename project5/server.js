const express = require("express");
const parser = require("body-parser");
const multer = require("multer");
const nedb = require("@seald-io/nedb");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const nedbSessionStore = require("nedb-promises-session-store");
const bcrypt = require("bcrypt");
const app = express();
const upload = multer({ dest: "public/upload" });
const encodedParser = parser.urlencoded({ extended: true });

let postCard = new nedb({ filename: "postCard.txt", autoload: true });
let userdb = new nedb({ filename: "userdb.txt", autoload: true });
const nedbSessionInit = nedbSessionStore({
  connect: expressSession,
  filename: "sessions.txt",
});

app.use(express.static("public"));
app.use(encodedParser);
app.set("view engine", "ejs");
app.use(cookieParser());

app.use(
  expressSession({
    store: nedbSessionInit,
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000,
    },
    secret: "flowerAndWord123",
  })
);

function requiresAuthentication(req, res, next) {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect("/login?err=userNotLoggedIn");
  }
}

app.get("/", (req, res) => {
  let newVisits = 1;

  if (req.cookies.visits) {
    newVisits = parseInt(req.cookies.visits) + 1;
    res.cookie("visits", newVisits, {
      expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
    });
  } else {
    res.cookie("visits", newVisits, {
      expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
    });
  }
  res.render("HomePage.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
app.get("/postcard", (req, res) => {
  postCard.find({}, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error.");
    }
    res.render("postcard.ejs", { wordGroups: data });
  });
});
app.get("/explore", (req, res) => {
  const currentUser = req.session.loggedInUser;
  const view = req.query.view || "all";
  let query = {};
  if (currentUser && view == "mine") {
    query.username = currentUser;
  }

  postCard
    .find(query)
    .sort({ timestamp: -1 })
    .exec((err, results) => {
      if (err) return res.status(500).send("Database error.");
      res.render("explore.ejs", {
        posts: results,
        currentUser,
        currentView: view,
      });
    });
});
app.get("/logout", requiresAuthentication, (req, res) => {
  delete req.session.loggedInUser;
  res.redirect("/login");
});
app.post("/signup", upload.single("profilePicture"), (req, res) => {
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let newUser = {
    username: req.body.username,
    password: hashedPassword,
  };

  userdb.insert(newUser, (err, insertedUser) => {
    res.redirect("/login");
  });
});
app.post("/authenticate", (req, res) => {
  let data = {
    username: req.body.username,
    password: req.body.password,
  };

  let searchQuery = {
    username: data.username,
  };

  userdb.findOne(searchQuery, (err, user) => {
    if (err || user == null) {
      res.redirect("/login");
    } else {
      let encPass = user.password;
      if (bcrypt.compareSync(data.password, encPass)) {
        let session = req.session;
        session.loggedInUser = data.username;
        res.redirect("/");
      } else {
        res.redirect("/login");
      }
    }
  });
});

function getFlower(category) {
  const imageNumber = Math.floor(Math.random() * 10) + 1;
  return `/flowers/${category}/${imageNumber}.png`;
}

app.post("/submit-words", requiresAuthentication, encodedParser, (req, res) => {
  const raw = req.body.words;
  const words = raw
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const single = words.map((word) => {
    const total = word
      .toUpperCase()
      .split("")
      .map((char) => char.charCodeAt(0) - "A".charCodeAt(0))
      .filter((n) => n >= 0 && n <= 25)
      .reduce((a, b) => a + b, 0);

    const category = total % 8 || 8;
    const image = getFlower(category);

    return { word, category, image };
  });
  const currentUser = req.session.loggedInUser;

  postCard.count({ username: currentUser }, (err, count) => {
    if (count >= 5) {
      return res.send(
        "You already created 5 postcards, Please delete the old one"
      );
    }
    const wordGroup = {
      username: req.session.loggedInUser,
      timestamp: Date.now(),
      words: single,
    };

    postCard.insert(wordGroup, (err, newDoc) => {
      res.redirect("/explore");
    });
  });
});

app.post("/delete-postcard/:id", requiresAuthentication, (req, res) => {
  const user = req.session.loggedInUser;
  const id = req.params.id;

  postCard.remove({ _id: id, username: user }, {}, (err, numRemoved) => {
    if (err || numRemoved == 0) {
      return res.status(403).send("That is not your postcard");
    }
    res.redirect("/explore");
  });
});
////////////////////////
app.listen(8912, () => {
  console.log("http://127.0.0.1:8912");
});
