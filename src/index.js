const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema, isCompositeType } = require("graphql");
const axios = require("axios").default;
const cors = require("cors");
const qs = require("qs");
const session = require("express-session");

const {
  client_id,
  client_secret,
  redirect_uri,
  app_url,
} = require("./service_config");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(
  session({
    secret: "keyboard cat",
    cookie: {
      secure: "auto",
      httpOnly: true,
      maxAge: 3600000,
    },
  })
);

app.get("/login", function (req, res) {
  const searchParams = new URLSearchParams({
    response_type: "code",
    client_id,
    scope: "user-read-private user-read-email user-read-playback-state",
    redirect_uri: redirect_uri,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize?" + searchParams.toString()
  );
});

app.get("/callback", function (req, res) {
  axios
    .post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${client_id}:${client_secret}`
          ).toString("base64")}`,
        },
      }
    )
    .then((response) => {
      req.session.spotifyToken = response.data.access_token;
      res.redirect(app_url);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/me", function (req, res) {
  axios
    .get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + req.session.spotifyToken,
      },
    })
    .then((response) => {
      res.status(200).send(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
});

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
