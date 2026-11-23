// Fans of Asalto · DOMINIO · El regalo diario: un calendario de 7 días (el premio de cada uno está en ajustes-regalo.js). Un cobro por día;
// si un día no se entra, la racha se PAUSA (se sigue por el día en que se iba, no se pierde); tras el séptimo vuelve el primero. Una vez al
// día se puede doblar el premio cobrado (tras ver un anuncio; eso lo pide quien llama). El estado es un valor congelado:
// { siguiente: el día del calendario que toca cobrar (0 a 6), cobrado: el día ('AAAA-MM-DD') del último cobro, doblado: el día en que se dobló }.
// El día lo da quien llama (con la hora del servidor): aquí no hay reloj. Todo puro; los errores llevan nombre.
'use strict';
AS.regalo = (() => {
  const DIA = /^\d{4}-\d{2}-\d{2}$/;
  const congela = r => Object.freeze({ siguiente: r.siguiente, cobrado: r.cobrado, doblado: r.doblado });
  const vacio = () => congela({ siguiente: 0, cobrado: '', doblado: '' });
  const fecha = v => (typeof v === 'string' && DIA.test(v) ? v : '');
  function deJSON(datos, j) {
    if (!j || typeof j !== 'object') return vacio();
    const n = datos.regalo.dias.length, s = Number.isInteger(j.siguiente) && j.siguiente >= 0 ? j.siguiente % n : 0;
    return congela({ siguiente: s, cobrado: fecha(j.cobrado), doblado: fecha(j.doblado) });
  }
  // ¿hay regalo por cobrar ese día? (un día anterior o igual al último cobro, p. ej. con el reloj atrasado, no da otro)
  const pendiente = (r, dia) => !!dia && dia > r.cobrado;
  // el día del calendario que ya se cobró hoy
  const ultimo = (datos, r) => (r.siguiente + datos.regalo.dias.length - 1) % datos.regalo.dias.length;
  // cobrar el de hoy: AS.ok({ regalo: el estado nuevo, n: el día cobrado (0 a 6), premio: { plumas, cofres } }) o 'sin-dia' o 'ya-cobrado'
  function cobra(datos, r, dia) {
    if (!dia) return AS.error('sin-dia');
    if (!pendiente(r, dia)) return AS.error('ya-cobrado');
    const D = datos.regalo.dias, n = r.siguiente;
    return AS.ok({ regalo: congela({ siguiente: (n + 1) % D.length, cobrado: dia, doblado: r.doblado }), n, premio: premioDe(D[n], 1) });
  }
  // doblar el premio cobrado hoy (otra vez el mismo): AS.ok({ regalo, premio }) o 'sin-dia', 'sin-cobrar' (hoy no se ha cobrado) o 'ya-doblado'
  function dobla(datos, r, dia) {
    if (!dia) return AS.error('sin-dia');
    if (r.cobrado !== dia) return AS.error('sin-cobrar');
    if (r.doblado === dia) return AS.error('ya-doblado');
    return AS.ok({ regalo: congela({ ...r, doblado: dia }), premio: premioDe(datos.regalo.dias[ultimo(datos, r)], 1) });
  }
  const premioDe = (p, k) => Object.freeze({ plumas: (p.plumas || 0) * k, cofres: (p.cofres || 0) * k });
  // lo que enseña la ventana: los 7 días, cada uno { n (1 a 7), premio, estado: 'cobrado' | 'hoy' | 'luego', cobradoHoy }, y si se puede doblar
  // sin día (aún no ha llegado la hora del servidor): se enseña por dónde va la racha, sin decir que hoy ya se cobró (sinDia)
  function calendario(datos, r, dia) {
    const D = datos.regalo.dias, pend = pendiente(r, dia), hoy = pend || !dia ? r.siguiente : ultimo(datos, r);
    const dias = D.map((p, k) => ({ n: k + 1, premio: premioDe(p, 1), estado: k < hoy ? 'cobrado' : k === hoy ? 'hoy' : 'luego', cobradoHoy: k === hoy && !pend && !!dia && r.cobrado !== '' }));
    return { dias, pendiente: pend, hoy, sinDia: !dia, puedeDoblar: !pend && !!dia && r.cobrado === dia && r.doblado !== dia };
  }
  return { vacio, deJSON, pendiente, cobra, dobla, calendario, premioDe };
})();
