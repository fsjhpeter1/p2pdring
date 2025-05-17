async function createCode(code) {
  const res = await fetch('https://p2p-drawing.fsjhpeter1.workers.dev/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error('Create failed: ' + (json.message || res.status));
  }
  return json;
}

async function joinCode(code) {
  const res = await fetch('https://p2p-drawing.fsjhpeter1.workers.dev/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error('Join failed: ' + (json.message || res.status));
  }
  return json;
}

async function sendData(to, data) {
  const res = await fetch('https://p2p-drawing.fsjhpeter1.workers.dev/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, data }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error('Send failed: ' + (json.message || res.status));
  }
  return json;
}

async function pollData(code) {
  const res = await fetch(`https://p2p-drawing.fsjhpeter1.workers.dev/poll?code=${encodeURIComponent(code)}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error('Poll failed: ' + (json.message || res.status));
  }
  return json.data;
}
