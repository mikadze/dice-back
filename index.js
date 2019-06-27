const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const config = require("./config");
const ws = require("./ws");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8000;

mongoose.connect(config.DB.URL);
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;


app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(auth);

app.use("/api", router);

ws.init(io);

db.on("error", () => console.log("db connection error"));

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
