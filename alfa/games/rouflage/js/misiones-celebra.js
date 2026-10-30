// Fans of Rouflage · LA CELEBRACIÓN AL COBRAR una misión o un logro (la llama misionCobra, misiones.js): sobre el botón COBRAR revienta una mancha de
// pintura con el premio bien grande («+50» y su gota), escurre un poco y el número sale volando hasta «Tus gotas», que va contando hacia arriba hasta
// el total nuevo, da un saltito y suelta una salpicadura pequeña. Detrás vuelan unas gotas de colores. Todo dibujado (canvas y CSS), sin imágenes.
// La mancha sale cada vez de un color al azar (nunca el mismo dos veces seguidas), con una salpicadura de otro color detrás. El vuelo va fotograma a
// fotograma (requestAnimationFrame) por una curva suave, con translate3d para que el móvil lo mueva sin tirones. Con «reducir movimiento», solo sube el número.
'use strict';

const CELEB = { cuenta: 0, ultimo: -1 };
const CELEB_COL = ['#ff4b5c', '#ff7a1a', '#ffcb3d', '#7ee04a', '#39d5e8', '#3a7de0', '#ff6fb5', '#b45cff', '#2fd6a0'];      // los de la gota de pintura y alguno más
const celebAz = n => (Math.random() * n) | 0;
// dos colores distintos, el primero distinto del de la vez anterior
function celebColores() {
  let i; do i = celebAz(CELEB_COL.length); while (i === CELEB.ultimo);
  let j; do j = celebAz(CELEB_COL.length); while (Math.abs(j - i) <= 1);      // el de detrás, que no se parezca (en la lista van por tonos)
  CELEB.ultimo = i; return [CELEB_COL[i], CELEB_COL[j]];
}
const suave = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);      // entra y sale despacio
const rebote = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };      // se pasa un poco y vuelve

// una mancha de lóbulos redondos (como una gota que revienta): entre cada dos puntos del borde, una curva que se abomba hacia fuera
function celebForma(c, cx, cy, R, az, n) {
  c.beginPath(); const picos = [];
  for (let k = 0; k < n; k++) picos.push(R * (0.86 + az() * 0.22));
  for (let k = 0; k <= n; k++) {
    const a = (k % n) / n * Math.PI * 2, r = picos[k % n], x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.92;
    if (k === 0) { c.moveTo(x, y); continue; }
    const am = (k - 0.5) / n * Math.PI * 2, rm = (picos[k - 1] + r) / 2 * (1.16 + az() * 0.1);
    c.quadraticCurveTo(cx + Math.cos(am) * rm, cy + Math.sin(am) * rm * 0.92, x, y);
  }
  c.closePath();
}
// la mancha entera: la salpicadura de detrás (col2), los chorretones y la mancha (col) con su sombra y su brillo, y las gotitas sueltas de los dos colores.
// Lo que escurre crece con `t` (de 0 a 1).
function celebMancha(c, w, col, col2, semilla, t) {
  let s = semilla; const az = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const cx = w / 2, cy = w * 0.44, R = w * 0.31;
  c.clearRect(0, 0, w, w); c.lineJoin = 'round';
  // la salpicadura de otro color, asomando por un lado
  s = semilla + 3; const ang = az() * Math.PI * 2, bx = cx + Math.cos(ang) * R * 0.62, by = cy + Math.sin(ang) * R * 0.5;
  celebForma(c, bx, by, R * 0.58, az, 8); c.fillStyle = col2; c.fill(); c.lineWidth = w * 0.026; c.strokeStyle = OL; c.stroke();
  // los chorretones (debajo de la mancha, para que salgan de ella)
  for (const [dx, largo] of [[-0.42, 0.55], [-0.08, 0.95], [0.3, 0.7]]) {
    const x = cx + dx * R * 1.5, y0 = cy + R * 0.55, y1 = y0 + R * largo * (0.35 + 0.65 * t), g = R * 0.13;
    c.beginPath(); c.moveTo(x - g, y0); c.lineTo(x - g * 0.8, y1); c.arc(x, y1, g * 0.95, Math.PI, 0, true); c.lineTo(x + g, y0); c.closePath();
    c.fillStyle = col; c.fill(); c.lineWidth = w * 0.028; c.strokeStyle = OL; c.stroke();
  }
  s = semilla; celebForma(c, cx, cy, R, az, 11); c.fillStyle = col; c.fill(); c.lineWidth = w * 0.032; c.strokeStyle = OL; c.stroke();
  // sombra de abajo y brillo de arriba, para que parezca pintura fresca
  c.save(); s = semilla; celebForma(c, cx, cy, R, az, 11); c.clip();
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(cx + R * 0.15, cy + R * 0.75, R * 1.1, R * 0.55, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(cx - R * 0.35, cy - R * 0.5, R * 0.42, R * 0.2, -0.5, 0, Math.PI * 2); c.fill();
  c.restore();
  // las gotitas sueltas
  s = semilla + 7;
  for (let k = 0; k < 8; k++) {
    const a = az() * Math.PI * 2, d = R * (1.15 + az() * 0.45), r = w * (0.018 + az() * 0.03);
    c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9, r, 0, Math.PI * 2); c.fillStyle = k % 3 ? col : col2; c.fill(); c.lineWidth = w * 0.016; c.strokeStyle = OL; c.stroke();
  }
}

