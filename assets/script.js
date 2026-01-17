// SPA behavior: typewriter, scroll arrow, and birthday interactions (SVG cake, candles, confetti, reset)
// Keep functions small and robust; feature detection for Audio and mic.

(() => {
  // Page transitions not needed in SPA; keep smooth scrolling
  document.documentElement.style.scrollBehavior = 'smooth';

  /* TYPEWRITER (exact phrases requested) */
  function setupTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const phrases = [
      "My International Makeup Artist",
      "My Super Women & Wanderlust",
      "My Best Half",
      "My Pasandida Stree",
      "My Sweetheart",
      "My Sona Darling",
      "My Chilli Potato Baby"
    ];
    let pi = 0, idx = 0, typing = true;
    const TYPING_SPEED = 40;
    const PAUSE = 900;

    function tick() {
      const str = phrases[pi];
      if (typing) {
        idx++;
        el.textContent = str.slice(0, idx);
        if (idx >= str.length) {
          typing = false;
          setTimeout(tick, PAUSE);
        } else {
          setTimeout(tick, TYPING_SPEED);
        }
      } else {
        idx--;
        el.textContent = str.slice(0, idx);
        if (idx <= 0) {
          typing = true;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 200);
        } else {
          setTimeout(tick, Math.max(20, TYPING_SPEED/2));
        }
      }
    }
    tick();
  }

  /* SCROLL DOWN ARROW */
  function setupScrollArrow() {
    const btn = document.getElementById('scrollDown');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = document.querySelector('[data-section] + [data-section]') || document.querySelector('#about');
      if (next) next.scrollIntoView({behavior:'smooth'});
    });
  }

  /* BIRTHDAY: Image-based cake interactions + audio + continuous confetti + reset */
  function setupBirthday() {
    // Try both standalone page and index.html section
    const cakeImage = document.getElementById('cake-image') || document.getElementById('cake-image-index');
    const confettiCanvas = document.getElementById('confetti');
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const birthdayMessage = document.getElementById('birthday-message');
    const flameOverlay = document.getElementById('flame-overlay');
    let birthdaySong = document.getElementById('birthday-song') || document.getElementById('birthday-song-index');
    
    if (!cakeImage || !confettiCanvas) return;
    
    let candlesLit = true;
    let audioCtx = null;
    let confettiRunning = false;
    let confettiRAF = null;
    let confettiPieces = [];

    function ensureAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }

    // note frequency helper
    function freq(note) {
      const m = note.match(/^([A-G])(#?)(\d)$/);
      if (!m) return 440;
      const [, p, sharp, o] = m;
      const octave = parseInt(o,10);
      const semitone = {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[p] + (sharp?1:0);
      const semitoneFromA4 = semitone - 9 + (octave - 4) * 12;
      return 440 * Math.pow(2, semitoneFromA4/12);
    }

    function playNote(frequency, when=0, duration=0.38) {
      const ctx = ensureAudio();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = frequency;
      o.connect(g); g.connect(ctx.destination);
      const start = ctx.currentTime + when;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      o.start(start);
      o.stop(start + duration + 0.02);
    }

    // Melody: two times 'Happy birthday to you' then 'Happy birthday dear Sonam' then final
    const PH1 = [['G4',0],['G4',0.4],['A4',0.9],['G4',1.4],['C5',1.9],['B4',2.4]];
    const PH2 = [['G4',3.2],['G4',3.6],['A4',4.1],['G4',4.6],['D5',5.1],['C5',5.6]];
    const PH3 = [['G4',7.0],['G4',7.6],['G5',8.2],['E5',8.8],['C5',9.4],['B4',9.9],['A4',10.5]];
    const PH4 = [['F5',11.4],['F5',12.0],['E5',12.6],['C5',13.2],['D5',13.8],['C5',14.4]];
    const FULL = [...PH1, ...PH1.map(r=>[r[0], r[1]+3.2]), ...PH3, ...PH4];

    function playHappy() {
      try { const ctx = ensureAudio(); if (ctx.state === 'suspended') ctx.resume().catch(()=>{}); } catch(e){}
      for (const [n,t] of FULL) playNote(freq(n), t, 0.44);
    }

    /* CONFETTI - continuous hearts/particles */
    function initConfetti() {
      const canvas = confettiCanvas;
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(devicePixelRatio,devicePixelRatio);
      confettiPieces = [];
      const colors = ['#ff9bb3','#ffd1e6','#ffefef','#ffc1d9','#ff7aa2'];
      for (let i=0;i<140;i++){
        confettiPieces.push({
          x: Math.random()*innerWidth,
          y: Math.random()*-innerHeight,
          size: 6 + Math.random()*12,
          color: colors[Math.floor(Math.random()*colors.length)],
          vx: -1 + Math.random()*2,
          vy: 1 + Math.random()*3,
          rot: Math.random()*360,
          drot: -3 + Math.random()*6
        });
      }
    }

    function startConfetti() {
      if (confettiRunning) return;
      confettiRunning = true;
      initConfetti();
      const canvas = confettiCanvas;
      const ctx = canvas.getContext('2d');
      function frame() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (const p of confettiPieces) {
          p.x += p.vx; p.y += p.vy; p.rot += p.drot;
          if (p.y > innerHeight + 20) { p.y = -20 - Math.random()*innerHeight; p.x = Math.random()*innerWidth; }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot * Math.PI / 180);
          ctx.fillStyle = p.color;
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s/2);
          ctx.bezierCurveTo(s/2, -s, s, -s/4, 0, s/2);
          ctx.bezierCurveTo(-s, -s/4, -s/2, -s, 0, -s/2);
          ctx.fill();
          ctx.restore();
        }
        confettiRAF = requestAnimationFrame(frame);
      }
      frame();
    }

    function stopConfetti() {
      confettiRunning = false;
      if (confettiRAF) cancelAnimationFrame(confettiRAF);
      const canvas = confettiCanvas; const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    function extinguish() {
      if (!candlesLit) return;
      candlesLit = false;
      
      // Change cake image to candles off and hide flames
      cakeImage.src = 'assets/Candle2.JPG';
      if (flameOverlay) flameOverlay.style.display = 'none';
      
      startConfetti();
      
      // Hide subtitle and show birthday message
      const subtitle = document.getElementById('birthday-subtitle');
      if (subtitle) subtitle.style.opacity = '0';
      
      if (birthdayMessage) {
        setTimeout(() => {
          birthdayMessage.style.opacity = '1';
          birthdayMessage.style.transform = 'translateY(0)';
        }, 300);
      }
      
      // Play the birthday song
      if (birthdaySong) {
        birthdaySong.currentTime = 0;
        birthdaySong.volume = 1.0;
        birthdaySong.play().catch(err => console.log('Audio play failed:', err));
      }
    }

    function relight() {
      // Change cake image back to candles on and show flames
      cakeImage.src = 'assets/Candle1.JPG';
      if (flameOverlay) flameOverlay.style.display = 'block';
      
      candlesLit = true;
      stopConfetti();
      if (audioCtx && audioCtx.close) { try{ audioCtx.close(); } catch(e){} audioCtx = null; }
      
      // Show subtitle and hide birthday message
      const subtitle = document.getElementById('birthday-subtitle');
      if (subtitle) subtitle.style.opacity = '1';
      
      if (birthdayMessage) {
        birthdayMessage.style.opacity = '0';
        birthdayMessage.style.transform = 'translateY(-50px)';
      }
      
      // Stop the birthday song
      if (birthdaySong) {
        birthdaySong.pause();
        birthdaySong.currentTime = 0;
      }
    }

    // mic detection (simple energy threshold)
    function setupMic() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
        const ctx = ensureAudio();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        const data = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        let raf;
        function sample(){
          analyser.getByteFrequencyData(data);
          let sum=0;
          for (let i=0;i<data.length;i++) sum += data[i];
          const avg = sum / data.length;
          if (avg > 42) { extinguish(); cancelAnimationFrame(raf); stream.getTracks().forEach(t=>t.stop()); return; }
          raf = requestAnimationFrame(sample);
        }
        sample();
      }).catch(()=>{ /* permission denied or unavailable */ });
    }

    // wiring
    // Make cake image respond to clicks and keyboard
    cakeImage && cakeImage.addEventListener('click', (e)=>{ e.preventDefault(); extinguish(); });
    cakeImage && cakeImage.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); extinguish(); } });

    playBtn && playBtn.addEventListener('click', ()=>{ try{ ensureAudio(); if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch(e){} extinguish(); });
    resetBtn && resetBtn.addEventListener('click', (e)=>{ e.preventDefault(); relight(); });

    setupMic();
    // prime audio (quiet) to increase chance AudioContext starts on user gesture
    (function prime() { try { const ctx = ensureAudio(); const o = ctx.createOscillator(); const g = ctx.createGain(); g.gain.value = 0.00001; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.01); } catch(e) {} }());
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupTypewriter();
    setupScrollArrow();
    setupBirthday();
  });

})();
