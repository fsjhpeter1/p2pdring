const API_URL = "https://p2p-drawing.fsjhpeter1.workers.dev";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let currentColor = "#000000";
let brushSize = 3;
let isEraser = false;
let pairCode = null;
let clientId = generateId();
let strokes = []; // 本地筆跡
let undoStack = [];

canvas.addEventListener("pointerdown", e => {
  if (!pairCode) {
    alert("請先生成或連接配對代碼！");
    return;
  }
  drawing = true;
  const x = e.offsetX;
  const y = e.offsetY;
  const stroke = {
    id: generateId(),
    clientId,
    color: isEraser ? "#FFFFFF" : currentColor,
    size: brushSize,
    points: [{ x, y }]
  };
  strokes.push(stroke);
  undoStack.push(stroke.id);
  drawStrokes();
  sendStroke(stroke);
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  const stroke = strokes[strokes.length - 1];
  stroke.points.push({ x, y });
  drawStrokes();
  sendStroke(stroke);
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
});

canvas.addEventListener("pointerleave", () => {
  drawing = false;
});

document.getElementById("colorPicker").addEventListener("input", e => {
  currentColor = e.target.value;
  isEraser = false;
});

document.getElementById("brushSize").addEventListener("input", e => {
  brushSize = parseInt(e.target.value, 10);
});

document.getElementById("eraserBtn").addEventListener("click", () => {
  isEraser = true;
});

document.getElementById("undoBtn").addEventListener("click", () => {
  const lastStrokeId = undoStack.pop();
  if (lastStrokeId) {
    strokes = strokes.filter(s => s.id !== lastStrokeId);
    drawStrokes();
    sendClear();
  }
});

document.getElementById("clearCanvasBtn").addEventListener("click", () => {
  strokes = strokes.filter(s => s.clientId !== clientId);
  drawStrokes();
  sendClear();
});

document.getElementById("createCodeBtn").addEventListener("click", async () => {
  const newCode = generateCode(6);
  const res = await fetch(API_URL + "/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: newCode })
  });
  if (res.ok) {
    pairCode = newCode;
    alert("新配對代碼：" + newCode);
    pollCanvasData();
  } else {
    alert("生成代碼失敗");
  }
});

document.getElementById("joinCodeBtn").addEventListener("click", async () => {
  const code = document.getElementById("pairCodeInput").value.trim();
  if (!code) {
    alert("請輸入配對代碼");
    return;
  }
  const res = await fetch(API_URL + "/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });
  if (res.ok) {
    pairCode = code;
    alert("成功連接代碼：" + code);
    pollCanvasData();
  } else {
    alert("連接失敗：" + await res.text());
  }
});

function drawStrokes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const stroke of strokes) {
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

function sendStroke(stroke) {
  if (!pairCode) return;
  fetch(API_URL + "/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: pairCode, data: { stroke } })
  });
}

function sendClear() {
  if (!pairCode) return;
  fetch(API_URL + "/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: pairCode, data: { clear: clientId } })
  });
}

async function pollCanvasData() {
  if (!pairCode) return;
  const res = await fetch(API_URL + "/poll?code=" + pairCode);
  if (!res.ok) return;
  const json = await res.json();
  if (json.stroke && json.stroke.clientId !== clientId) {
    strokes.push(json.stroke);
    drawStrokes();
  } else if (json.clear === clientId) {
    strokes = strokes.filter(s => s.clientId !== clientId);
    drawStrokes();
  }
  setTimeout(pollCanvasData, 500);
}

function generateCode(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
