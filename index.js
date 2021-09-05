const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema, isCompositeType } = require("graphql");
const axios = require("axios").default;
const cors = require("cors");
const qs = require("qs");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(session({ secret: "keyboard cat" }));

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return "Hello world!";
  },
};

app.get("/login", function (req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?response_type=code&client_id=0ba22b4e952a4140aa188207642349f6&scope=user-read-private user-read-email user-read-playback-state&redirect_uri=" +
      encodeURIComponent("http://localhost:4000/callback")
  );
});

app.get("/callback", function (req, res) {
  axios
    .post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: "http://localhost:4000/callback",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic MGJhMjJiNGU5NTJhNDE0MGFhMTg4MjA3NjQyMzQ5ZjY6MjY2NjcwYTVjM2MzNDk1ZGE5MGVkZjk5MTgyZGI3OTg=",
        },
      }
    )
    .then((response) => {
      req.session.cookie.spotifyToken = response.data.access_token;
      res.redirect("http://localhost:9000/");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/me", function (req, res) {
  console.log({session: req.session})
  // TODO: Response is 401 Unauthorized due to lack of session state.
  axios
    .get("https://api.spotify.com/vl/me", {
      headers: {
        Authorization: "Bearer " + req.session.cookie.spotifyToken,
      },
    })
    .then((response) => {
      
      res.send(response);
    })
    .catch((err) => console.log(err));
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
