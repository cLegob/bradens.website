const text = document.getElementById('shadow-text');
const maxShadowOffset = 30;

function applyShadow(offsetX, offsetY) {
  text.style.textShadow = `
    ${offsetX}px ${offsetY}px 12px rgba(0,0,0,0.9),
    ${-offsetX}px ${-offsetY}px 15px rgba(255,255,255,0.15)
  `;
}

function handlePointer(x, y) {
  const shadowX = (-x / (window.innerWidth / 2)) * maxShadowOffset;
  const shadowY = (-y / (window.innerHeight / 2)) * maxShadowOffset;
  applyShadow(shadowX, shadowY);
}

// Touch move for mobile
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    const x = touch.clientX - window.innerWidth / 2;
    const y = touch.clientY - window.innerHeight / 2;
    handlePointer(x, y);
  }
});

// Mouse move fallback for desktop
document.addEventListener('mousemove', (e) => {
  const x = e.clientX - window.innerWidth / 2;
  const y = e.clientY - window.innerHeight / 2;
  handlePointer(x, y);
});
