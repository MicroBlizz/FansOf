// Fans Of · CUENTA · casos de uso de los roles (ADR 097): saber qué roles tiene la cuenta que está dentro, preguntarlo al servidor y olvidarlo.
// Carga los puertos que le pasa la composición (cuenta/roles.js) y le pide las reglas al dominio (cuenta/dominio/roles.js); no sabe de Supabase,
// ni de localStorage, ni de la hora del aparato. Los puertos (cada uno, lo que el caso necesita y nada más):
//   sesion   { activa(), usuario(), invitado() }            la cuenta que está dentro ahora
//   servidor { async cuales(nombres) → nombres que sí }      el servidor (lanza si no responde)
//   almacen  { leer() → datos | null, guardar(datos) → bool } el navegador (guardar dice si se pudo)
//   reloj    { ahora() }                                     la hora del aparato
//   publicar()                                               aviso de que los roles han cambiado
'use strict';
CUENTA_ROLES.casos = ({ sesion, servidor, almacen, reloj, publicar }) => {
  const { ok, error, Roles, RolesConfirmados } = CUENTA_ROLES;
  // Lo guardado se lee una vez y se recuerda: preguntar «¿tiene el rol?» es barato aunque se haga en cada fotograma
  let guardado = null, leido = false;
  function confirmados() {
    if (!leido) {
      leido = true;
      const datos = almacen.leer(), r = datos ? RolesConfirmados.deDatos(datos) : null;
      guardado = r && r.ok ? r.valor : null;
    }
    return guardado;
  }

  // Los roles que se sabe que tiene ahora la cuenta: los de los últimos roles confirmados si vale para ella y sigue vigente; si no, ninguno
  function actuales() {
    const v = confirmados();
    return v && v.vigentePara(sesion.usuario(), reloj.ahora()) ? v.roles : Roles.vacio;
  }
  const tiene = nombre => actuales().tiene(nombre);
  // ¿hay unos roles confirmados vigentes de esta cuenta, sea sí o no? Sirve para no volver a preguntar lo que se acaba de saber
  function vigente() {
    const v = confirmados();
    return !!v && v.vigentePara(sesion.usuario(), reloj.ahora());
  }

  // El servidor es la autoridad (un invitado no puede tener ningún rol: no se le pregunta). Resultado con nombre:
  //   ok { roles, guardado }  guardado = que se pudo recordar en el navegador (sin eso, quien recarga por un cambio no acabaría nunca)
  //   error 'sin-cuenta' (sin cuenta posible: archivo suelto, iframe…) · 'sin-respuesta' (sin red) · 'cuenta-cambiada' (entró otra mientras se esperaba) · 'rol-invalido'
  async function refrescar(nombres) {
    if (!sesion.activa()) return error('sin-cuenta');
    const usuario = sesion.usuario(), antes = actuales(), preguntados = Roles.crear(nombres);
    if (!preguntados.ok) return preguntados;
    if (usuario === '') return ok({ roles: Roles.vacio, guardado: false });   // aún no ha entrado nadie (ni de invitado): sin roles, y no hay de quién guardarlo
    let tenidos = [];
    if (!sesion.invitado()) {
      try { tenidos = await servidor.cuales(preguntados.valor.lista); } catch (e) { return error('sin-respuesta'); }
    }
    if (sesion.usuario() !== usuario) return error('cuenta-cambiada');
    return guarda(usuario, antes, preguntados.valor.lista, tenidos);
  }

  function guarda(usuario, antes, preguntados, tenidos) {
    const ahora = antes.actualiza(preguntados, tenidos);
    if (!ahora.ok) return ahora;
    const sinPreguntar = antes.lista.some(n => !preguntados.includes(n));   // roles de antes que no se han vuelto a preguntar: conservan su caducidad
    const nuevo = RolesConfirmados.crear({ usuario, roles: ahora.valor, ahora: reloj.ahora(), conservaHasta: sinPreguntar ? confirmados().hasta : undefined });
    if (!nuevo.ok) return nuevo;
    guardado = nuevo.valor; leido = true;
    const quedo = almacen.guardar(nuevo.valor.aDatos());
    if (!antes.igual(ahora.valor)) publicar();
    return ok({ roles: ahora.valor, guardado: quedo });
  }

  // Cerrar sesión o borrar la cuenta: ya no se sabe nada de nadie
  function olvidar() {
    const antes = actuales();
    guardado = null; leido = true;
    almacen.guardar(null);
    if (!antes.esVacio) publicar();
  }

  return Object.freeze({ actuales, tiene, vigente, refrescar, olvidar });
};
