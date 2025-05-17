async function createCode(code) {
  try {
    const res = await fetch("https://你的worker子域名.workers.dev/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("Create failed");
  } catch (e) {
    console.error(e);
  }
}

async function joinCode(code) {
  try {
    const res = await fetch("https://你的worker子域名.workers.dev/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("Join failed");
  } catch (e) {
    console.error(e);
  }
}

async function sendDraw(to, data) {
  try {
    const res = await fetch("https://你的worker子域名.workers.dev/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, data }),
    });
    if (!res.ok) throw new Error("Send failed");
  } catch (e) {
    console.error(e);
  }
}

async function poll(code, callback) {
  try {
    const res = await fetch(`https://你的worker子域名.workers.dev/poll?code=${code}`);
    if (!res.ok) throw new Error("Poll failed");
    const data = await res.json();
    callback(data);
  } catch (e) {
    console.error(e);
  }
}
