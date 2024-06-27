async function apiCall(url, body = undefined, method = 'POST') {
  const response = await fetch(`/api/${url}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.json();
}

const btn = document.getElementById('mic-btn');
btn.addEventListener('mousedown', async () => {
  btn.style.backgroundColor = 'red';
  await apiCall('toggle-button', { status: 'ON' });
});

btn.addEventListener('mouseup', async () => {
  btn.style.backgroundColor = 'green';
  await apiCall('toggle-button', { status: 'OFF' });
});

const reset = document.getElementById('reset');

reset.addEventListener('click', async () => {
  await apiCall('reset-session');
});

const hello = document.getElementById('hello');

hello.addEventListener('click', async () => {
  await apiCall('greetings');
});