function misionCelebra(n) {
  const de = MIS_UI.desde, a = E('mis-gotas'); if (!de || !a || E('p-misiones').hidden) return;
  celebraGotas(n, de, a);
}
// la mancha con el número sobre el rectángulo `de` (un botón) y el vuelo hasta el contador `a`: la usan las misiones y los códigos regalo (codigos.js)
function celebraGotas(n, de, a) {
  const total = SAVE.gotas || 0, antes = Math.max(0, total - n);
  const quieto = !Element.prototype.animate || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (quieto) { celebCuenta(a, antes, total, 500); return; }
  a.textContent = String(antes);
  const W = 190, x0 = Math.min(innerWidth - W / 2 + 10, Math.max(W / 2 - 10, de.left + de.width / 2)), y0 = de.top + de.height / 2 - 6;      // sin salirse de la pantalla
  const [col, col2] = celebColores(), sem = 1 + celebAz(1e6);
  // la mancha con su número
  const caja = document.createElement('div'); caja.className = 'celeb-caja';
  const cv = arLienzo(W, W, 'celeb-mancha'); caja.appendChild(cv);
  const num = document.createElement('div'); num.className = 'celeb-num';
  const g = arLienzo(30, 30); arPinta(g, (c, w) => pintaGotas(c, w));
  num.appendChild(document.createTextNode('+' + n)); num.appendChild(g);
  caja.appendChild(num); document.body.appendChild(caja);
  caja.style.transform = `translate3d(${x0 - W / 2}px, ${y0 - W * 0.44}px, 0)`;
  const pinta = t => arPinta(cv, (c, w) => celebMancha(c, w, col, col2, sem, t));
  pinta(0); play('cubo');
  cv.animate([{ transform: 'scale(.15) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.18) rotate(4deg)', opacity: 1, offset: 0.45 }, { transform: 'scale(.95) rotate(0)' }, { transform: 'scale(1)' }],
    { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.3)', fill: 'forwards' });
  num.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.35)', opacity: 1, offset: 0.6 }, { transform: 'translate(-50%,-50%) scale(1)' }],
    { duration: 420, delay: 90, easing: 'cubic-bezier(.2,.9,.3,1.4)', fill: 'forwards' });
  // escurre un poco mientras se lee
  const t0 = performance.now(); let escurriendo = true;
  const escurre = ahora => { if (!escurriendo) return; const t = Math.min(1, (ahora - t0) / 1100); pinta(t); if (t < 1) requestAnimationFrame(escurre); };
  requestAnimationFrame(escurre);
  setTimeout(() => { escurriendo = false; celebVuela(caja, cv, num, a, antes, total, col, col2, n, x0, y0); }, 1050);
}
// el vuelo: el número (y las gotas que lo siguen) van por una curva hasta «Tus gotas»; la mancha se seca mientras tanto
function celebVuela(caja, cv, num, a, antes, total, col, col2, n, x0, y0) {
  const r = num.getBoundingClientRect(), nw = r.width, nh = r.height, nx = r.left + nw / 2, ny = r.top + nh / 2;
  // el número pasa al cuerpo de la página, en el mismo sitio exacto, para volar libre (sin saltos: se coloca con su centro)
  num.getAnimations().forEach(x => x.cancel());
  document.body.appendChild(num); num.classList.add('vuela');
  const pon = (el, x, y, w, h, esc, rot) => { el.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) scale(${esc}) rotate(${rot}deg)`; };
  pon(num, nx, ny, nw, nh, 1, 0);
  cv.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.06) translateY(12px)' }], { duration: 600, easing: 'ease-in', fill: 'forwards' }).onfinish = () => caja.remove();
  // a dónde va y por dónde: una curva que sube un poco y baja hasta el número de «Tus gotas»
  const fin = () => { const f = a.getBoundingClientRect(); return [f.left + f.width / 2, f.top + f.height / 2]; };
  const curva = (p0, c1, p1, t) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c1[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c1[1] + t * t * p1[1]];
  const [x1, y1] = fin(), ctrl = [(nx + x1) / 2 + (x1 > nx ? -70 : 70), Math.min(ny, y1) - 120];
  // las gotas que lo acompañan, cada una con su propia curva y su retraso
  const gotas = [];
  for (let i = 0; i < Math.min(10, 4 + Math.round(n / 15)); i++) {
    const d = arLienzo(20, 20); arPinta(d, (c, w) => pintaGotas(c, w)); d.className = 'mis-vuela celeb-gota'; document.body.appendChild(d);
    const p0 = [x0 + (Math.random() - 0.5) * 90, y0 + (Math.random() - 0.5) * 50];
    gotas.push({ el: d, p0, c: [ctrl[0] + (Math.random() - 0.5) * 140, ctrl[1] + (Math.random() - 0.5) * 80], ret: 60 + i * 45, dur: 700 + Math.random() * 200 });
  }
  const DUR = 820, t0 = performance.now(); let llego = false, contando = false;
  const paso = ahora => {
    const dt = ahora - t0, t = Math.min(1, dt / DUR), e = suave(t), [fx, fy] = fin();
    const [x, y] = curva([nx, ny], ctrl, [fx, fy], e);
    pon(num, x, y, nw, nh, 1 - 0.55 * e, Math.sin(t * Math.PI) * -8);
    num.style.opacity = String(t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15 * 0.6);
    if (!contando && t >= 0.7) { contando = true; celebCuenta(a, antes, total, 700); }
    if (!llego && t >= 1) { llego = true; num.remove(); celebLlega(a, col, col2); }
    let vivas = 0;
    for (const q of gotas) {
      const u = Math.min(1, Math.max(0, (dt - q.ret) / q.dur)); if (!q.el.isConnected) continue;
      const k = suave(u), [gx, gy] = curva(q.p0, q.c, [fx, fy], k);
      q.el.style.opacity = String(u <= 0 ? 0 : u < 0.15 ? u / 0.15 : u > 0.9 ? (1 - u) / 0.1 : 1);
      pon(q.el, gx, gy, 20, 20, 0.6 + 0.5 * Math.sin(u * Math.PI), u * 120);
      if (u >= 1) q.el.remove(); else vivas++;
    }
    if (!llego || vivas) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
// llega el número: «Tus gotas» da un saltito con rebote y salpica de los dos colores
function celebLlega(a, col, col2) {
  play('go');
  a.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.55)', color: '#fff6ea', offset: 0.35 }, { transform: 'scale(.92)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });
  const r = a.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('i'); p.className = 'celeb-chispa'; p.style.background = i % 2 ? col : col2; document.body.appendChild(p);
    const ang = i / 10 * Math.PI * 2 + Math.random() * 0.3, d = 26 + Math.random() * 18, t0 = performance.now(), dur = 460;
    const paso = ahora => {
      const t = Math.min(1, (ahora - t0) / dur), e = rebote(Math.min(1, t * 1.1)) * 0.9 + t * 0.1;
      p.style.transform = `translate3d(${x - 5 + Math.cos(ang) * d * e}px, ${y - 5 + Math.sin(ang) * d * e + t * t * 14}px, 0) scale(${1 - 0.7 * t})`; p.style.opacity = String(1 - t);
      if (t < 1) requestAnimationFrame(paso); else p.remove();
    };
    requestAnimationFrame(paso);
  }
}
// el contador de «Tus gotas» sube deprisa hasta el total (frena al final)
function celebCuenta(a, de, hasta, ms) {
  const id = ++CELEB.cuenta, t0 = performance.now();
  const paso = ahora => {
    if (id !== CELEB.cuenta) return;
    const t = Math.min(1, (ahora - t0) / ms), v = Math.round(de + (hasta - de) * (1 - Math.pow(1 - t, 3)));
    a.textContent = String(v); if (t < 1) requestAnimationFrame(paso); else a.textContent = String(SAVE.gotas || hasta);
  };
  requestAnimationFrame(paso);
}
