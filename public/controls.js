const btn = document.getElementById('btn');

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

const state = document.getElementById('state');

async function updateState(prevState) {
  const data = await apiCall('state', undefined, 'GET');
  if (prevState !== data.state) {
    state.innerHTML = data.state;
  }
  return data.state;
}

async function stateLoop() {
  let prevState = '';
  while (true) {
    prevState = await updateState(prevState);
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  stateLoop();
});
