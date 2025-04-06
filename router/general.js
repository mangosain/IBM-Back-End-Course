const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get("/users", (req, res) => res.status(200).json({ users }));

public_users.get("/", (req, res) => res.status(200).json({ books }));

public_users.get("/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book)
    : res.status(400).json({ message: "Book not found!!" });
});

public_users.get("/author/:author", (req, res) => {
  const result = Object.values(books).filter(
    (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
  );
  return result.length
    ? res.status(200).json(result)
    : res.status(400).json({ message: "Not found" });
});

public_users.get("/title/:title", (req, res) => {
  const result = Object.values(books).filter(
    (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
  );
  return result.length
    ? res.status(200).json(result)
    : res.status(400).json({ message: "Not found" });
});

public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (book) {
    const reviews = book.reviews || {};
    return Object.keys(reviews).length
      ? res.status(200).json(reviews)
      : res.status(400).json({ message: "No reviews found" });
  }
  return res.status(400).json({ message: "Book not found" });
});

public_users.get("/async/books", async (req, res) => {
  try {
    const booksList = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 2000);
    });
    res.status(200).json(booksList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Search by ISBN – Using Promises
public_users.get("/async/isbn/:isbn", (req, res) => {
  return new Promise((resolve, reject) => {
    const book = books[req.params.isbn];
    if (book) {
      resolve(res.status(200).json(book));
    } else {
      reject(res.status(400).json({ message: "Book not found!!" }));
    }
  });
});

// Search by Author
public_users.get("/async/author/:author", (req, res) => {
  return new Promise((resolve, reject) => {
    const result = Object.values(books).filter(
      (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
    );
    if (result.length) {
      resolve(res.status(200).json(result));
    } else {
      reject(res.status(400).json({ message: "Not found" }));
    }
  });
});

// Search by Title
public_users.get("/async/title/:title", (req, res) => {
  return new Promise((resolve, reject) => {
    const result = Object.values(books).filter(
      (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
    );
    if (result.length) {
      resolve(res.status(200).json(result));
    } else {
      reject(res.status(400).json({ message: "Not found" }));
    }
  });
});

module.exports.general = public_users;
