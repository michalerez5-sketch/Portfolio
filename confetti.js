/* Animated confetti for the last Meitav Trade card.
   Piece positions, sizes, rotations and colours come from the Figma layers
   (Group 14091 + Group 12448), in card coordinates (card = 1140 × 673). */
(function () {
  const COLORS = ['#ef7e77', '#e1cc77', '#00bc6e'];
  // [kind, x, y, w, h, rotationDeg, colorIndex]   V=sparkle R=square P=triangle E=dot
  const P = [
    ['V',1094.6,96.5,10.5,10.5,96,0],['V',1070.7,268.2,10.5,10.5,96,0],['V',1065.3,157.9,10.5,10.5,96,1],
    ['R',1124.6,200.1,9.6,9.6,65,2],['R',1108.6,250.8,9.6,9.6,65,0],['R',1134.5,170.1,7.1,7.1,42,1],
    ['P',1099.7,188.8,12.9,14.1,71,0],['E',1114.1,134.6,8,8,51,1],['E',1084.6,211.1,8,8,51,0],['R',1120.4,357.8,9.6,9.6,65,2],
    ['V',692.2,323.8,10.5,10.5,96,0],['R',789.6,272.3,9.6,9.6,65,1],
    ['V',868,6.3,10.5,10.5,-20,1],['V',816.9,144.2,10.5,10.5,-20,0],['V',753.9,2.7,10.5,10.5,-20,2],['V',909.8,122.1,10.5,10.5,-20,0],
    ['V',878.5,209,10.5,10.5,-20,0],['V',867.9,65.1,10.5,10.5,-20,2],['V',1043.7,156.6,10.5,10.5,-20,0],['V',946.4,209,10.5,10.5,-20,1],
    ['V',980.7,15,10.5,10.5,-20,2],['V',953.2,109.1,10.5,10.5,-20,2],
    ['R',901.4,96.8,7.1,7.1,-50,0],['R',959,137.3,9.6,9.6,-50,2],['R',1011.6,129.9,9.6,9.6,-50,0],['R',842.5,97.5,9.6,9.6,-50,1],
    ['R',913.7,28.6,7.1,7.1,-50,0],['R',846.9,56.8,7.1,7.1,-50,1],['R',896.6,144.3,7.1,7.1,-50,0],['R',791.7,28.3,9.6,9.6,-50,2],
    ['R',992.8,16.6,9.6,9.6,-50,0],['R',921.4,70.5,7.1,7.1,-50,1],['R',1006.3,51.5,9.6,9.6,-50,0],['R',927.7,141.3,7.1,7.1,-74,1],
    ['P',872.2,125.6,12.9,14.1,-52,0],['P',857,150.5,12.9,14.1,-52,2],['P',920.1,-4.7,12.9,14.1,-85,0],['P',814.7,71,12.9,14.1,-85,1],
    ['P',965.1,0.7,12.9,14.1,-85,0],['P',864.9,38.4,12.9,14.1,-85,1],['P',826.8,0,12.9,14.1,-45,0],['P',829.6,176.8,12.9,14.1,-45,1],
    ['P',959.5,164.7,12.9,14.1,-45,0],['P',896.5,23.2,12.9,14.1,-45,2],['P',1076.6,49.3,12.9,14.1,-45,0],['P',979.3,101.7,12.9,14.1,-45,1],
    ['E',893.4,46.5,8,8,-65,0],['E',796.1,98.9,8,8,-65,1],['E',949.2,36.4,8,8,-65,0],['E',904.4,175.1,8,8,-65,1],
    ['V',685,219.3,10.5,10.5,-115,0],['R',639.2,180.5,8.2,8.2,-145,1],['R',682.3,85.2,8.2,8.2,-145,0],
    ['P',654.6,143.4,11.1,12.1,-147,0],['P',671.8,165.3,11.1,12.1,-147,2],['P',745.2,211.7,11.1,12.1,-140,1],
    ['E',686.1,59.7,6.9,6.9,-160,1],['E',986.2,168.6,8,8,-65,0],['E',923.1,27.1,8,8,-65,2]
  ];
  const CARD_W = 1140, CARD_H = 673;
  const ORIGIN = { x: 940, y: 290 };                       // rocket exhaust
  const ROCKET = { x: 916.45, y: 211.65, w: 95, h: 95 };   // rocket.svg placement in card coords
  const DIR = (() => { const x = 0.7, y = -0.72, l = Math.hypot(x, y); return { x: x / l, y: y / l }; })();
  const SPARK = new Path2D('M5.2376 0C4.3834 2.9118 2.6837 4.7174 0 5.2376C2.8211 5.8875 4.6354 7.5634 5.2376 10.4752C5.5621 7.5033 7.4269 5.8598 10.4752 5.2376C7.3191 4.7843 5.7844 2.845 5.2376 0Z');

  // timeline (seconds)
  const T_BURST = 0.45, FLY = 1.6, HANG = 0.35, T_LAUNCH = 0.75;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rocketImg = new Image();
  rocketImg.src = 'assets/meitav/rocket.svg';

  document.querySelectorAll('[data-confetti]').forEach(host => {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const pieces = P.map(([k, x, y, w, h, r, c], i) => {
      const dx = x - ORIGIN.x, dy = y - ORIGIN.y;
      const dist = Math.hypot(dx, dy);
      const p = {
        k, x, y, w, h, r: r * Math.PI / 180, color: COLORS[c],
        delay: T_BURST + dist / 650 + (i % 7) * 0.04,
        spin: (i % 2 ? 1 : -1) * (2 + (i % 5)),
        cx: ORIGIN.x + dx * 0.35 + (i % 3 - 1) * 40, cy: Math.min(ORIGIN.y, y) - 60 - (i % 4) * 25,
        // falling: terminal velocity (paper-like), sway, tumble
        vt: 120 + (i % 6) * 22, tau: 0.35, sway: 7 + (i % 5) * 3, swayF: 1.6 + (i % 4) * 0.45,
        tumble: (i % 2 ? 1 : -1) * (1.2 + (i % 3) * 0.8), phase: i * 1.7,
        floor: CARD_H - 7 - Math.max(w, h) * 0.35 - (i * 7 % 9)  // small depth variation on the floor
      };
      p.fallAt = p.delay + FLY + HANG + (i % 9) * 0.06;
      // time to reach the floor (fall distance is monotonic → bisection)
      const fy = tt => p.y + p.vt * (tt - p.tau * (1 - Math.exp(-tt / p.tau)));
      let lo = 0, hi = 30; for (let n = 0; n < 40; n++) { const m = (lo + hi) / 2; if (fy(m) < p.floor) lo = m; else hi = m; }
      p.land = hi; p.fy = fy;
      return p;
    });

    let scale = 1, dpr = 1, start = null, running = false, visible = false;
    let mx = -9999, my = -9999, mxS = mx, myS = my;
    const puffs = [];

    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      scale = r.width / CARD_W;
      draw(start === null ? 0 : (performance.now() - start) / 1000);
    };

    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const backOut = t => { const s = 1.4; t -= 1; return t * t * ((s + 1) * t + s) + 1; };

    function shape(p) {
      ctx.fillStyle = p.color;
      if (p.k === 'R') { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      else if (p.k === 'E') { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else if (p.k === 'P') { ctx.beginPath(); ctx.moveTo(0, -p.h / 2); ctx.lineTo(p.w * 0.433, p.h * 0.25); ctx.lineTo(-p.w * 0.433, p.h * 0.25); ctx.closePath(); ctx.fill(); /* Figma polygon: vertices on the inscribed ellipse */ }
      else { const s = p.w / 10.4752; ctx.scale(s, s); ctx.translate(-5.2376, -5.2376); ctx.fill(SPARK); }
    }

    // where is the rocket at time t (offset from rest, rotation, alpha)
    function rocketState(t) {
      if (reduce) return { dx: 0, dy: 0, a: 1, s: 1 };
      let dx = 0, dy = 0;
      if (t > 0.15 && t < T_LAUNCH + 0.15) {                 // rumble before lift-off
        const k = Math.min(1, (t - 0.15) / 0.4) * 1.6;
        dx = Math.sin(t * 90) * k; dy = Math.cos(t * 77) * k;
      }
      if (t > T_LAUNCH) {
        const u = t - T_LAUNCH, d = 900 * u * u + 40 * u;     // accelerate away
        dx += DIR.x * d; dy += DIR.y * d;
        return { dx, dy, a: 1, s: 1 + Math.min(0.15, u * 0.2), u };
      }
      return { dx, dy, a: 1, s: 1, u: 0 };
    }

    function draw(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const k = scale * dpr;
      mxS += (mx - mxS) * 0.12; myS += (my - myS) * 0.12;

      // smoke trail behind the rocket
      const rs = rocketState(t);
      if (!reduce && rs.u > 0 && rs.u < 1.4 && puffs.length < 400) {
        puffs.push({ x: ORIGIN.x + rs.dx - 4, y: ORIGIN.y + rs.dy + 2, born: t, r: 3 + Math.random() * 4 });
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const q = puffs[i], age = t - q.born;
        if (age > 1.1 || age < 0) { puffs.splice(i, 1); continue; }
        ctx.setTransform(k, 0, 0, k, 0, 0);
        ctx.globalAlpha = 0.35 * (1 - age / 1.1);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(q.x - DIR.x * age * 18, q.y - DIR.y * age * 18 + age * 6, q.r * (1 + age * 1.8), 0, Math.PI * 2); ctx.fill();
      }

      // rocket
      if (rocketImg.complete && rocketImg.naturalWidth) {
        const cx = ROCKET.x + ROCKET.w / 2 + rs.dx, cy = ROCKET.y + ROCKET.h / 2 + rs.dy;
        if (cx < CARD_W + 120 && cy > -120) {
          ctx.globalAlpha = 1;
          ctx.setTransform(k * rs.s, 0, 0, k * rs.s, cx * k, cy * k);
          ctx.drawImage(rocketImg, -ROCKET.w / 2, -ROCKET.h / 2, ROCKET.w, ROCKET.h);
        }
      }

      // confetti
      for (const p of pieces) {
        let x, y, rot, s = 1, alpha = 1;
        if (reduce) { x = p.x; y = p.y; rot = p.r; }
        else {
          const lt = Math.min(1, Math.max(0, (t - p.delay) / FLY));
          if (lt <= 0) continue;
          alpha = Math.min(1, lt * 3);
          if (t < p.fallAt) {                                  // burst → resting spot → brief hang
            const e = easeOut(lt), u = 1 - e;
            x = u * u * ORIGIN.x + 2 * u * e * p.cx + e * e * p.x;
            y = u * u * ORIGIN.y + 2 * u * e * p.cy + e * e * p.y;
            rot = p.r + p.spin * Math.PI * (1 - e);
            s = 0.3 + 0.7 * backOut(Math.min(1, lt * 1.4));
            if (lt >= 1) { const h = t - p.delay - FLY; x += Math.sin(h * 2 + p.phase) * 2; y += Math.cos(h * 1.7 + p.phase) * 2; }
          } else {                                             // flutter down to the floor
            const ft = Math.min(t - p.fallAt, p.land);
            const ramp = Math.min(1, ft / 0.6);
            x = p.x + Math.sin(ft * p.swayF + p.phase) * p.sway * ramp - Math.sin(p.phase) * 0;
            y = p.fy(ft);
            rot = p.r + ft * p.tumble;
            if (t - p.fallAt >= p.land) {                      // landed: settle almost flat
              const st = Math.min(1, (t - p.fallAt - p.land) / 0.25);
              rot = rot * (1 - st * 0.25);
            }
          }
        }
        // gentle push away from the pointer
        const ddx = x - mxS, ddy = y - myS, d = Math.hypot(ddx, ddy);
        if (d < 110) { const f = (1 - d / 110) * 20; x += ddx / (d || 1) * f; y = Math.min(p.floor, y + ddy / (d || 1) * f); }
        ctx.setTransform(k, 0, 0, k, x * k, y * k);
        ctx.rotate(rot); ctx.scale(s, s);
        ctx.globalAlpha = 0.8 * alpha;                         // Figma group opacity 80%
        shape(p);
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (!visible) { running = false; return; }
      if (start === null) start = now;
      draw((now - start) / 1000);
      requestAnimationFrame(loop);
    }
    const play = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

    // replay the whole launch on click
    host.addEventListener('click', () => { start = null; puffs.length = 0; play(); });
    host.addEventListener('pointermove', e => {
      const r = host.getBoundingClientRect();
      mx = (e.clientX - r.left) / scale; my = (e.clientY - r.top) / scale;
    });
    host.addEventListener('pointerleave', () => { mx = my = -9999; });

    rocketImg.addEventListener('load', () => draw(start === null ? 0 : (performance.now() - start) / 1000));
    new ResizeObserver(resize).observe(host);
    if (reduce) return;
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) play();
    }, { threshold: 0.35 }).observe(host);
  });
})();
