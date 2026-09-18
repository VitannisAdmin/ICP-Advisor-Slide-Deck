import './index.css';

// State Management
let currentSlideIndex = 0;
const totalSlides = 9;
let currentMode: 'presentation' | 'overview' = 'presentation';

function initDeck(): void {
  const slides = document.querySelectorAll<HTMLElement>('.slide');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');
  const counterCurrent = document.getElementById('current-slide-num');
  const counterTotal = document.getElementById('total-slides-num');
  const dotsContainer = document.getElementById('slide-dots-container');
  const modePresentationBtn = document.getElementById('mode-presentation-btn');
  const modeOverviewBtn = document.getElementById('mode-overview-btn');
  const fsBtn = document.getElementById('fullscreen-toggle-btn');
  const chartTooltip = document.getElementById('chart-interactive-tooltip');

  if (counterTotal) {
    counterTotal.textContent = String(totalSlides);
  }

  // Create dot indicators
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.id = `slide-dot-${i}`;
      dot.setAttribute('aria-label', `Navigate to slide ${i + 1}`);
      dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${
        i === currentSlideIndex ? 'bg-cyan-400 w-8' : 'bg-slate-500 hover:bg-slate-400'
      }`;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateSlideUI(): void {
    if (counterCurrent) {
      counterCurrent.textContent = String(currentSlideIndex + 1);
    }

    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active-slide');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('active-slide');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // Update dot styles
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.getElementById(`slide-dot-${i}`);
      if (dot) {
        if (i === currentSlideIndex) {
          dot.className = 'w-8 h-2.5 rounded-full bg-cyan-400 transition-all duration-300';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-500 hover:bg-slate-400 transition-all duration-300';
        }
      }
    }

    // Button states
    if (prevBtn) {
      if (currentSlideIndex === 0) {
        prevBtn.setAttribute('disabled', 'true');
        prevBtn.classList.add('opacity-40', 'cursor-not-allowed');
      } else {
        prevBtn.removeAttribute('disabled');
        prevBtn.classList.remove('opacity-40', 'cursor-not-allowed');
      }
    }

    if (nextBtn) {
      if (currentSlideIndex === totalSlides - 1) {
        nextBtn.setAttribute('disabled', 'true');
        nextBtn.classList.add('opacity-40', 'cursor-not-allowed');
      } else {
        nextBtn.removeAttribute('disabled');
        nextBtn.classList.remove('opacity-40', 'cursor-not-allowed');
      }
    }
  }

  function goToSlide(index: number): void {
    if (index >= 0 && index < totalSlides) {
      currentSlideIndex = index;
      updateSlideUI();
    }
  }

  function nextSlide(): void {
    if (currentSlideIndex < totalSlides - 1) {
      currentSlideIndex++;
      updateSlideUI();
    }
  }

  function prevSlide(): void {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      updateSlideUI();
    }
  }

  // Bind Buttons
  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);

  // Keyboard navigation
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Avoid interfering if focus is on an input or textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement?.tagName || ''))) {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(totalSlides - 1);
    }
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  const viewport = document.getElementById('slide-deck-viewport');

  viewport?.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport?.addEventListener('touchend', (e: TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });

  // Mode Switching
  function setMode(mode: 'presentation' | 'overview'): void {
    currentMode = mode;
    document.body.classList.remove('mode-presentation', 'mode-overview');
    document.body.classList.add(`mode-${mode}`);

    if (mode === 'presentation') {
      modePresentationBtn?.classList.add('bg-teal-700', 'text-white');
      modePresentationBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
      modeOverviewBtn?.classList.remove('bg-teal-700', 'text-white');
      modeOverviewBtn?.classList.add('text-slate-300', 'hover:bg-slate-800');
      updateSlideUI();
    } else {
      modeOverviewBtn?.classList.add('bg-teal-700', 'text-white');
      modeOverviewBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
      modePresentationBtn?.classList.remove('bg-teal-700', 'text-white');
      modePresentationBtn?.classList.add('text-slate-300', 'hover:bg-slate-800');
    }
  }

  modePresentationBtn?.addEventListener('click', () => setMode('presentation'));
  modeOverviewBtn?.addEventListener('click', () => setMode('overview'));

  // Fullscreen
  fsBtn?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      viewport?.requestFullscreen?.().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
    }
  });

  // Chart Interactive Tooltips
  const chartPoints = document.querySelectorAll<SVGCircleElement>('.chart-interactive-point');
  chartPoints.forEach((point) => {
    point.addEventListener('mouseenter', (e: MouseEvent) => {
      const year = point.getAttribute('data-year') || '';
      const strat = point.getAttribute('data-strategy') || '';
      const val = point.getAttribute('data-val') || '';

      if (chartTooltip) {
        chartTooltip.innerHTML = `
          <div class="font-bold text-slate-800 mb-0.5">${year}</div>
          <div class="text-xs text-slate-500 font-medium">${strat}</div>
          <div class="text-base font-bold text-teal-800 mt-1">${val}</div>
        `;
        chartTooltip.classList.remove('hidden');
        chartTooltip.style.left = `${e.clientX + 12}px`;
        chartTooltip.style.top = `${e.clientY - 40}px`;
      }
    });

    point.addEventListener('mouseleave', () => {
      if (chartTooltip) {
        chartTooltip.classList.add('hidden');
      }
    });

    point.addEventListener('mousemove', (e: MouseEvent) => {
      if (chartTooltip) {
        chartTooltip.style.left = `${e.clientX + 12}px`;
        chartTooltip.style.top = `${e.clientY - 40}px`;
      }
    });
  });

  // Initialize
  setMode('presentation');
  updateSlideUI();
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeck);
} else {
  initDeck();
}
