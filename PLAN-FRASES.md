# Frases y emoticonos en partida · plan

Estado (9-10-2026): **hecho y publicado en Rumble 0.9.109**. Daniel eligió: panel (A), 8 puestas (4 + 4), la CPU contesta, los textos de la sección 5 y meterlas ya en el pase actual (a quien ya cobró esos niveles se le dan al abrir el juego: `frasesRetro`). Y pidió emoticonos **dibujados a mano**, sin emojis del móvil: los adornos están en `core/js/frases-arte.js`.
Archivos: `core/js/frases.js` (armario, pase, premio), `core/js/frases-arte.js` (dibujos), `games/rumble/js/22-frases.js` (partida, CPU, PvP, Opciones), `games/rumble/css/frases.css`, datos en `games/rumble/js/retos-armario.js`. La prueba de PvP (`comprobar.py --pvp`, paso 1c) comprueba que viajan y que la partida no cambia.

Idea (Daniel, 9-10-2026): en vez de chat libre, frases y emoticonos ya preparados, en clave de sátira, como en Clash Royale. Se ganan en los pases (Temporada y PvP).
Por qué no chat libre: habría que moderar insultos y estafas, y Google Play pide denunciar y bloquear. Con frases cerradas no se puede escribir nada feo, y siguen siendo graciosas.

## 1. Qué es
- **Frases**: un bocadillo con texto («Es una característica, no un bug»).
- **Emoticonos**: el dibujo de un personaje que ya existe (CrazyBunny, MadSquirrel…) con un icono encima (😂, 😭, 💸…). No hace falta arte nuevo: se usa `drawArt` y un emoji.
- Solo para lucirse: no dan ventaja en la partida (como los marcos y los títulos).
- Cada uno tiene su rareza con los colores de siempre (Común gris… Legendaria naranja).

## 2. Dónde salen
- **Contra la CPU (campaña, partida rápida, jefes, arena)**: tu frase sale junto a tu sede y la CPU **contesta** con las suyas (frases de Microblizz, Phony e IAhorro). Así sirve desde el primer día aunque aún haya pocos jugadores en el PvP.
- **PvP**: tu frase la ve el rival junto a tu sede, y la suya sale arriba.
- El chat falso en directo puede reaccionar a veces («JAJAJA le ha dicho lo del parche»).

## 3. Reglas
- Para no hacer spam: 1 cada 3 segundos y como mucho 3 cada 10 segundos.
- **Silenciar al rival**: un botón en la partida (obligatorio en tiendas y lo que hace Clash Royale). Y en Opciones: «Frases del rival: sí / no».
- Se cierran solas a los 2,5 segundos. No paran la partida ni tapan las cartas.
- Llevas puestas 8 (4 frases + 4 emoticonos), que eliges en el Armario.

## 4. Cómo se consiguen
- **De serie** (todo el mundo): 4 frases y 4 emoticonos básicos («¡Hola!», «Bien jugado», «Gracias», «Uy…», y CrazyBunny riendo, MadSquirrel llorando, SlyFox guiñando y MeerCat rezando).
- **Pase de Temporada** (50 niveles): en niveles que hoy dan oro o gemas, no en los hitos de cada 5, que ya tienen marcos y títulos.
  - Gratis: 6 (3 frases y 3 emoticonos), por ejemplo en los niveles 3, 8, 18, 28, 38 y 48.
  - Ejecutivo: 10, con un emoticono legendario en el nivel 48.
- **Pase PvP** (30 niveles): 4 gratis y 6 de pago, con chulería competitiva («GG EZ… según mi abogado», «Lag»).
- Más adelante (opcional): un pack en la tienda o premios de eventos.

