// ==========================================
// LUXURY ROMANTIC WEBSITE - JAVASCRIPT
// Enhanced with Gallery, Shayari, and Letter Features
// ==========================================

(() => {
  'use strict';

  // ==========================================
  // NAVIGATION & PAGE TRANSITIONS (GLOBAL SCOPE)
  // ==========================================

  // Make navigateToPage globally accessible
  window.navigateToPage = function(pageId, updateHash = true) {
    console.log('Navigating to:', pageId);
    const pages = document.querySelectorAll('.page');
    
    // Update hash if needed
    if (updateHash) {
      window.location.hash = pageId;
    }
    
    // Remove active class from all pages
    pages.forEach(page => {
      page.classList.remove('active');
    });
    
    // Add active class to target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
      console.log('Page activated:', pageId);
      
      // Scroll to top smoothly
      targetPage.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Trigger specific page initializations
      if (pageId === 'gallery') {
        initializeGallerySlider();
      }
    } else {
      console.error('Page not found:', pageId);
    }
  };

  function initNavigation() {
    const navButtons = document.querySelectorAll('[data-page]');
    
    // Handle navigation clicks
    navButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetPage = button.getAttribute('data-page');
        console.log('Button clicked, target:', targetPage);
        if (targetPage) {
          window.navigateToPage(targetPage);
        }
      });
    });

    // Handle hash changes (back/forward buttons)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      window.navigateToPage(hash, false);
    });

    // Initial page load
    const initialHash = window.location.hash.slice(1) || 'home';
    window.navigateToPage(initialHash, false);
  }

  // ==========================================
  // TYPEWRITER EFFECT
  // ==========================================

  function initTypewriter() {
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

    let phraseIndex = 0;
    let charIndex = 0;
    let isTyping = true;
    const TYPING_SPEED = 40;
    const PAUSE_DURATION = 900;

    function tick() {
      const currentPhrase = phrases[phraseIndex];
      
      if (isTyping) {
        charIndex++;
        el.textContent = currentPhrase.slice(0, charIndex);
        
        if (charIndex >= currentPhrase.length) {
          isTyping = false;
          setTimeout(tick, PAUSE_DURATION);
        } else {
          setTimeout(tick, TYPING_SPEED);
        }
      } else {
        charIndex--;
        el.textContent = currentPhrase.slice(0, charIndex);
        
        if (charIndex <= 0) {
          isTyping = true;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, 200);
        } else {
          setTimeout(tick, Math.max(20, TYPING_SPEED / 2));
        }
      }
    }

    tick();
  }

  // ==========================================
  // ROMANTIC FLOATING HEARTS & SPARKLES
  // ==========================================

  function initFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;

    // Create floating hearts
    const heartEmojis = ['💕', '💖', '💗', '💝', '💓'];
    for (let i = 0; i < 8; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.innerHTML = heartEmojis[i % heartEmojis.length];
      heart.style.cssText = `
        position: absolute;
        font-size: ${18 + Math.random() * 12}px;
        opacity: 0;
        animation: floatHeart ${12 + Math.random() * 8}s ease-in-out infinite;
        animation-delay: ${i * 2}s;
        left: ${Math.random() * 100}%;
      `;
      container.appendChild(heart);
    }
    
    // Create sparkle elements
    const particlesContainer = document.querySelector('.ambient-particles');
    if (particlesContainer) {
      for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.cssText = `
          position: absolute;
          font-size: ${10 + Math.random() * 8}px;
          color: rgba(212, 175, 55, ${0.3 + Math.random() * 0.4});
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
          animation-delay: ${Math.random() * 3}s;
        `;
        particlesContainer.appendChild(sparkle);
      }
    }
  }
  
  // Add twinkle animation dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes twinkle {
      0%, 100% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);

  // ==========================================
  // SHAYARI GIFT BOX UNWRAPPING
  // ==========================================

  function initShayariGift() {
    const giftBow = document.getElementById('giftBow');
    const giftBox = document.getElementById('giftBox');
    const shayariModal = document.getElementById('shayariModal');
    const shayariClose = document.getElementById('shayariClose');
    
    if (!giftBow || !giftBox || !shayariModal) return;

    const openShayari = () => {
      giftBox.classList.add('unwrapping');
      
      setTimeout(() => {
        shayariModal.classList.add('active');
      }, 800);
    };

    const closeShayari = () => {
      shayariModal.classList.remove('active');
      setTimeout(() => {
        giftBox.classList.remove('unwrapping');
      }, 500);
    };

    giftBow.addEventListener('click', openShayari);
    giftBox.addEventListener('click', openShayari);
    
    if (shayariClose) {
      shayariClose.addEventListener('click', closeShayari);
    }
    
    shayariModal.addEventListener('click', (e) => {
      if (e.target === shayariModal) {
        closeShayari();
      }
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shayariModal.classList.contains('active')) {
        closeShayari();
      }
    });
  }

  // ==========================================
  // LOVE LETTER ENVELOPE OPENING
  // ==========================================

  function initLoveLetterEnvelope() {
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    const envelope = document.getElementById('envelope');
    const letterModal = document.getElementById('letterModal');
    const letterClose = document.getElementById('letterClose');
    
    if (!envelopeWrapper || !letterModal) return;

    const openLetter = () => {
      envelopeWrapper.classList.add('opening');
      
      setTimeout(() => {
        letterModal.classList.add('active');
      }, 1200);
    };

    const closeLetter = () => {
      letterModal.classList.remove('active');
      setTimeout(() => {
        envelopeWrapper.classList.remove('opening');
      }, 500);
    };

    envelopeWrapper.addEventListener('click', openLetter);
    
    if (letterClose) {
      letterClose.addEventListener('click', closeLetter);
    }
    
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) {
        closeLetter();
      }
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && letterModal.classList.contains('active')) {
        closeLetter();
      }
    });
  }

  // ==========================================
  // GALLERY 3D CAROUSEL
  // ==========================================

  let currentSlide = 0;
  let galleryItems = [];
  let galleryInitialized = false;

  function initializeGallerySlider() {
    if (galleryInitialized) return;
    
    const track = document.getElementById('galleryTrack');
    const indicatorsContainer = document.getElementById('galleryIndicators');
    
    if (!track) return;

    galleryItems = Array.from(track.querySelectorAll('.gallery-item'));
    
    if (galleryItems.length === 0) return;

    // Create indicators
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = '';
      galleryItems.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'gallery-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
      });
    }

    // Set first slide as active
    updateGallerySlide();

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const galleryPage = document.getElementById('gallery');
      if (!galleryPage || !galleryPage.classList.contains('active')) return;
      
      if (e.key === 'ArrowLeft') {
        currentSlide = (currentSlide - 1 + galleryItems.length) % galleryItems.length;
        updateGallerySlide();
      } else if (e.key === 'ArrowRight') {
        currentSlide = (currentSlide + 1) % galleryItems.length;
        updateGallerySlide();
      }
    });

    // Drag and swipe support
    let isDragging = false;
    let startX = 0;
    let startTranslate = 0;

    // Mouse drag
    track.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startTranslate = currentSlide * 100;
      track.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const slideWidth = track.offsetWidth;
      const dragPercent = (deltaX / slideWidth) * 100;
      track.style.transform = `translateX(-${startTranslate - dragPercent}%)`;
    });

    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const deltaX = e.clientX - startX;
      const slideWidth = track.offsetWidth;
      
      if (deltaX < -50) {
        currentSlide = Math.min(currentSlide + 1, galleryItems.length - 1);
      } else if (deltaX > 50) {
        currentSlide = Math.max(currentSlide - 1, 0);
      }
      
      track.style.transition = 'transform 0.6s ease';
      updateGallerySlide();
    });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      startTranslate = currentSlide * 100;
      track.style.transition = 'none';
    });

    track.addEventListener('touchmove', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const slideWidth = track.offsetWidth;
      const dragPercent = (deltaX / slideWidth) * 100;
      track.style.transform = `translateX(-${startTranslate - dragPercent}%)`;
    });

    track.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      
      if (deltaX < -50) {
        currentSlide = Math.min(currentSlide + 1, galleryItems.length - 1);
      } else if (deltaX > 50) {
        currentSlide = Math.max(currentSlide - 1, 0);
      }
      
      track.style.transition = 'transform 0.6s ease';
      updateGallerySlide();
    });

    galleryInitialized = true;
  }

  function updateGallerySlide() {
    const track = document.getElementById('galleryTrack');
    if (!track) return;

    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    galleryItems.forEach((item, index) => {
      if (index === currentSlide) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    const indicators = document.querySelectorAll('.gallery-indicator');
    indicators.forEach((indicator, index) => {
      if (index === currentSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  function goToSlide(index) {
    currentSlide = index;
    updateGallerySlide();
  }

  // ==========================================
  // BIRTHDAY FUNCTIONALITY (NO MICROPHONE)
  // ==========================================

  function initBirthday() {
    const cakeImage = document.getElementById('cake-image-index');
    const confettiCanvas = document.getElementById('confetti');
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const birthdayMessage = document.getElementById('birthday-message');
    const birthdaySubtitle = document.getElementById('birthday-subtitle');
    const flameOverlay = document.getElementById('flame-overlay');
    const birthdaySong = document.getElementById('birthday-song-index');
    
    if (!cakeImage || !confettiCanvas) return;
    
    let candlesLit = true;
    let audioCtx = null;
    let confettiRunning = false;
    let confettiRAF = null;
    let confettiPieces = [];

    // Audio Context Helper
    function ensureAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    // Note frequency calculator
    function getFrequency(note) {
      const match = note.match(/^([A-G])(#?)(\d)$/);
      if (!match) return 440;
      
      const [, pitch, sharp, octave] = match;
      const octaveNum = parseInt(octave, 10);
      const semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[pitch] + (sharp ? 1 : 0);
      const semitoneFromA4 = semitone - 9 + (octaveNum - 4) * 12;
      
      return 440 * Math.pow(2, semitoneFromA4 / 12);
    }

    // Play a single note
    function playNote(frequency, when = 0, duration = 0.38) {
      const ctx = ensureAudio();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const startTime = ctx.currentTime + when;
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.16, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
    }

    // Happy Birthday melody
    function playHappyBirthday() {
      try {
        const ctx = ensureAudio();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      } catch (e) {}

      const phrase1 = [['G4', 0], ['G4', 0.4], ['A4', 0.9], ['G4', 1.4], ['C5', 1.9], ['B4', 2.4]];
      const phrase2 = [['G4', 3.2], ['G4', 3.6], ['A4', 4.1], ['G4', 4.6], ['D5', 5.1], ['C5', 5.6]];
      const phrase3 = [['G4', 7.0], ['G4', 7.6], ['G5', 8.2], ['E5', 8.8], ['C5', 9.4], ['B4', 9.9], ['A4', 10.5]];
      const phrase4 = [['F5', 11.4], ['F5', 12.0], ['E5', 12.6], ['C5', 13.2], ['D5', 13.8], ['C5', 14.4]];
      
      const melody = [...phrase1, ...phrase2, ...phrase3, ...phrase4];
      
      melody.forEach(([note, time]) => {
        playNote(getFrequency(note), time, 0.44);
      });
    }

    // ==========================================
    // CONFETTI - HEART PARTICLES
    // ==========================================

    function initConfetti() {
      const canvas = confettiCanvas;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      
      confettiPieces = [];
      const colors = ['#ff9bb3', '#ffd1e6', '#ffefef', '#ffc1d9', '#ff7aa2', '#ffb3c1', '#d4567a'];
      
      for (let i = 0; i < 140; i++) {
        confettiPieces.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * -window.innerHeight,
          size: 6 + Math.random() * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: -1 + Math.random() * 2,
          vy: 1 + Math.random() * 3,
          rotation: Math.random() * 360,
          rotationSpeed: -3 + Math.random() * 6
        });
      }
    }

    function startConfetti() {
      if (confettiRunning) return;
      confettiRunning = true;
      initConfetti();
      
      const canvas = confettiCanvas;
      const ctx = canvas.getContext('2d');
      
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiPieces.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.rotation += particle.rotationSpeed;
          
          // Reset particle if it goes off screen
          if (particle.y > window.innerHeight + 20) {
            particle.y = -20 - Math.random() * window.innerHeight;
            particle.x = Math.random() * window.innerWidth;
          }
          
          // Draw heart shape
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation * Math.PI) / 180);
          ctx.fillStyle = particle.color;
          
          const size = particle.size;
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.bezierCurveTo(size / 2, -size, size, -size / 4, 0, size / 2);
          ctx.bezierCurveTo(-size, -size / 4, -size / 2, -size, 0, -size / 2);
          ctx.fill();
          ctx.restore();
        });
        
        confettiRAF = requestAnimationFrame(animate);
      }
      
      animate();
    }

    function stopConfetti() {
      confettiRunning = false;
      if (confettiRAF) {
        cancelAnimationFrame(confettiRAF);
      }
      const canvas = confettiCanvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // ==========================================
    // CANDLE BLOWING FUNCTIONALITY
    // ==========================================

    function extinguishCandles() {
      if (!candlesLit) return;
      candlesLit = false;
      
      // Change cake image to blown out candles
      cakeImage.src = 'assets/Candle2.JPG';
      
      // Hide flame overlay
      if (flameOverlay) {
        flameOverlay.style.display = 'none';
      }
      
      // Start confetti
      startConfetti();
      
      // Hide subtitle and show birthday message
      if (birthdaySubtitle) {
        birthdaySubtitle.style.opacity = '0';
      }
      
      if (birthdayMessage) {
        setTimeout(() => {
          birthdayMessage.style.opacity = '1';
          birthdayMessage.style.transform = 'translateY(0)';
        }, 300);
      }
      
      // Play birthday song
      if (birthdaySong) {
        birthdaySong.currentTime = 0;
        birthdaySong.volume = 1.0;
        birthdaySong.play().catch(err => {
          console.log('Audio playback failed:', err);
        });
      }
    }

    function relightCandles() {
      // Change cake back to lit candles
      cakeImage.src = 'assets/Candle1.JPG';
      
      // Show flame overlay
      if (flameOverlay) {
        flameOverlay.style.display = 'block';
      }
      
      candlesLit = true;
      stopConfetti();
      
      // Close audio context
      if (audioCtx && audioCtx.close) {
        try {
          audioCtx.close();
        } catch (e) {}
        audioCtx = null;
      }
      
      // Show subtitle and hide birthday message
      if (birthdaySubtitle) {
        birthdaySubtitle.style.opacity = '1';
      }
      
      if (birthdayMessage) {
        birthdayMessage.style.opacity = '0';
        birthdayMessage.style.transform = 'translateY(-50px)';
      }
      
      // Stop birthday song
      if (birthdaySong) {
        birthdaySong.pause();
        birthdaySong.currentTime = 0;
      }
    }

    // Event listeners
    if (cakeImage) {
      cakeImage.addEventListener('click', (e) => {
        e.preventDefault();
        extinguishCandles();
      });
      
      cakeImage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          extinguishCandles();
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        try {
          ensureAudio();
          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
        } catch (e) {}
        extinguishCandles();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        relightCandles();
      });
    }

    // Prime audio context
    (function primeAudio() {
      try {
        const ctx = ensureAudio();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.00001;
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.01);
      } catch (e) {}
    })();
  }

  // ==========================================
  // SCROLL INDICATOR
  // ==========================================

  function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;
    
    indicator.addEventListener('click', () => {
      // Scroll down or navigate to next section
      window.scrollBy({
        top: window.innerHeight * 0.8,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // HANDLE WINDOW RESIZE
  // ==========================================

  function handleResize() {
    const confettiCanvas = document.getElementById('confetti');
    if (confettiCanvas) {
      const dpr = window.devicePixelRatio || 1;
      confettiCanvas.width = window.innerWidth * dpr;
      confettiCanvas.height = window.innerHeight * dpr;
      confettiCanvas.style.width = window.innerWidth + 'px';
      confettiCanvas.style.height = window.innerHeight + 'px';
    }
  }

  // ==========================================
  // INITIALIZE ALL FEATURES
  // ==========================================

  document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing website...');
    initNavigation();
    initTypewriter();
    initFloatingHearts();
    initShayariGift();
    initLoveLetterEnvelope();
    initBirthday();
    initScrollIndicator();
    
    // Explicitly add listener to begin journey button
    const beginBtn = document.getElementById('beginJourneyBtn');
    if (beginBtn) {
      console.log('Begin Journey button found');
      beginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Begin Journey clicked');
        navigateToPage('shayari');
      });
    } else {
      console.error('Begin Journey button NOT found');
    }
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
  });

})();
