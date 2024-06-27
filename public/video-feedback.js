const states = {
  idle: '/video/1.mp4',
  waiting: '/video/2.mp4',
  listening: '/video/3.mp4',
  thinking: '/video/4.mp4',
  speaking: '/video/5.mp4',
};

async function getState() {
  const response = await fetch('/api/state');
  const data = await response.json();
  return data.state;
}

function changeState(newState) {
  const src = states[newState];
  if (!src) {
    return;
  }
  const activeVideo = document.querySelector('.active-video');
  const inactiveVideo = document.querySelector('.inactive-video');

  inactiveVideo.src = src;
  inactiveVideo.load();
  inactiveVideo.play();

  inactiveVideo.classList.replace('inactive-video', 'active-video');
  activeVideo.classList.replace('active-video', 'inactive-video');

  setTimeout(() => {
    activeVideo.style.opacity = '0';
    inactiveVideo.style.opacity = '1';
  }, 0);
}

async function stateLoop() {
  let prevState = 'idle';
  while (true) {
    try {
      const state = await getState();
      if (state !== prevState) {
        changeState(state);
        prevState = state;
      }
    } catch (e) {
      console.error(e);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  stateLoop();
});