## 5. Primeras ideas de textos (para que Daniel elija y cambie)
Frases de serie: ¡Hola! · Bien jugado · Gracias · Uy…
Frases del pase:
- Es una característica, no un bug
- Lo arreglamos en el parche del día 1
- Tu feedback es muy importante para nosotros
- Nos vemos en Recursos Humanos
- Reestructuración estratégica (para cuando pierdes una torre)
- Esto lo arreglo con la tarjeta
- ¿Has probado a reiniciar?
- Esta reunión podía ser un email
- Sinergias
- Te despido con cariño
- GG EZ… según mi abogado (PvP)
- Lag (PvP)
Lo que dice la CPU: «Tu juego ha sido adquirido» · «Hemos actualizado los términos» · «Pasa por caja» · «Despedido» · «Esto ahora es de suscripción» (Phony) · «Te ha sustituido una IA» (IAhorro).
Emoticonos: cada líder de facción con su reacción (😂 😭 😉 🙏 💥 🐄 🗑️ 💸), y uno legendario animado para el Ejecutivo (el CEO lanzando billetes).

## 6. Cómo se hace (técnico)
- **Datos**: `RETOS.armario.frases` y `RETOS.armario.emotes` en `games/rumble/js/retos-armario.js` (id, texto o personaje + icono, rareza, `serie`). Las frases de la CPU, en el mismo archivo.
- **Armario** (`core/js/armario.js`): una tercera pestaña «Frases» para ver las que tienes y elegir las 8 puestas. Se guardan en `SAVE.look` como los marcos (`frases`, `emotes`, `puestas`). `darLook` acepta los tipos nuevos.
- **Premios**: `{ frase: 'id' }` y `{ emote: 'id' }` en los pases. `giveReward` y `rewardHtml` (`core/js/pases.js`) los conocen. Igual que los marcos, son del aparato: el servidor solo da oro, gemas y tiradas (ver `servidor/20-pase-temporadas-y-pvp.sql`), así que **no hace falta SQL**.
- **Partida**: un archivo nuevo `games/rumble/js/22-frases.js` con el botón, el panel (o la rueda), los bocadillos, el límite anti-spam, el botón de silenciar y las respuestas de la CPU.
- **PvP**: la frase va dentro del mensaje de turno que ya se manda (`pvpMandar`), en un campo nuevo `f: 'id'`, y `pvpRecibir` la enseña. No toca la simulación: no puede descuadrar la partida. Se ignora todo id que no exista. **Comprobar antes** que `pvp_jugar` en Supabase guarda el mensaje tal cual (es jsonb) y no descarta campos que no conoce.
- Textos en inglés en `games/rumble/idioma/` (las frases de la sátira necesitan una traducción con gracia, no literal).
- El TD y los demás juegos lo heredan si un día lo quieren (el sistema va en core; los datos, en cada juego).

## 7. Fases
1. Datos, pestaña del Armario y las 8 de serie. Contra la CPU, con sus respuestas.
2. Premios en el Pase de Temporada y en el PvP.
3. PvP: mandar y recibir, silenciar, la opción en Opciones y el límite.
4. Inglés, pruebas (las de PvP de `herramientas/pruebas/pvp.js` deben seguir dando la misma partida), novedades y desplegar.

Las fases 1 y 2 pueden salir juntas en un despliegue; la 3, en el siguiente.

## 8. Lo que decide Daniel
1. **Panel (A) o rueda (B)**. Recomendación: A. Se ve todo de un vistazo, es más fácil de tocar en móvil y es lo que conoce la gente de Clash Royale.
2. **Cuántas puestas**: 8 (4 + 4) o solo 4 como Clash Royale.
3. **Que la CPU conteste**: sí o no. Recomendación: sí.
4. Los textos de la sección 5: cuáles valen, cuáles cambiar y cuáles añadir.
5. Si el pase actual (`t1b`, termina el 22-11-2026) los recibe ya o se esperan a la temporada siguiente. Si se meten ya, quien haya cobrado esos niveles se las perdería: habría que dárselas al abrir el juego (como `facItemsRetro` con los objetos de facción).
