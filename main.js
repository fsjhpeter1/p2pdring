const workerBaseUrl = "https://你的worker子域名.workers.dev";

async function createCode(code) {
  const res = await fetch(workerBaseUrl + "/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Create failed");
}

// 加強 join 會更新過期時間
async function joinCode(code) {
  const res = await fetch(workerBaseUrl + "/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Join failed");
}

// 傳送畫布資料時，也延長存活時間
async function sendDraw(to, data) {
  const res = await fetch(workerBaseUrl + "/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, data }),
  });
  if (!res.ok) throw new Error("Send failed");
}

// 輪詢取得畫布資料
async function poll(code, callback) {
  const res = await fetch(workerBaseUrl + "/poll?code=" + code);
  if (!res.ok) throw new Error("Poll failed");
  const data = await res.json();
  callback(data);
}

// 建立一組新代碼，並存Cloudflare
async function generateAndStoreCode() {
  const code = generatePairCode();
  await createCode(code);
  return code;
}

// 簡單的代碼產生器
function generatePairCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
