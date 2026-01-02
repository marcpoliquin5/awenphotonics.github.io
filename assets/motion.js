document.addEventListener('DOMContentLoaded', function(){
  // Respect reduced motion preference
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.reveal').forEach(function(e){ e.classList.add('is-revealed') });
    if(window.feather) feather.replace();
    return;
  }

  // Graceful guard if GSAP not loaded yet
  function initMotion(){
    if(!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ease: "power3.out", duration: 0.8});

    // Reveal on scroll (fade + translate)
    gsap.utils.toArray('.reveal').forEach(function(el){
      gsap.fromTo(el, {autoAlpha:0, y: 24}, {
        duration: 0.8,
        autoAlpha:1,
        y:0,
        ease: "power3.out",
        scrollTrigger:{
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        onComplete: function(){ el.classList.add('is-revealed') }
      });
    });

    // Pin the computational crisis for a short interval and sequence its content
    var crisis = document.querySelector('#computational-crisis');
    if(crisis){
      var center = crisis.querySelector('.lg\:text-center') || crisis.querySelector('div');
      var items = crisis.querySelectorAll('div.relative');
      var tl = gsap.timeline({
        scrollTrigger:{
          trigger: crisis,
          start: "top top",
          end: "+=700",
          scrub: true,
          pin: true
        }
      });
      tl.from(center, {y:40, autoAlpha:0, duration:0.6});
      tl.from(items, {y:30, autoAlpha:0, stagger:0.15, duration:0.5}, "<");
    }

    // Small nav micro-interactions
    document.querySelectorAll('nav.motion-nav a').forEach(link => {
      link.addEventListener('mouseenter', () => gsap.to(link, {scale:1.02, duration:0.18}));
      link.addEventListener('mouseleave', () => gsap.to(link, {scale:1, duration:0.18}));
    });

    // Mark current nav link by location (very lightweight)
    var path = location.pathname.split('/').pop();
    if(!path) path = 'index.html';
    document.querySelectorAll('nav.motion-nav a').forEach(a=>{
      var href = a.getAttribute('href');
      if(!href) return;
      if(href.includes(path) || (path==='index.html' && href==="#")) a.classList.add('active');
    });

    // Feather icons replacement
    if(window.feather) feather.replace();
  }

  if(window.gsap && window.ScrollTrigger) initMotion();
  else{
    // Wait up to a little while if scripts load deferred
    var observer = setInterval(function(){ if(window.gsap && window.ScrollTrigger){ clearInterval(observer); initMotion() } }, 200);
    setTimeout(function(){ clearInterval(observer); }, 5000);
  }
});