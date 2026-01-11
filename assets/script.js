// Shared script for index and birthday pages

// ------------------- Typewriter (homepage) -------------------
(function(){
  const phrases = [
    "Make a wish...",
    "Light the candles...",
    "Sing with us for Sonam!",
    "Party time — confetti ready!"
  ];

  const el = document.getElementById('typewriter');
  const messageEl = document.getElementById('home-message');
  if(!el) return;

  let idx = 0, char = 0, forward = true;
  function typeLoop(){
    const current = phrases[idx];
    if(forward){
      el.textContent = current.slice(0, ++char);
      if(char === current.length){ forward = false; setTimeout(typeLoop, 1200); return }
    } else {
      el.textContent = current.slice(0, --char);
      if(char === 0){ forward = true; idx = (idx+1) % phrases.length }
    }
    setTimeout(typeLoop, forward ? 80 : 30);
  }
  typeLoop();

  // update message to be personalized
  if(messageEl){
    messageEl.textContent = "Welcome — let's make this birthday unforgettable. Click the cake to begin the celebration!";
  }
})();

// ------------------- Birthday page logic -------------------
(function(){
  const cake = document.getElementById('cake');
  const candlesContainer = document.getElementById('candles');
  const blowBtn = document.getElementById('blowBtn');
  const resetBtn = document.getElementById('resetBtn');
  const canvas = document.getElementById('particlesCanvas');
  if(!cake || !candlesContainer || !canvas) return;

  // Canvas setup
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  window.addEventListener('resize', resize); resize();

  // Particle engine (confetti + hearts)
  let particles = [];
  let poppersActive = false;
  let popperInterval = null;

  function random(min,max){ return Math.random()*(max-min)+min }

  function spawnParticle(type){
    const x = random(0.2,0.8) * canvas.width;
    const y = random(0.05,0.25) * canvas.height;
    const size = type === 'heart' ? random(14,26) : random(6,14);
    const color = type === 'heart' ? `hsl(${Math.floor(random(320,360))}deg 80% 60%)` : `hsl(${Math.floor(random(0,360))}deg 75% 55%)`;
    const life = random(2200,4800);
    particles.push({x,y,vx:random(-1.5,1.5),vy:random(0.3,1.2),size,color,life,age:0,type,spin:random(-0.1,0.1) });
  }

  function startPoppers(){
    if(poppersActive) return; poppersActive = true;
    // spawn initial burst
    for(let i=0;i<40;i++){ spawnParticle(i%6? 'confetti' : 'heart') }
    // continuous spawning until reset
    popperInterval = setInterval(()=>{
      for(let i=0;i<8;i++){ spawnParticle(Math.random()>0.8? 'heart' : 'confetti') }
    }, 450);
  }

  function stopPoppers(){
    poppersActive = false; if(popperInterval){ clearInterval(popperInterval); popperInterval=null }
  }

  function drawParticle(p){
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.spin * p.age);
    ctx.globalAlpha = 1 - (p.age / p.life);
    if(p.type === 'heart'){
      // simple heart shape
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size/6);
      ctx.bezierCurveTo(p.size/2, -p.size/2, p.size, p.size/4, 0, p.size);
      ctx.bezierCurveTo(-p.size, p.size/4, -p.size/2, -p.size/2, 0, -p.size/6);
      ctx.closePath(); ctx.fill();
    } else {
      // confetti rectangle
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
    }
    ctx.restore();
  }

  function animate(time){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const now = Date.now();
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.age += 16;
      p.x += p.vx * (1 + p.age/800);
      p.y += p.vy * (1 + p.age/800);
      p.vy += 0.02; // gravity
      p.spin += 0.001;
      drawParticle(p);
      if(p.age > p.life || p.y > canvas.height + 60) particles.splice(i,1);
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Candle controls: relight/extinguish
  const candleEls = Array.from(candlesContainer.querySelectorAll('.candle'));
  function setCandles(on){ candleEls.forEach(c => { const f = c.querySelector('.flame'); if(f) f.setAttribute('data-on', on ? 'true' : 'false') }) }
  setCandles(true);

  // Melody using WebAudio
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioCtx ? new AudioCtx() : null;

  const notes = {
    'G4':392.00,'A4':440.00,'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.25,'F5':698.46,'G5':783.99
  };

  // Segments: line1, line2, line3/final
  const line1 = ['G4','G4','A4','G4','C5','B4'];
  const line2 = ['G4','G4','A4','G4','D5','C5'];
  const line3 = ['G4','G4','G5','E5','C5','B4','A4'];
  const line4 = ['F5','F5','E5','C5','D5','C5'];

  function playTone(freq, duration, when=0){
    if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime + when/1000);
    g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + when/1000 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + when/1000 + duration/1000);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(audioCtx.currentTime + when/1000);
    o.stop(audioCtx.currentTime + when/1000 + duration/1000 + 0.05);
  }

  function playSequence(seq, tempo=380, offset=0){
    let t = offset;
    seq.forEach((n,i)=>{
      const dur = (i === seq.length-1) ? tempo : tempo; // uniform for simplicity
      const f = notes[n];
      if(f) playTone(f,dur,t);
      t += dur + 80; // gap
    });
    return t; // total time
  }

  // Full song: sing line1+line2 twice, then 'Happy birthday dear Sonam' (line3+name)
  function singHappyBirthday(){
    if(!audioCtx) return;
    // resume context on some browsers
    if(audioCtx.state === 'suspended') audioCtx.resume();

    let t = 0;
    // first verse
    t = playSequence(line1.concat(line2), 360, t);
    // repeat
    t = playSequence(line1.concat(line2), 360, t + 120);
    // final with name (we'll play line3 then line4, with slightly longer last note to hold name)
    t = playSequence(line3, 380, t + 140);
    // hold last note for 'Sonam' by extending final tone
    // play a small extra tone for name emphasis
    setTimeout(()=>{ playSequence(line4, 420, 0) }, t);
  }

  // Trigger celebration: extinguish candles, start poppers and sing
  function celebrate(){
    setCandles(false);
    startPoppers();
    // play melody (sing twice then name then finish)
    singHappyBirthday();
  }

  cake.addEventListener('click', ()=>{ celebrate(); });
  blowBtn.addEventListener('click', ()=>{ celebrate(); });

  // Reset: relight candles, clear particles, stop poppers, and restart gentle poppers
  resetBtn.addEventListener('click', ()=>{
    // relight
    setCandles(true);
    // stop particle spawning but allow existing ones to fade
    stopPoppers();
    // clear current particles instantly
    particles = [];
    // small re-trigger: a gentle burst then continue poppers
    for(let i=0;i<24;i++) spawnParticle(i%5? 'confetti' : 'heart');
    // restart continuous poppers after a moment
    setTimeout(()=>{ startPoppers(); }, 600);
    // optionally re-trigger melody gently
    if(audioCtx) { if(audioCtx.state === 'suspended') audioCtx.resume(); }
  });

})();
