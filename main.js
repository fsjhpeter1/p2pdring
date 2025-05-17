// Worker API endpoint (改成你的 URL)
const API_URL = "https://p2p-drawing.fsjhpeter1.workers.dev";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let currentColor = "#000000";

let pairCode = null; // 存目前配對代碼

// 畫筆事件
canvas.addEventListener("pointerdown", e => {
  if (!pairCode) {
    alert("請先生成或連接配對代碼！");
    return;
  }
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();
  sendCanvasData(); // 每次畫筆移動就送資料
});

canvas.addEventListener("pointerup", () => {
  if (!drawing) return;
  drawing = false;
});

canvas.addEventListener("pointerleave", () => {
  drawing = false;
});

// 顏色選擇
document.querySelectorAll(".color-swatch").forEach(el => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".color-swatch").forEach(c => c.classList.remove("selected"));
    el.classList.add("selected");
    currentColor = el.dataset.color;
  });
});

// 清除畫布
document.getElementById("clearCanvasBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sendCanvasData(); // 傳空資料同步
});

// 生成配對代碼
document.getElementById("createCodeBtn").addEventListener("click", async () => {
  const newCode = generateCode(6);
  const res = await fetch(API_URL + "/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: newCode }),
  });
  if (res.ok) {
    pairCode = newCode;
    alert("新配對代碼："+newCode);
  } else {
    alert("生成代碼失敗");
  }
});

// 連接配對代碼
document.getElementById("joinCodeBtn").addEventListener("click", async () => {
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
    alert("成功連接代碼：" + code);
    pollCanvasData(); // 開始輪詢同步畫布
  } else {
    alert("連接失敗：" + await res.text());
  }
});

// 傳畫布資料 (base64字串同步，簡單示範)
function sendCanvasData() {
  if (!pairCode) return;
  const dataUrl = canvas.toDataURL();
  fetch(API_URL + "/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: pairCode, data: { image: dataUrl } }),
  });
}

// 輪詢畫布資料並同步
async function pollCanvasData() {
  if (!pairCode) return;
  const res = await fetch(API_URL + "/poll?code=" + pairCode);
  if (!res.ok) return;
  const json = await res.json();
  if (!json.image) return;

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = json.image;

  // 1.5秒後繼續輪詢
  setTimeout(pollCanvasData, 1500);
}

// 產生隨機代碼 (A-Z0-9)
function generateCode(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
