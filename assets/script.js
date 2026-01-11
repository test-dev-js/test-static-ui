// Global script: page transitions + romantic birthday interactions
(() => {
  const body = document.body;

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

    function playNote(freq, when = 0, duration = 0.35) {
      const ctx = ensureAudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const start = ctx.currentTime + when;
      g.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + when + duration);
      o.start(start);
      o.stop(start + when + duration + 0.02);
    }

    const NAME_TO_FREQ = new Proxy({}, {
      get: (_, name) => {
        if (!name || typeof name !== 'string') return 440;
        const m = name.match(/^([A-G])(#?)(\d)$/);
        if (!m) return 440;
        const [_, pitch, sharp, octave] = m;
        const semitoneMap = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
        const key = semitoneMap[pitch] + (sharp ? 1:0);
        const a4 = 440;
        const semitoneFromA4 = key - 9 + (octave - 4) * 12;
        return a4 * Math.pow(2, semitoneFromA4/12);
      }
    });

    const MELODY = [
      ['G4',0.0],['G4',0.5],['A4',1.0],['G4',1.6],['C5',2.1],['B4',2.6],
      ['G4',3.4],['G4',3.9],['A4',4.4],['G4',5.0],['D5',5.6],['C5',6.1],
      ['G4',7.0],['G4',7.6],['G5',8.2],['E5',8.8],['C5',9.4],['B4',9.9],['A4',10.4],
      ['F5',11.4],['F5',12.0],['E5',12.6],['C5',13.2],['D5',13.8],['C5',14.4]
    ];

    function playHappyBirthday() {
      const ctx = ensureAudioContext();
      if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
      for (const pair of MELODY) {
        const [name, when] = pair;
        const freq = NAME_TO_FREQ[name] || 440;
        playNote(freq, when, 0.35);
      }
    }

    function runConfetti() {
      const canvas = confettiCanvas;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      const ctx = canvas.getContext('2d');
      const pieces = [];
      const colors = ['#ff9bb3','#ffd1e6','#ffefef','#ffc1d9','#ff7aa2'];
      for (let i=0;i<120;i++){
        pieces.push({
          x: Math.random()*canvas.width,
          y: Math.random()*-canvas.height,
          w: 6+Math.random()*8,
          h: 8+Math.random()*10,
          color: colors[Math.floor(Math.random()*colors.length)],
          velY: 2+Math.random()*4,
          velX: -2+Math.random()*4,
          rot: Math.random()*360,
          rotVel: -6+Math.random()*12
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
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.h/2);
          ctx.ellipse(0, -p.h/4, p.w/2, p.h/2, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
        if (frame < 350) requestAnimationFrame(draw);
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
      setTimeout(()=> cake.style.transform = '', 600);
    }

    function setupMicBlow() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      let analyser, source, raf;
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
        const ctx = ensureAudioContext();
        source = ctx.createMediaStreamSource(stream);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const data = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);

        function sample() {
          analyser.getByteFrequencyData(data);
          let values = 0;
          for (let i=0;i<data.length;i++){ values += data[i]; }
          const average = values / data.length;
          if (average > 35) {
            extinguishCandles();
            cancelAnimationFrame(raf);
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          raf = requestAnimationFrame(sample);
        }
        sample();
      }).catch(()=>{});
    }

    createCandles();

    cake.addEventListener('click', () => { extinguishCandles(); });
    cake.addEventListener('touchstart', (e) => { e.preventDefault(); extinguishCandles(); });

    playBtn.addEventListener('click', () => {
      try { ensureAudioContext(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch(e){}
      extinguishCandles();
    });

    setupMicBlow();

    (function primeAudio() {
      try {
        const ctx = ensureAudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        g.gain.value = 0.00001;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.01);
      } catch(e){}
    }());

    cake.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); extinguishCandles(); } });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupPageTransitions();
    setupBirthday();
  });

})();
