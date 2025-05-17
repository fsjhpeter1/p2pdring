const API_URL = "https://p2p-drawing.fsjhpeter1.workers.dev/";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let currentStroke = null;
let strokes = [];     // 所有筆跡資料
let userId = generateUserId();

let pairCode = null;
let brushSize = 3;
let currentColor = "#000000";
let isEraser = false;

function generateUserId() {
  return 'user-' + Math.random().toString(36).slice(2, 10);
}

function generateStrokeId() {
  return 'stroke-' + Math.random().toString(36).slice(2, 10);
}

canvas.addEventListener("pointerdown", e => {
  if (!pairCode) {
    alert("請先生成或加入配對代碼");
    return;
  }
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  currentStroke = {
    id: generateStrokeId(),
    userId,
    color: isEraser ? null : currentColor,
    size: brushSize,
    points: [{ x, y }],
    isEraser,
  };
  strokes.push(currentStroke);
  drawCanvas();
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  currentStroke.points.push({ x, y });
  drawCanvas();

  // 送資料到 server
  sendStroke(currentStroke);
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  if (currentStroke) sendStroke(currentStroke);
  currentStroke = null;
});

canvas.addEventListener("pointerleave", () => {
  if (drawing) {
    drawing = false;
    if (currentStroke) sendStroke(currentStroke);
    currentStroke = null;
  }
});

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of strokes) {
    if (s.isEraser) continue;
    ctx.strokeStyle = s.color || "#000000";
    ctx.lineWidth = s.size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) {
      ctx.lineTo(s.points[i].x, s.points[i].y);
    }
    ctx.stroke();
  }
}

// 送出筆跡資料
async function sendStroke(stroke) {
  if (!pairCode) return;
  try {
    await fetch(API_URL + "/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: pairCode, stroke }),
    });
  } catch (e) {
    console.error("送出筆跡失敗", e);
  }
}

// 輪詢伺服器筆跡
async function pollStrokes() {
  if (!pairCode) return;
  try {
    const res = await fetch(API_URL + "/poll?code=" + pairCode);
    if (!res.ok) return;
    const json = await res.json();

    // 更新本地筆跡，排除自己筆跡重複
    let updated = false;
    for (const s of json.strokes) {
      if (!strokes.find(stroke => stroke.id === s.id)) {
        strokes.push(s);
        updated = true;
      }
    }
    if (updated) drawCanvas();
  } catch (e) {
    console.error("輪詢失敗", e);
  }
  setTimeout(pollStrokes, 1000);
}

// UI 綁定
document.getElementById("createCodeBtn").onclick = async () => {
  const newCode = generateCode(6);
  const res = await fetch(API_URL + "/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: newCode }),
  });
  if (res.ok) {
    pairCode = newCode;
    alert("新配對代碼：" + newCode);
    pollStrokes();
  } else {
    alert("生成配對碼失敗");
  }
};

document.getElementById("joinCodeBtn").onclick = async () => {
  const code = document.getElementById("pairCodeInput").value.trim();
  if (!code) {
    alert("請輸入配對代碼");
    return;
  }
  const res = await fetch(API_URL + "/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (res.ok) {
    pairCode = code;
    alert("成功連接：" + code);
    pollStrokes();
  } else {
    alert("連接配對碼失敗");
  }
};

document.getElementById("brushSize").addEventListener("input", e => {
  brushSize = parseInt(e.target.value, 10);
});

document.getElementById("colorPicker").addEventListener("input", e => {
  currentColor = e.target.value;
});

document.getElementById("eraserBtn").addEventListener("click", () => {
  isEraser = !isEraser;
  document.getElementById("eraserBtn").textContent = isEraser ? "畫筆" : "橡皮擦";
});

function generateCode(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
