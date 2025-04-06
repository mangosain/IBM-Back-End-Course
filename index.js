const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

// Global session middleware
app.use(
  session({
    secret: "fingerprint_customer",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// JWT Auth middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.session.authorization?.accessToken;
  if (token) {
    jwt.verify(token, "fingerprint_customer", (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
});

const PORT = 3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
