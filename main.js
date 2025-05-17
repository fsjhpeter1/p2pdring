async function createCode(code) {
  const res = await fetch('https://p2p-drawing.fsjhpeter1.workers.dev/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Create failed: ' + res.status);
  const json = await res.json();
  return json;
}

async function joinCode(code) {
  const res = await fetch('https://p2p-drawing.fsjhpeter1.workers.dev/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Join failed: ' + res.status);
  const json = await res.json();
  return json;
}
