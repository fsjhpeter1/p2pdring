const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let color = "#000000";
let erasing = false;
let history = [];
let pairedCode = "";

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.95;
  canvas.height = window.innerHeight * 0.7;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);

canvas.addEventListener("mousedown", start);
canvas.addEventListener("touchstart", start);

canvas.addEventListener("mouseup", end);
canvas.addEventListener("mouseleave", end);
canvas.addEventListener("touchend", end);

canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchmove", draw);

function start(e) {
  drawing = true;
  draw(e);
}

function end() {
  drawing = false;
  ctx.beginPath();
}

function draw(e) {
  if (!drawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;

  ctx.lineWidth = erasing ? 20 : 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = erasing ? "#ffffff" : color;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);

  if (pairedCode) {
    sendToServer(x, y, ctx.strokeStyle, ctx.lineWidth);
  }

  history.push({ x, y, color: ctx.strokeStyle, size: ctx.lineWidth });
}

function selectColor(c) {
  color = c;
  erasing = false;
}
function toggleEraser() {
  erasing = !erasing;
}
function undo() {
  if (history.length > 0) {
    history.pop();
    redraw();
  }
}
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  history = [];
}
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of history) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineWidth = p.size;
    ctx.strokeStyle = p.color;
    ctx.lineTo(p.x + 0.1, p.y + 0.1); // tiny offset to force a visible dot
    ctx.stroke();
  }
}

function selectCustomColor() {
  const picker = document.getElementById("colorPicker");
  selectColor(picker.value);
}

function generateCode() {
  pairedCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  document.getElementById("pairCodeInput").value = pairedCode;
  alert("⚠️ 您已進入同步模式，配對代碼：" + pairedCode);
  logSession();
}

function connectCode() {
  pairedCode = document.getElementById("pairCodeInput").value.trim();
  if (pairedCode === "") return alert("請輸入配對代碼");

  alert("⚠️ 嘗試連接配對代碼：" + pairedCode);
  startPolling();
  logSession();
}

// ----------------------------
// Cloudflare interaction (需 Worker)
// ----------------------------

function sendToServer(x, y, color, size) {
  fetch(`https://YOUR_WORKER_URL/upload?code=${pairedCode}`, {
    method: "POST",
    body: JSON.stringify({ x, y, color, size }),
  });
}

function startPolling() {
  setInterval(async () => {
    const res = await fetch(`https://YOUR_WORKER_URL/sync?code=${pairedCode}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      data.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineWidth = p.size;
        ctx.strokeStyle = p.color;
        ctx.lineTo(p.x + 0.1, p.y + 0.1);
        ctx.stroke();
      });
    }
  }, 1000);
}

function logSession() {
  fetch(`https://YOUR_WORKER_URL/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: pairedCode,
      ip: "", // worker 端抓
      userAgent: navigator.userAgent,
      date: new Date().toISOString(),
    }),
  });
}
