// Fans of Toys · datos · MEJORAS: los ejecutivos y las políticas de empresa que se eligen al empezar y al pasar cada trimestre. Cada una
// cambia una regla con su `efecto` (las claves, en dominio/reglas.js). `desde` es el nivel de la cuenta en que aparece.
// Nombres y frases en español: su inglés, en idioma/en.js. Cifras de partida (tarea #259).
'use strict';
TY.MEJORAS = TY.congela([
  { id: 'becario-marketing', nombre: 'Becario de marketing', texto: 'La publicidad cuesta la mitad. 1 de cada 10 veces publica algo vergonzoso y no sirve de nada.', efecto: { publicidadCoste: 0.5, publicidadFallo: 0.1 }, desde: 0 },
  { id: 'contable', nombre: 'Contable creativo', texto: 'El almacén no cuesta nada. No preguntes dónde guarda las cajas.', efecto: { almacenCoste: 0 }, desde: 0 },
  { id: 'ingeniera', nombre: 'Ingeniera de moldes', texto: 'Los moldes cuestan la mitad. Los hace con las sobras de los anteriores.', efecto: { moldeCoste: 0.5 }, desde: 0 },
  { id: 'comercial', nombre: 'Comercial sin vergüenza', texto: 'A precio caro pierdes menos clientes. Dice que es «exclusivo».', efecto: { caroDemanda: 0.8 }, desde: 0 },
  { id: 'ofertas', nombre: 'Reina de las ofertas', texto: 'A precio barato vendes todavía más. Sus carteles se ven desde el espacio.', efecto: { baratoDemanda: 1.9 }, desde: 0 },
  { id: 'influencer', nombre: 'Influencer en nómina', texto: 'Todo se vende un 15 % más. Cobra en figuras exclusivas.', efecto: { demanda: 1.15 }, desde: 0 },
  { id: 'turbo', nombre: 'Fábrica turbo', texto: 'Cada unidad cuesta un 20 % menos. El botón de pausa ha desaparecido.', efecto: { costeUnidad: 0.8 }, desde: 0 },
  { id: 'outlet', nombre: 'Outlet de la Torre', texto: 'Lo que sobra cada mes se liquida y recuperas la mitad de lo que costó. El almacén queda vacío.', efecto: { liquidacion: 0.5 }, desde: 0 },
  { id: 'estudio', nombre: 'Estudio de mercado', texto: 'La suerte ya no juega en tu contra: la demanda nunca baja de lo previsto.', efecto: { azarMinimo: 0 }, desde: 0 },
  { id: 'coleccionista', nombre: 'Edición de coleccionista', texto: 'Los juguetes de molde caro se venden un 25 % más caros. Llevan un número de serie pintado a mano.', efecto: { precioLujo: 1.25 }, desde: 1 },
  { id: 'fan', nombre: 'Fan número uno', texto: 'La franquicia de moda vende el doble en vez de la mitad más. Ha fundado tres foros.', efecto: { moda: 2 }, desde: 1 },
  { id: 'abogados', nombre: 'Bufete de la planta 40', texto: 'Las multas y los sustos de las noticias cuestan la mitad.', efecto: { eventoCoste: 0.5 }, desde: 2 },
  { id: 'navidad', nombre: 'Navidad todo el año', texto: 'Ningún mes es flojo: los villancicos suenan desde enero.', efecto: { mesMinimo: 1 }, desde: 3 },
]);
