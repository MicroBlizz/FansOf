// Fans Of · CUENTA · dominio de los roles (ADR 097): qué roles tiene una cuenta y hasta cuándo vale lo que se sabe de ello. Reglas puras: sin red,
// sin reloj, sin almacenamiento ni pantalla; todo lo de fuera llega por los puertos de la capa de aplicación (cuenta/aplicacion/roles-casos.js).
// CUENTA_ROLES es el único objeto global del contexto: cada archivo cuelga de él sus piezas. Un resultado es { ok: true, valor } o { ok: false, error, datos }.
// Roles y Veredicto son value objects: se crean con su fábrica (nunca con new), no cambian y se comparan por valor.
'use strict';
const CUENTA_ROLES = {};
CUENTA_ROLES.ok = valor => ({ ok: true, valor });
CUENTA_ROLES.error = (error, datos) => ({ ok: false, error, datos });
CUENTA_ROLES.HORAS_VALIDO = 6;   // cuánto se fía la página de un «sí» sin volver a preguntar (como el rol beta)
CUENTA_ROLES.MINUTOS_SIN_ROL = 30;   // y de un «no» quien no necesita la respuesta al instante (el panel DEV); la puerta de la alfa pregunta siempre

(() => {
  const { ok, error } = CUENTA_ROLES;
  const LLAVE = Symbol('solo las fábricas');
  const NOMBRE = /^[a-z0-9-]{1,24}$/;   // el mismo patrón que la tabla roles del servidor

  // La lista ya validada y ordenada, o el primer nombre que no vale
  function limpia(lista) {
    if (!Array.isArray(lista)) return error('lista-invalida');
    const malo = lista.find(n => typeof n !== 'string' || !NOMBRE.test(n));
    if (malo !== undefined) return error('rol-invalido', { rol: malo });
    return ok([...new Set(lista)].sort());
  }

  // El conjunto de roles de una cuenta
  class Roles {
    #lista;
    constructor(llave, lista) {
      if (llave !== LLAVE) throw new Error('Roles se crea con Roles.crear()');
      this.#lista = Object.freeze(lista);
      Object.freeze(this);
    }
    static crear(lista) { const r = limpia(lista); return r.ok ? ok(new Roles(LLAVE, r.valor)) : r; }
    static get vacio() { return VACIO; }
    tiene(nombre) { return this.#lista.includes(nombre); }
    get lista() { return this.#lista; }
    get esVacio() { return this.#lista.length === 0; }
    igual(otro) { return otro instanceof Roles && this.#lista.length === otro.lista.length && this.#lista.every((n, i) => n === otro.lista[i]); }
    // Lo que se acaba de averiguar de unos roles (preguntados) sustituye a lo que se sabía de ellos; los demás se quedan como estaban.
    // tenidos: de los preguntados, los que el servidor dice que sí. Un rol «tenido» que no se preguntó no se cuela.
    actualiza(preguntados, tenidos) {
      const p = limpia(preguntados), t = limpia(tenidos);
      if (!p.ok) return p;
      if (!t.ok) return t;
      const intactos = this.#lista.filter(n => !p.valor.includes(n));
      return Roles.crear([...intactos, ...t.valor.filter(n => p.valor.includes(n))]);
    }
  }
  const VACIO = new Roles(LLAVE, []);

  // Lo que se sabe de los roles de UNA cuenta y hasta cuándo se fía uno (ms del aparato): lo que se guarda en el navegador
  class Veredicto {
    #usuario; #roles; #hasta;
    constructor(llave, usuario, roles, hasta) {
      if (llave !== LLAVE) throw new Error('Veredicto se crea con Veredicto.crear()');
      this.#usuario = usuario; this.#roles = roles; this.#hasta = hasta;
      Object.freeze(this);
    }
    // Un «sí» se fía 6 horas y un «no» (sin ningún rol) solo 30 minutos, para que quien recibe un rol no espere horas.
    // conservaHasta: si parte de los roles son de un veredicto anterior que no se ha vuelto a preguntar, no se les alarga la vida:
    // todo el conjunto caduca cuando caduca lo más viejo que lleva
    static crear({ usuario, roles, ahora, conservaHasta }) {
      if (typeof usuario !== 'string' || usuario === '') return error('usuario-vacio');
      if (!(roles instanceof Roles)) return error('roles-invalidos');
      if (!Number.isFinite(ahora)) return error('hora-invalida');
      const propio = ahora + (roles.esVacio ? CUENTA_ROLES.MINUTOS_SIN_ROL * 60e3 : CUENTA_ROLES.HORAS_VALIDO * 3600e3);
      return ok(new Veredicto(LLAVE, usuario, roles, Number.isFinite(conservaHasta) ? Math.min(propio, conservaHasta) : propio));
    }
    // En la frontera: lo guardado en el navegador (JSON de cualquiera) se convierte aquí o se rechaza con su motivo
    static deDatos(datos) {
      if (!datos || typeof datos !== 'object' || typeof datos.u !== 'string' || datos.u === '' || !Number.isFinite(datos.hasta)) return error('datos-invalidos');
      const r = Roles.crear(datos.r);
      return r.ok ? ok(new Veredicto(LLAVE, datos.u, r.valor, datos.hasta)) : r;
    }
    aDatos() { return { u: this.#usuario, r: [...this.#roles.lista], hasta: this.#hasta }; }
    get roles() { return this.#roles; }
    get usuario() { return this.#usuario; }
    get hasta() { return this.#hasta; }
    vigentePara(usuario, ahora) { return usuario !== '' && usuario === this.#usuario && ahora < this.#hasta; }
  }

  CUENTA_ROLES.Roles = Roles;
  CUENTA_ROLES.Veredicto = Veredicto;
})();
