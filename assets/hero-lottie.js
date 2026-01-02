/* Lazy Lottie hero background
   - Lazy-loads lottie-web from CDN when the hero is near viewport
   - Respects prefers-reduced-motion (shows a static gradient fallback)
   - Pauses animation when hero is off-screen and resumes when visible
   - Uses renderer: 'svg' by default; switches to 'canvas' if poor performance
   - Non-blocking (pointer-events:none), subtle opacity, loops
*/
const LOTTIE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.10.1/lottie.min.js';
const LOTTIE_PATH = '/assets/lottie/abstract-apps.json'; // place your JSON here (rename as requested)
let lottieLibLoaded = false;
let animation = null;
let perfWatcher = null;

function loadScript(src){
  return new Promise((resolve, reject)=>{
    if(document.querySelector(`script[src=\"${src}\"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = ()=> resolve();
    s.onerror = (e) => reject(new Error('Failed to load ' + src));
    document.head.appendChild(s);
  });
}

function initLottie(renderer = 'svg'){
  if(!window.lottie) return Promise.reject(new Error('lottie not available'));
  const container = document.getElementById('hero-lottie');
  if(!container) return Promise.reject(new Error('No hero lottie container'));

  // Clear any existing content
  container.innerHTML = '';
  // Create the animation
  try{
    animation = window.lottie.loadAnimation({
      container,
      renderer,
      loop: true,
      autoplay: true,
      path: LOTTIE_PATH,
      rendererSettings: { preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true }
    });
  }catch(err){
    console.error('Lottie init error', err);
    return Promise.reject(err);
  }

  // Ensure pointer events don't block
  container.style.pointerEvents = 'none';

  // Pause on page hidden, resume when visible
  document.addEventListener('visibilitychange', ()=>{
    if(!animation) return;
    if(document.hidden) animation.pause(); else animation.play();
  });

  // Observe visibility of the hero container and pause/resume
  const heroSection = container.closest('section');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(!animation) return;
      if(entry.isIntersecting){ animation.play(); startPerfWatchIfNeeded(); }
      else { animation.pause(); stopPerfWatch(); }
    });
  }, { threshold: 0.15 });
  if(heroSection) obs.observe(heroSection);

  // Start perf watch to decide if we should switch to canvas
  startPerfWatchIfNeeded();
  return Promise.resolve(animation);
}

function destroyAnimation(){
  if(animation && animation.destroy) animation.destroy();
  animation = null;
  stopPerfWatch();
}

function startPerfWatchIfNeeded(){
  if(perfWatcher) return; // already watching
  // Only watch for a short period after playback begins
  let frames = 0, total = 0, last = performance.now();
  let running = true;
  function tick(){
    if(!running) return;
    const now = performance.now();
    total += (now - last);
    last = now;
    frames++;
    // stop after ~2.5 seconds or 150 frames
    if(frames < 150){
      perfWatcher = requestAnimationFrame(tick);
    }else{
      running = false;
      perfWatcher = null;
      const avg = total / frames;
      // If average frame time > 40ms (25fps), and we're using svg, switch to canvas
      if(avg > 40 && animation && animation.renderer && animation.renderer.elements){
        // Try switching to canvas
        if(animation.renderer && animation.renderer === 'svg'){
          console.info('Hero Lottie: poor performance detected (avg frame ~' + Math.round(avg) + 'ms), switching to canvas renderer');
          const heroSection = document.getElementById('hero-lottie')?.closest('section');
          destroyAnimation();
          // Re-init with canvas
          initLottie('canvas').catch(err=>console.warn('Re-init to canvas failed', err));
        }
      }
    }
  }
  perfWatcher = requestAnimationFrame(tick);
}
function stopPerfWatch(){
  if(perfWatcher){ cancelAnimationFrame(perfWatcher); perfWatcher = null; }
}

// Entry: set up an observer to pre-load lottie when hero is near viewport
(function(){
  const container = document.getElementById('hero-lottie');
  if(!container) return;
  const heroSection = container.closest('section');
  if(!heroSection) return;

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced){
    heroSection.classList.add('hero-lottie-fallback');
    return; // don't load the animation
  }

  const preloadObserver = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){
        // Load library and init
        obs.disconnect();
        (async ()=>{
          try{
            await loadScript(LOTTIE_CDN);
            lottieLibLoaded = true;
            await initLottie('svg');
          }catch(err){
            console.warn('Lottie failed to load or init:', err);
            heroSection.classList.add('hero-lottie-fallback');
          }
        })();
      }
    });
  }, { rootMargin: '300px' });

  // Start observing the section
  preloadObserver.observe(heroSection);
})();

// Expose for debugging
window.__heroLottie = {
  init: initLottie,
  destroy: destroyAnimation
};
