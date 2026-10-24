// Fans of Rouflage · LA CELEBRACIÓN AL COBRAR una misión o un logro (la llama misionCobra, misiones.js): sobre el botón COBRAR revienta una mancha de
// pintura con el premio bien grande («+50» y su gota), escurre un poco y el número sale volando hasta «Tus gotas», que va contando hacia arriba hasta
// el total nuevo, da un saltito y suelta una salpicadura pequeña. Detrás vuelan unas gotas de colores. Todo dibujado (canvas y CSS), sin imágenes.
// Con «reducir movimiento» del sistema, solo sube el número.
'use strict';

const CELEB = { cuenta: 0 };
const CELEB_COL = ['#ff4b5c', '#ff7a1a', '#ffcb3d', '#7ee04a', '#39d5e8', '#3a7de0'];      // los de la gota de pintura

// la mancha: un borrón de bordes irregulares, con gotas sueltas alrededor y chorretones hacia abajo (lo que escurre crece con `t`, de 0 a 1)
function celebMancha(c, w, col, semilla, t) {
  let s = semilla; const az = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const cx = w / 2, cy = w * 0.44, R = w * 0.31, oscuro = 'rgba(0,0,0,.18)';
  c.clearRect(0, 0, w, w); c.lineJoin = 'round';
  const forma = () => {
    // lóbulos redondos (como una gota que revienta): entre cada dos puntos del borde, una curva que se abomba hacia fuera
    c.beginPath(); const n = 11, picos = [];
    for (let k = 0; k < n; k++) picos.push(R * (0.86 + az() * 0.22));
    for (let k = 0; k <= n; k++) {
      const a = (k % n) / n * Math.PI * 2, r = picos[k % n], x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.92;
      if (k === 0) { c.moveTo(x, y); continue; }
      const am = (k - 0.5) / n * Math.PI * 2, rm = (picos[k - 1] + r) / 2 * (1.16 + az() * 0.1);
      c.quadraticCurveTo(cx + Math.cos(am) * rm, cy + Math.sin(am) * rm * 0.92, x, y);
    }
    c.closePath();
  };
  // los chorretones (debajo de la mancha, para que salgan de ella)
  const chorros = [[-0.42, 0.55], [-0.08, 0.95], [0.3, 0.7]];
  for (const [dx, largo] of chorros) {
    const x = cx + dx * R * 1.5, y0 = cy + R * 0.55, y1 = y0 + R * largo * (0.35 + 0.65 * t), g = R * 0.13;
    c.beginPath(); c.moveTo(x - g, y0); c.lineTo(x - g * 0.8, y1); c.arc(x, y1, g * 0.95, Math.PI, 0, true); c.lineTo(x + g, y0); c.closePath();
    c.fillStyle = col; c.fill(); c.lineWidth = w * 0.028; c.strokeStyle = OL; c.stroke();
  }
  s = semilla; forma(); c.fillStyle = col; c.fill(); c.lineWidth = w * 0.032; c.strokeStyle = OL; c.stroke();
  // sombra de abajo y brillo de arriba, para que parezca pintura fresca
  c.save(); s = semilla; forma(); c.clip();
  c.fillStyle = oscuro; c.beginPath(); c.ellipse(cx + R * 0.15, cy + R * 0.75, R * 1.1, R * 0.55, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(cx - R * 0.35, cy - R * 0.5, R * 0.42, R * 0.2, -0.5, 0, Math.PI * 2); c.fill();
  c.restore();
  // las gotitas sueltas
  s = semilla + 7;
  for (let k = 0; k < 7; k++) {
    const a = az() * Math.PI * 2, d = R * (1.15 + az() * 0.45), r = w * (0.018 + az() * 0.03);
    c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.lineWidth = w * 0.016; c.strokeStyle = OL; c.stroke();
  }
}

function misionCelebra(n) {
  const de = MIS_UI.desde, a = E('mis-gotas'); if (!de || !a || E('p-misiones').hidden) return;
  const total = SAVE.gotas || 0, antes = Math.max(0, total - n);
  const quieto = !Element.prototype.animate || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (quieto) { celebCuenta(a, antes, total, 500); return; }
  a.textContent = String(antes);
  const x0 = de.left + de.width / 2, y0 = de.top + de.height / 2 - 6;
  const col = CELEB_COL[(Math.random() * CELEB_COL.length) | 0], W = 190, sem = 1 + ((Math.random() * 1e6) | 0);
  // la mancha con su número
  const caja = document.createElement('div'); caja.className = 'celeb-caja';
  const cv = arLienzo(W, W, 'celeb-mancha'); caja.appendChild(cv);
  const num = document.createElement('div'); num.className = 'celeb-num';
  const g = arLienzo(30, 30); arPinta(g, (c, w) => pintaGotas(c, w));
  num.appendChild(document.createTextNode('+' + n)); num.appendChild(g);
  caja.appendChild(num); document.body.appendChild(caja);
  caja.style.transform = `translate(${x0 - W / 2}px, ${y0 - W * 0.44}px)`;
  const pinta = t => arPinta(cv, (c, w) => celebMancha(c, w, col, sem, t));
  pinta(0); play('cubo');
  cv.animate([{ transform: 'scale(.15) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.18) rotate(4deg)', opacity: 1, offset: 0.45 }, { transform: 'scale(.95) rotate(0)' }, { transform: 'scale(1)' }],
    { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.3)', fill: 'forwards' });
  num.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.35)', opacity: 1, offset: 0.6 }, { transform: 'translate(-50%,-50%) scale(1)' }],
    { duration: 420, delay: 90, easing: 'cubic-bezier(.2,.9,.3,1.4)', fill: 'forwards' });
  // escurre un poco mientras se lee
  const t0 = performance.now(); let vivo = true;
  const escurre = ahora => { if (!vivo) return; const t = Math.min(1, (ahora - t0) / 1100); pinta(t); if (t < 1) requestAnimationFrame(escurre); };
  requestAnimationFrame(escurre);
  // el número vuela a «Tus gotas»; la mancha se va secando
  setTimeout(() => {
    const fin = a.getBoundingClientRect(), x1 = fin.left + fin.width / 2, y1 = fin.top + fin.height / 2;
    const r = num.getBoundingClientRect(), nx = r.left + r.width / 2, ny = r.top + r.height / 2;
    document.body.appendChild(num); num.classList.add('vuela');
    num.style.left = nx + 'px'; num.style.top = ny + 'px';
    const mx = (nx + x1) / 2 + (x1 > nx ? -40 : 40), my = Math.min(ny, y1) - 90;
    num.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: `translate(calc(-50% + ${mx - nx}px), calc(-50% + ${my - ny}px)) scale(.95)`, offset: 0.45 },
      { transform: `translate(calc(-50% + ${x1 - nx}px), calc(-50% + ${y1 - ny}px)) scale(.45)`, opacity: 0.9 }], { duration: 620, easing: 'cubic-bezier(.45,0,.35,1)', fill: 'forwards' })
      .onfinish = () => { num.remove(); celebLlega(a, antes, total, col); };
    cv.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.08) translateY(10px)' }], { duration: 520, easing: 'ease-in', fill: 'forwards' }).onfinish = () => { vivo = false; caja.remove(); };
    // las gotas que acompañan
    for (let i = 0; i < Math.min(9, 3 + Math.round(n / 20)); i++) {
      const d = arLienzo(22, 22); arPinta(d, (c, w) => pintaGotas(c, w)); d.className = 'mis-vuela'; document.body.appendChild(d);
      const ax = x0 + (Math.random() - 0.5) * 120, ay = y0 - 40 - Math.random() * 70;
      d.animate([{ transform: `translate(${x0 - 11}px,${y0 - 11}px) scale(.4)`, opacity: 0 }, { transform: `translate(${ax - 11}px,${ay - 11}px) scale(1.1)`, opacity: 1, offset: 0.35 }, { transform: `translate(${x1 - 11}px,${y1 - 11}px) scale(.5)`, opacity: 0.8 }],
        { duration: 650 + i * 55, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => d.remove();
    }
  }, 1050);
}
// llega el número: «Tus gotas» cuenta hasta el total nuevo, da un saltito y salpica
function celebLlega(a, antes, total, col) {
  play('go'); celebCuenta(a, antes, total, 650);
  a.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)', color: '#fff6ea' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.4)' });
  const r = a.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('i'); p.className = 'celeb-chispa'; p.style.background = i % 2 ? col : '#8fe3ff'; p.style.left = x + 'px'; p.style.top = y + 'px'; document.body.appendChild(p);
    const ang = i / 8 * Math.PI * 2, d = 26 + Math.random() * 16;
    p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(ang) * d}px), calc(-50% + ${Math.sin(ang) * d}px)) scale(.3)`, opacity: 0 }],
      { duration: 420, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => p.remove();
  }
}
// el contador de «Tus gotas» sube de uno en uno (deprisa) hasta el total
function celebCuenta(a, de, hasta, ms) {
  const id = ++CELEB.cuenta, t0 = performance.now();
  const paso = ahora => {
    if (id !== CELEB.cuenta) return;
    const t = Math.min(1, (ahora - t0) / ms), v = Math.round(de + (hasta - de) * (1 - Math.pow(1 - t, 3)));
    a.textContent = String(v); if (t < 1) requestAnimationFrame(paso); else a.textContent = String(SAVE.gotas || hasta);
  };
  requestAnimationFrame(paso);
}
