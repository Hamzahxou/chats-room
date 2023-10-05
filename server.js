const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const session = require("express-session");
// const { Session } = require("inspector");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(
  session({
    secret: "BhbhVHGygcdveGY",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: true }));

let chatHistory = [];

function saveChatHistory() {
  fs.writeFileSync(
    "chat_history.json",
    JSON.stringify(chatHistory, null, 2),
    "utf8"
  );
}

function loadChatHistory() {
  try {
    const data = fs.readFileSync("chat_history.json", "utf8");
    chatHistory = JSON.parse(data);
  } catch (err) {
    console.error("Error reading chat history:", err);
  }
}

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

const colors = ["#dc3545", "#ffc107", "#17a2b8"];
function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

function input(data) {
  let sanitizedData = data.trim();
  // /*sanitizedData = sanitizedData.replace(/\\/g, "");*/
  sanitizedData = sanitizedData.replace(/</g, "&lt;");
  sanitizedData = sanitizedData.replace(/>/g, "&gt;");
  return sanitizedData;
}

function generateRandomKey(p) {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomKey = "";
  for (var i = 0; i < p; i++) {
    var randomIndex = Math.floor(Math.random() * characters.length);
    randomKey += characters[randomIndex];
  }

  return randomKey;
}

app.post("/nama", (req, res) => {
  const inputNama = req.body.inputNama;
  (req.session.inputNama = inputNama), res.redirect("/");
});

app.get("/input", (req, res) => {
  const inputNama = req.session.inputNama || "";
  res.send(`<form action="/nama" method="POST">
  <input type="text" name="inputNama" value="${inputNama}"/>
  <button type="submit">kirim</button>
  </form>`);
});

app.get("/", (req, res) => {
  const inputNama = req.session.inputNama || "";
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/css/style.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/style.css");
});
app.get("/js/js.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/js.js");
});
app.get("/js/script.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/script.js");
});
app.get("/js/skeleton.js", (req, res) => {
  res.sendFile(__dirname + "/public/js/skeleton.js");
});

io.on("connection", (socket) => {
  loadChatHistory();
  socket.emit("chat history", chatHistory);

  socket.on("chat message", (msg) => {
    var color = getRandomColor();
    var randomKey = generateRandomKey(10);
    const currentDateTime = new Date();
    const formattedDateTime = formatDateTime(currentDateTime);
    var waktu = formattedDateTime;
    const newMessage = {
      key: randomKey,
      name: input(msg.name).slice(0, 11),
      // name: input(inputNama).slice(0, 11),
      message: input(msg.message).slice(0, 200),
      color: color,
      date: waktu,
      balas: { dari: msg.dari || null, key: msg.keynya || null },
      image: msg.image || null,
    };
    chatHistory.push(newMessage);
    io.emit("chat message", newMessage);
    saveChatHistory();
  });
});

server.listen(8000, () => {
  console.log("localhost:8000");
});
