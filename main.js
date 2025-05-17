const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;

let drawing = false;
let currentColor = "#000000";
let tool = "brush";
let code = "";
let peer = "";

function randCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function setColor(c) {
  currentColor = c;
}
function setTool(t) {
  tool = t;
}
function undo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw(x, y, size = 5) {
  ctx.fillStyle = currentColor;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2 * Math.PI);
  ctx.fill();
}

canvas.addEventListener("mousedown", () => (drawing = true));
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  draw(x, y);
  sendDraw({ x, y, color: currentColor, tool });
});

async function init() {
  code = randCode();
  document.getElementById("myCode").innerText = code;

  await fetch("https://p2p-drawing.fsjhpeter1.workers.dev/create", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  poll();
}

async function connect() {
  peer = document.getElementById("joinCode").value;
  await fetch("https://p2p-drawing.fsjhpeter1.workers.dev/join", {
    method: "POST",
    body: JSON.stringify({ code: peer }),
  });
}

async function sendDraw(data) {
  await fetch("https://p2p-drawing.fsjhpeter1.workers.dev/send", {
    method: "POST",
    body: JSON.stringify({ to: peer, data }),
  });
}

async function poll() {
  setInterval(async () => {
    if (!peer) return;
    const res = await fetch(
      `https://p2p-drawing.fsjhpeter1.workers.dev/poll?code=${code}`
    );
    const json = await res.json();
    if (json && json.x) draw(json.x, json.y);
  }, 1000);
}

init();
