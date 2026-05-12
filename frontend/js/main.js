/* ====== main.js — Landing page ====== */

document.addEventListener('DOMContentLoaded', () => {
  // Parallax hero on scroll
  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      heroBg.style.transform = `scale(1.05) translateY(${scroll * 0.15}px)`;
    });
  }

  // Animate number counters in hero stats
  animateCounters();
});

function animateCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.textContent);
    if (isNaN(target)) return;
    let current = 0;
    const increment = target / 40;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target + '+';
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current) + '+';
      }
    }, 40);
  });
}
