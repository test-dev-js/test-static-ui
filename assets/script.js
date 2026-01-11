// Global script: page transitions + homepage typewriter + birthday (SVG cake, candles, confetti, reset)
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

  /* Typewriter (homepage) */
  function setupTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const phrases = [
      'My Superrrrwomen & Superrrr Explorer',
      'My Best Half',
      'My Pasandida Stree',
      'My Sweetheart',
      'My Chilli Potato Bby'
    ];
    let pi = 0, idx = 0, typing = true;
    const TYPING_SPEED = 45;
    const PAUSE = 800;

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

  /* Birthday page behaviors (SVG cake + confetti) */
  function setupBirthday() {
    if (!document.querySelector('.page--birthday')) return;

    const cakeSvg = document.getElementById('cake-svg');
    const flames = Array.from(cakeSvg.querySelectorAll('.flame'));
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const confettiCanvas = document.getElementById('confetti');

    let candlesLit = true;
    let audioCtx = null;
    let confettiRunning = false;
    let confettiPieces = [];
    let confettiRAF = null;

    function ensureAudioContext() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }

    // note freq helper
    function noteFreq(note) {
      const m = note.match(/^([A-G])(#?)(\d)$/);
      if (!m) return 440;
      const [, pitch, sharp, octaveStr] = m;
      const octave = parseInt(octaveStr, 10);
      const semitoneMap = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
      const key = semitoneMap[pitch] + (sharp ? 1:0);
      const a4 = 440;
      const semitoneFromA4 = key - 9 + (octave - 4) * 12;
      return a4 * Math.pow(2, semitoneFromA4/12);
    }

    function playNote(freq, when = 0, duration = 0.35) {
      const ctx = ensureAudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      const s = ctx.currentTime + when;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.18, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + when + duration);
      o.start(s); o.stop(s + when + duration + 0.02);
    }

    // full melody sequence (two times + name + final)
    const PHRASE1 = [['G4',0.0],['G4',0.4],['A4',0.9],['G4',1.4],['C5',1.9],['B4',2.4]];
    const PHRASE2 = [['G4',3.2],['G4',3.6],['A4',4.1],['G4',4.6],['D5',5.1],['C5',5.6]];
    const PHRASE3 = [['G4',7.0],['G4',7.6],['G5',8.2],['E5',8.8],['C5',9.4],['B4',9.9],['A4',10.5]];
    const PHRASE4 = [['F5',11.4],['F5',12.0],['E5',12.6],['C5',13.2],['D5',13.8],['C5',14.4]];
    const FULL_MELODY = [...PHRASE1, ...PHRASE1.map(([n,t])=>[n,t + 3.2]), ...PHRASE3, ...PHRASE4];

    function playFullHappyBirthday() {
      try { const ctx = ensureAudioContext(); if (ctx.state === 'suspended') ctx.resume().catch(()=>{}); } catch(e){}
      for (const [name, when] of FULL_MELODY) {
        playNote(noteFreq(name), when, 0.45);
      }
    }

    // --- confetti hearts (continuous)
    function initConfetti() {
      const canvas = confettiCanvas;
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio);
      confettiPieces = [];
      const colors = ['#ff9bb3','#ffd1e6','#ffefef','#ffc1d9','#ff7aa2'];
      for (let i=0;i<120;i++){
        confettiPieces.push({x: Math.random()*innerWidth, y: Math.random()*-innerHeight, size: 6+Math.random()*12, color: colors[Math.floor(Math.random()*colors.length)], velY: 1+Math.random()*3, velX: -1+Math.random()*2, rot: Math.random()*360, rotVel: -3+Math.random()*6});
      }
    }

    function startConfetti() {
      if (confettiRunning) return; confettiRunning = true; initConfetti();
      const canvas = confettiCanvas; const ctx = canvas.getContext('2d');
      function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (const p of confettiPieces){
          p.x += p.velX; p.y += p.velY; p.rot += p.rotVel;
          // recycle
          if (p.y > innerHeight + 20) { p.y = -20 - Math.random()*innerHeight; p.x = Math.random()*innerWidth; }
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
          ctx.fillStyle = p.color; const s = p.size;
          ctx.beginPath(); ctx.moveTo(0, -s/2); ctx.bezierCurveTo(s/2, -s, s, -s/4, 0, s/2); ctx.bezierCurveTo(-s, -s/4, -s/2, -s, 0, -s/2); ctx.fill(); ctx.restore();
        }
        confettiRAF = requestAnimationFrame(draw);
      }
      draw();
    }

    function stopConfetti() { confettiRunning = false; if (confettiRAF) cancelAnimationFrame(confettiRAF); const canvas = confettiCanvas; const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); }

    function extinguishCandles() {
      if (!candlesLit) return;
      candlesLit = false;
      flames.forEach(f => f.classList.add('extinguished'));
      playFullHappyBirthday();
      startConfetti();
    }

    function relightCandles() {
      flames.forEach(f => f.classList.remove('extinguished'));
      candlesLit = true;
      stopConfetti();
      if (audioCtx && audioCtx.state !== 'closed') { try{ audioCtx.close(); }catch(e){} audioCtx = null; }
    }

    // mic blow detection (energy threshold)
    function setupMicBlow() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
        const ctx = ensureAudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser(); analyser.fftSize = 512; const data = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        let raf;
        function sample(){ analyser.getByteFrequencyData(data); let values=0; for(let i=0;i<data.length;i++) values+=data[i]; const average = values/data.length; if (average>42) { extinguishCandles(); cancelAnimationFrame(raf); stream.getTracks().forEach(t=>t.stop()); return; } raf = requestAnimationFrame(sample); }
        sample();
      }).catch(()=>{});
    }

    // wire UI
    cakeSvg.addEventListener('click', (e)=>{ e.preventDefault(); extinguishCandles(); });
    playBtn.addEventListener('click', ()=>{ try{ ensureAudioContext(); if(audioCtx && audioCtx.state==='suspended') audioCtx.resume(); }catch(e){} extinguishCandles(); });
    resetBtn.addEventListener('click', (e)=>{ e.preventDefault(); relightCandles(); });

    setupMicBlow();
    // prime audio
    (function prime(){ try{ const ctx = ensureAudioContext(); const o = ctx.createOscillator(); const g = ctx.createGain(); g.gain.value = 0.00001; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.01); }catch(e){} }());

  }

  document.addEventListener('DOMContentLoaded', () => {
    setupPageTransitions();
    setupTypewriter();
    setupBirthday();
  });

})();
