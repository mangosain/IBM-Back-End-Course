const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

const secretKey = "fingerprint_customer";
let users = [];

const isValid = (username) => !users.some((user) => user.username === username);

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
  req.session.authorization = { accessToken: token };
  return res
    .status(200)
    .json({ message: "User successfully logged in", token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No session found" });
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review is required in the body" });
  }
  if (!book.reviews) book.reviews = {};
  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No session found" });
  }
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this book" });
  }
  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
