const btn = document.getElementById('btn');
btn.addEventListener('mousedown', async () => {
  btn.style.backgroundColor = 'red';
  await fetch('/update_button_status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'ON' }),
  });
});
btn.addEventListener('mouseup', async () => {
  btn.style.backgroundColor = 'green';
  await fetch('/update_button_status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'OFF' }),
  });
});

const reset = document.getElementById('reset');

reset.addEventListener('click', async () => {
  await fetch('/reset_session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '',
  });
});

const hello = document.getElementById('hello');

hello.addEventListener('click', async () => {
  await fetch('/hello', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '',
  });
});

const state = document.getElementById('state');

async function updateState(prevState) {
  const response = await fetch('/state');
  const data = await response.json();
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
