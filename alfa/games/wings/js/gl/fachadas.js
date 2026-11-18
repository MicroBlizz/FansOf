// Fans of Wings · El programa de dibujo de la ciudad (boceto de Barcelona, tarea #99) y sus mallas. Cada vértice lleva posición,
// color y tres datos (aUV) que dicen qué es la cara: una PARED (u a lo largo, v en altura y la altura total; el programa le pinta
// las plantas, la cornisa, los bajos con toldos y escaparates, los balcones y las ventanas, encendidas o no), una AZOTEA (losetas),
// una CALLE (líneas de carril, pasos de cebra y la luz de las farolas, a partir de su sitio en el plano) o una cara LISA. De lejos
// las ventanas se agrupan en luces más gordas, para que la ciudad lejana sea un manto de luces que no parpadea. La luz del
// atardecer va cocida en el color: lo que mira al sol (detrás de Collserola), anaranjado; lo que le da la espalda, azulado.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const GL = A.gl, B = A.barcelona;
  const FA = A.fachadas = { triangulos: 0, pintados: 0 };
  let gl = null, prog = null, at = null, bufLote = null;
  const LISA = -1, AZOTEA = -2, CALLE = -3;
  FA.TIPO = { LISA, AZOTEA, CALLE };

  // ---------- la luz del atardecer ----------
  const SOL = (() => { const l = Math.hypot(0.33, 0.94); return [-0.33 / l, -0.94 / l]; })();   // hacia el sol, visto desde arriba (x, z)
  const AL_SOL = [1.22, 0.90, 0.60], A_LA_SOMBRA = [0.50, 0.52, 0.72];
  FA.LUZ = { techo: [1.0, 0.82, 0.64], suelo: [0.52, 0.53, 0.70], lisa: [0.92, 0.80, 0.68] };
  const mezcla = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const por = (c, f) => [c[0] * f[0], c[1] * f[1], c[2] * f[2]];
  // El color de una pared cuya cara mira hacia (nx, nz).
  FA.luzPared = (col, nx, nz) => por(col, mezcla(A_LA_SOMBRA, AL_SOL, Math.max(0, nx * SOL[0] + nz * SOL[1])));
  FA.por = por;

  // ---------- el programa ----------
  const VENTANAS =
    'vec3 pared(vec3 c){ float u=vUV.x, v=vUV.y, h=vUV.z;' +
    ' float s=exp2(clamp(floor(log2(max(vD,420.0)/420.0)),0.0,3.0));' +                                  // de lejos, las ventanas se agrupan de 2, 4 y 8
    ' float pw=3.8*s, ph=3.4*s, piso=floor(v/ph), fy=fract(v/ph), col=floor(u/pw), fx=fract(u/pw), r=h1(vec2(col,piso)+s*17.0);' +
    ' if(s<1.5){' +
    '  if(mod(piso,2.0)>0.5) c*=0.94;' +                                                                  // las lonchas, una por planta
    '  if(v>h-1.0) return c*1.25;' +                                                                      // la cornisa
    '  if(piso<0.5){ float t=h1(vec2(col,91.0));' +                                                       // los bajos: toldo, escaparate encendido o persiana
    '   if(fy>0.66&&fy<0.86&&t>0.45) return t>0.8?vec3(0.75,0.20,0.16):(t>0.62?vec3(0.20,0.50,0.30):vec3(0.85,0.62,0.25));' +
    '   if(fy<0.66&&fx>0.1&&fx<0.9) return t>0.35?vec3(1.0,0.84,0.52):vec3(0.12,0.14,0.20);' +
    '   return c*0.6; }' +
    '  if(fy>0.14&&fy<0.3&&h1(vec2(col,3.0))>0.35) return fy>0.26?c*1.12:c*0.55; }' +                    // el balcón: losa y baranda
    ' if(fy>0.3&&fy<0.8&&fx>0.22&&fx<0.78){' +
    '  if(r>0.52+0.07*log2(s)) return r>0.93?vec3(0.78,0.90,1.0):vec3(1.0,0.80,0.46)*(0.75+0.5*fract(r*9.0));' +   // encendida (alguna, con la tele puesta)
    '  if(s<2.5) return vec3(0.09,0.12,0.20); }' +
    ' return c; }';
  const CALLES =
    'vec3 mitad(vec3 c,float s,float t,float cruce){' +                                                   // una calle: s = a través, t = a lo largo, cruce = lo que falta para la bocacalle
    ' if(abs(s)<0.4&&mod(t,10.0)<5.0) c=vec3(0.62,0.60,0.56);' +
    ' if(cruce>10.5&&cruce<15.0&&mod(s+10.0,2.6)<1.3) c=vec3(0.66,0.64,0.62);' +
    ' float g=1.0-length(vec2(abs(s)-8.5,mod(t,28.0)-14.0))/9.0; if(g>0.0) c+=vec3(1.0,0.70,0.34)*floor(g*4.0+1.0)*0.12;' +   // la luz de las farolas
    ' return c; }' +
    'vec3 calle(vec3 c){ if(vD>1500.0) return c*1.15;' +
    ' float sa=mod(vUV.x-uTrama.x+uTrama.z*0.5,uTrama.z)-uTrama.z*0.5, sb=mod(vUV.y-uTrama.y+uTrama.z*0.5,uTrama.z)-uTrama.z*0.5;' +
    ' bool ea=abs(sa)<10.0, eb=abs(sb)<10.0;' +
    ' if(ea&&!eb) return mitad(c,sa,vUV.y,abs(sb)); if(eb&&!ea) return mitad(c,sb,vUV.x,abs(sa)); return c; }';
  function programa() {
    return GL.programa(
      'attribute vec3 aPos; attribute vec3 aCol; attribute vec3 aUV; uniform mat4 uVP; uniform vec3 uOjo; varying vec3 vCol; varying vec3 vUV; varying float vD;' +
      'void main(){ vD=distance(aPos,uOjo); vCol=aCol; vUV=aUV; gl_Position=uVP*vec4(aPos,1.0); }',
      'precision ' + GL.alta + ' float; varying vec3 vCol; varying vec3 vUV; varying float vD; uniform float uNiebla; uniform vec3 uTrama;' + GL.NIEBLA +
      'float h1(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }' + VENTANAS + CALLES +
      'void main(){ vec3 c=vCol;' +
      ' if(vUV.z>0.0) c=pared(c); else if(vUV.z<-2.5) c=calle(c); else if(vUV.z<-1.5) c*=0.88+0.24*h1(floor(vUV.xy/3.0));' +
      ' gl_FragColor=vec4(mix(c,uBruma,niebla(vD)*uNiebla),1.0); }');
  }
  FA.crear = function () {
    if (prog) return;
    gl = GL.gl; prog = programa();
    at = { pos: gl.getAttribLocation(prog.p, 'aPos'), col: gl.getAttribLocation(prog.p, 'aCol'), uv: gl.getAttribLocation(prog.p, 'aUV') };
  };

  // ---------- mallas ----------
  // Qué lleva en aUV un vértice de una cara plana, según su tipo: la azotea, su sitio en el mundo; la calle, su sitio en el plano.
  function datos(p, tipo) {
    if (tipo === AZOTEA) return [p[0], p[2], AZOTEA];
    if (tipo === CALLE) return [p[0] + B.SALIDA.a, p[2] + B.SALIDA.b, CALLE];
    return [0, 0, LISA];
  }
  class Malla {
    constructor() { this.d = []; }
    v(p, c, uv) { this.d.push(p[0], p[1], p[2], c[0], c[1], c[2], uv[0], uv[1], uv[2]); }
    // Caras planas (miran arriba): `col` ya con su luz; tipo LISA si no se dice.
    tri(a, b, c, col, tipo) { for (const p of [a, b, c]) this.v(p, col, datos(p, tipo)); }
    cuadro(a, b, c, d, col, tipo) { this.tri(a, b, c, col, tipo); this.tri(a, c, d, col, tipo); }
    // Una pared de p a q (en x, z) entre y0 e y1. Con `alto` (metros de verdad) lleva ventanas; u0 desplaza el dibujo para que
    // dos paredes no salgan iguales.
    pared(p, q, y0, y1, col, alto, u0) {
      const nx = q[1] - p[1], nz = -(q[0] - p[0]), l = Math.hypot(nx, nz) || 1, c = FA.luzPared(col, nx / l, nz / l), o = u0 || 0;
      const uv = (u, v) => (alto ? [o + u, v, alto] : [0, 0, LISA]);
      const a0 = [p[0], y0, p[1]], a1 = [q[0], y0, q[1]], b1 = [q[0], y1, q[1]], b0 = [p[0], y1, p[1]];
      this.v(a0, c, uv(0, 0)); this.v(a1, c, uv(l, 0)); this.v(b1, c, uv(l, alto)); this.v(a0, c, uv(0, 0)); this.v(b1, c, uv(l, alto)); this.v(b0, c, uv(0, alto));
    }
    subir() {
      if (!this.d.length) return null;
      const buf = gl.createBuffer(), n = this.d.length / 9;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.d), gl.STATIC_DRAW);
      this.d = null;
      FA.triangulos += n / 3;
      return { buf, n };
    }
  }
  FA.Malla = Malla;

  // ---------- dibujar ----------
  function atributos() {
    gl.vertexAttribPointer(at.pos, 3, gl.FLOAT, false, 36, 0); gl.vertexAttribPointer(at.col, 3, gl.FLOAT, false, 36, 12); gl.vertexAttribPointer(at.uv, 3, gl.FLOAT, false, 36, 24);
  }
  FA.empieza = function (cam) {
    FA.pintados = 0;
    gl.useProgram(prog.p); gl.enableVertexAttribArray(at.pos); gl.enableVertexAttribArray(at.col); gl.enableVertexAttribArray(at.uv);
    gl.uniformMatrix4fv(prog.u.uVP, false, cam.VP); gl.uniform3fv(prog.u.uOjo, cam.ojo); gl.uniform1f(prog.u.uNiebla, 1);
    gl.uniform3fv(prog.u.uBruma, GL.ambiente.bruma); gl.uniform3f(prog.u.uTrama, B.MARINA, B.GRAN_VIA, B.PASO);
  };
  FA.pinta = function (m) {
    if (!m) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf); atributos();
    gl.drawArrays(gl.TRIANGLES, 0, m.n);
    FA.pintados += m.n / 3;
  };
  // Lo que cambia en cada imagen (el tráfico): `datos` es un Float32Array con `n` vértices ya escritos.
  FA.pintaLote = function (datosLote, n) {
    if (!n) return;
    bufLote = bufLote || gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufLote); gl.bufferData(gl.ARRAY_BUFFER, datosLote.subarray(0, n * 9), gl.DYNAMIC_DRAW); atributos();
    gl.drawArrays(gl.TRIANGLES, 0, n);
    FA.pintados += n / 3;
  };
  FA.acaba = () => gl.disableVertexAttribArray(at.uv);
})(WINGS);
