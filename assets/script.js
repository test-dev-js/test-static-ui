// Global script: page transitions + improved birthday interactions + homepage typewriter
(() => {
  const body = document.body;

  // Page transitions (unchanged)
  function setupPageTransitions() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin === location.origin && url.pathname.endsWith('.html') && !a.hasAttribute('data-no-transition')) {
        e.preventDefault();
        const content = document.getElementById('content');
        if (!content) return (location.href = a.href);
        content.classList.add('fade-out');
        content.addEventListener('transitionend', () => {
          location.href = a.href;
        }, {once:true});
      }
    });
    const content = document.getElementById('content');
    if (content) {
      requestAnimationFrame(() => content.classList.add('fade-in'));
    }
  }

  /* -------- HOMEPAGE: Typewriter -------- */
  function setupTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const phrases = [
      'My International Makeup Artist',
      'My Explorer',
      'My BetterHalf',
      'My Sweetheart'
    ];
    let pi = 0, idx = 0, typing = true;
    const TYPING_SPEED = 80;
    const PAUSE = 1200;

    function type() {
      const str = phrases[pi];
      if (typing) {
        idx++;
        el.textContent = str.slice(0, idx);
        if (idx >= str.length) {
          typing = false;
          setTimeout(type, PAUSE);
        } else setTimeout(type, TYPING_SPEED);
      } else {
        idx--;
        el.textContent = str.slice(0, idx);
        if (idx <= 0) {
          typing = true;
          pi = (pi + 1) % phrases.length;
          setTimeout(type, 200);
        } else setTimeout(type, TYPING_SPEED/2);
      }
    }
    type();
  }

  /* -------- BIRTHDAY: improved and more robust -------- */
  function setupBirthday() {
    if (!document.querySelector('.page--birthday')) return;

    const cake = document.getElementById('cake');
    const candlesContainer = document.getElementById('candles');
    const playBtn = document.getElementById('playBtn');
    const confettiCanvas = document.getElementById('confetti');
    const NUM_CANDLES = 7;

    let candlesLit = true;
    let audioCtx = null;

    function createCandles() {
      candlesContainer.innerHTML = '';
      for (let i=0;i<NUM_CANDLES;i++){
        const c = document.createElement('div');
        c.className = 'candle';
        const flame = document.createElement('div');
        flame.className = 'flame';
        c.appendChild(flame);
        candlesContainer.appendChild(c);
      }
    }

    function ensureAudioContext() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }

    // Reliable frequency calculator for notes like A4, C5 etc.
    function noteFreq(note) {
      const m = note.match(/^([A-G])(#?)(\d)$/);
      if (!m) return 440;
      const [, pitch, sharp, octaveStr] = m;
      const octave = parseInt(octaveStr, 10);
      const semitoneMap = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
      const key = semitoneMap[pitch] + (sharp ? 1:0);
      // A4 = 440; compute semitones from A4
      const semitoneFromA4 = key - 9 + (octave - 4) * 12;
      return 440 * Math.pow(2, semitoneFromA4/12);
    }

    function playNote(freq, startTime, duration=0.35) {
      const ctx = ensureAudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const s = ctx.currentTime + startTime;
      g.gain.exponentialRampToValueAtTime(0.18, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + startTime + duration);
      o.start(s);
      o.stop(s + startTime + duration + 0.02);
    }

    // Simplified happy birthday melody (timing tuned)
    const MELODY = [
      ['G4',0.0],['G4',0.5],['A4',1.0],['G4',1.6],['C5',2.2],['B4',2.8],
      ['G4',4.0],['G4',4.5],['A4',5.0],['G4',5.6],['D5',6.2],['C5',6.8]
    ];

    function playHappyBirthday() {
      try {
        const ctx = ensureAudioContext();
        if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
      } catch(e) {
        // ignore
      }
      for (const [note, when] of MELODY) {
        playNote(noteFreq(note), when, 0.45);
      }
    }

    // Confetti/hearts using canvas for a soft look
    function runConfetti() {
      const canvas = confettiCanvas;
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio);
      const pieces = [];
      const colors = ['#ff9bb3','#ffd1e6','#ffefef','#ffc1d9','#ff7aa2'];
      for (let i=0;i<120;i++){
        pieces.push({
          x: Math.random()*innerWidth,
          y: Math.random()*-innerHeight,
          size: 6+Math.random()*12,
          color: colors[Math.floor(Math.random()*colors.length)],
          velY: 1+Math.random()*3,
          velX: -1+Math.random()*2,
          rot: Math.random()*360,
          rotVel: -3+Math.random()*6
        });
      }
      let frame = 0;
      function draw(){
        frame++;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (const p of pieces){
          p.x += p.velX;
          p.y += p.velY;
          p.rot += p.rotVel;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot * Math.PI / 180);
          // draw little heart-ish shape
          ctx.fillStyle = p.color;
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s/2);
          ctx.bezierCurveTo(s/2, -s, s, -s/4, 0, s/2);
          ctx.bezierCurveTo(-s, -s/4, -s/2, -s, 0, -s/2);
          ctx.fill();
          ctx.restore();
        }
        if (frame < 400) requestAnimationFrame(draw);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
      }
      requestAnimationFrame(draw);
    }

    function extinguishCandles() {
      if (!candlesLit) return;
      candlesLit = false;
      document.querySelectorAll('.candle').forEach(c => c.classList.add('extinguished'));
      playHappyBirthday();
      runConfetti();
      cake.style.transform = 'scale(1.03)';
      setTimeout(()=> cake.style.transform = '', 700);
    }

    // Microphone blow detection (simple energy threshold)
    function setupMicBlow() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
        const ctx = ensureAudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        const data = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        let raf;
        function sample() {
          analyser.getByteFrequencyData(data);
          let values = 0;
          for (let i=0;i<data.length;i++){ values += data[i]; }
          const average = values / data.length;
          // threshold adapted: louder -> blow
          if (average > 40) {
            extinguishCandles();
            cancelAnimationFrame(raf);
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          raf = requestAnimationFrame(sample);
        }
        sample();
      }).catch(()=>{/* ignore permission denied */});
    }

    // init
    createCandles();

    cake.addEventListener('click', (e) => { e.preventDefault(); extinguishCandles(); });
    cake.addEventListener('touchstart', (e) => { e.preventDefault(); extinguishCandles(); });

    playBtn.addEventListener('click', () => {
      try { ensureAudioContext(); if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch(e){}
      extinguishCandles();
    });

    setupMicBlow();

    // small prime to increase chance of audio working after user interaction
    (function primeAudio(){ try{ const ctx = ensureAudioContext(); const o = ctx.createOscillator(); const g = ctx.createGain(); g.gain.value = 0.00001; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.01); }catch(e){} }());

    cake.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); extinguishCandles(); } });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    setupPageTransitions();
    setupTypewriter();
    setupBirthday();
  });

})();
