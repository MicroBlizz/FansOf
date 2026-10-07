// BORRADOR, SIN DESPLEGAR (PLAN-TIENDA.md). Edge Function `pagos`: aviso (webhook) del proveedor de pago.
// Escrito para Lemon Squeezy (firma HMAC-SHA256 en X-Signature); si se elige Paddle, cambiar solo la firma y el mapeo de campos.
// Secretos (Supabase → Edge Functions → Secrets): PAGOS_SECRETO. SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya existen en la función.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function firmaValida(cuerpo: string, firma: string | null): Promise<boolean> {
  if (!firma) return false;
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(Deno.env.get('PAGOS_SECRETO')!), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const esperada = hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(cuerpo)));
  if (esperada.length !== firma.length) return false;
  let d = 0; for (let i = 0; i < esperada.length; i++) d |= esperada.charCodeAt(i) ^ firma.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req) => {
  const cuerpo = await req.text();
  if (!(await firmaValida(cuerpo, req.headers.get('X-Signature')))) return new Response('firma', { status: 401 });
  const ev = JSON.parse(cuerpo);
  const nombre: string = ev?.meta?.event_name ?? '';
  const datos = ev?.meta?.custom_data ?? {};          // el juego los manda al abrir el pago: { usuario, producto }
  const idPago = String(ev?.data?.id ?? '');
  const bd = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  if (nombre === 'order_created' && ev?.data?.attributes?.status === 'paid') {
    const { data, error } = await bd.rpc('entregar_compra', { p_id: idPago, p_usuario: datos.usuario, p_producto: datos.producto, p_pais: ev.data.attributes.user_country ?? null });
    if (error) return new Response('error', { status: 500 });   // el proveedor reintenta
    return Response.json(data);
  }
  if (nombre === 'order_refunded') {
    const { error } = await bd.rpc('revertir_compra', { p_id: idPago });
    if (error) return new Response('error', { status: 500 });
    return Response.json({ ok: true });
  }
  return Response.json({ ok: true, ignorado: nombre });
});
