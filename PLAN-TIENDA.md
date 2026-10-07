# Tienda con dinero real · plan y estado

Estado (7-10-2026): **preparado, NADA activo**. No se cobra ni se puede cobrar: no hay cuenta en ningún proveedor, el SQL de `servidor/16-tienda-real.sql` no está aplicado y la Edge Function de `servidor/funciones/pagos/` no está desplegada. Abrir la tienda requiere el visto bueno explícito de Arkioner.

Modelo (decidido): todos los objetos salen del gachapón; el dinero solo compra los mismos recursos que se ganan jugando (acelerar). Contexto legal y de diseño: `PLAN-CUENTAS.md` sección 14.

## 1. Cobro
Flujo: botón en la tienda → página de pago del proveedor (con `usuario`, `juego` y `producto` como datos personalizados) → el proveedor avisa por webhook → Edge Function `pagos` comprueba la firma → `entregar_compra()` apunta la compra (id del pago único) y suma al `monedero` → el juego lo ve al sincronizar. El navegador nunca dice «he pagado».

Proveedor (decide Arkioner; ambos son comercio registrado y se ocupan del IVA UE):
- **Lemon Squeezy** (inclinación: alta sencilla para autónomo, webhook firmado HMAC-SHA256, datos personalizados en el checkout).
- **Paddle**: más maduro, revisa más el negocio al dar de alta.
- Riesgo común: ambos restringen categorías (juegos de azar). **Antes de darse de alta, preguntarles por escrito si aceptan recursos de juego que se gastan en un gachapón con probabilidades publicadas**, y guardar la respuesta. Verificar comisiones y condiciones vigentes al elegir.

Reglas del webhook: solo estados pagados; reembolso/disputa = restar (puede dejar saldo negativo y marcar la cuenta, nunca borrar); idempotente por id del pago; ignora productos que no estén en la tabla `productos`; país prohibido = rechazar y reembolsar.

## 2. Qué se entrega
- Packs de oro/gemas: precio y cantidades de `SHOP` de cada juego (hoy de prueba) pasan a la tabla `productos` del servidor, que manda sobre el cliente.
- Pase Ejecutivo: marca `reclamos` con `pase:premium` (lo que hoy hace el motivo `compra-pase`).

## 3. Quitar lo de prueba (el mismo día que se abra la tienda, no antes)
1. Cliente: `tienda.js` deja de llamar a `ECO.ganar('compra')` y abre el pago; `retos.js` deja de dar el pase con `compra-pase`.
2. Topes: borrar `compra`, `compra-pase` y `pruebas` de `TOPES_COMUNES` (`core/js/sistema/economia.js`) y de `tablas_juego.datos.topes`; el modo pruebas queda solo en local/DEV sin pasar por el servidor.
3. Servidor: borrar `migrar_abierta`, `conciliar_abierta` y `puerta_abierta()` (se cierra sola el 21-10-2026 00:00 UTC; después ya no hace nada, borrarlas es limpieza). El SQL que borra lo pega Arkioner en el editor de Supabase (el conector no ejecuta `drop`).
4. Compatibilidad: versiones antiguas de los juegos que sigan pidiendo esos motivos recibirán rechazo; solo perjudica a ese cliente, no hay que mantenerlos.

## 4. Requisitos antes de cobrar (lista de comprobación)
- [ ] Alta como autónomo o sociedad (decide Arkioner) y datos del vendedor en las condiciones. Nombre de estudio: se queda «MicroBlizz» salvo que algo obligue.
- [ ] Cuenta del proveedor aprobada para este tipo de producto (ver arriba).
- [ ] Condiciones de venta y política de privacidad actualizadas (ES/EN). La página de privacidad ya está en TODO.md.
- [ ] Cuenta vinculada (email/Google) obligatoria para comprar; invitados no.
- [ ] Casilla «Las compras las hace una persona adulta o con su permiso» antes de pagar, y desistimiento expreso (contenido digital) en la página de pago.
- [ ] Precios siempre en euros además de la moneda del juego (ya se muestran en euros).
- [ ] Probabilidades de cada rareza visibles en la pantalla del gachapón (hoy salen de `tablas_juego`: mostrarlas desde ahí para que sean las reales).
- [ ] Bélgica y Países Bajos: no vender recursos (el país lo da el proveedor; la función ya rechaza lista `paises_bloqueados`). Vigilar el borrador español de cajas de botín.
- [ ] Sin cuentas atrás ni ofertas de presión dirigidas a niños (la «oferta de broma» actual es solo humor; revisar antes de abrir).
- [ ] Pruebas en modo sandbox del proveedor: compra, reembolso, compra en un dispositivo y verla en otro, aviso duplicado.
- [ ] Devolver sin discusión si un menor compró sin permiso.

## 5. Preparado en el repo (inactivo)
- `servidor/16-tienda-real.sql`: tablas `productos` y `compras`, `entregar_compra()` y `revertir_compra()` (solo `service_role`). Sin aplicar.
- `servidor/funciones/pagos/index.ts`: borrador de la Edge Function (verifica firma, llama a `entregar_compra`). Sin desplegar; ajustar a la API del proveedor elegido.

## 6. Decisiones que necesita Arkioner
1. Proveedor (Lemon Squeezy o Paddle) y ¿preguntamos ya por escrito si aceptan este producto?
2. Autónomo o sociedad, y cuándo darlo de alta.
3. Catálogo y precios reales de los packs (hoy `SHOP` es de prueba).
4. El visto bueno final para abrir la tienda (y desplegar).
