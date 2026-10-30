// Fans of Nova · Datos de armas: portadores, cargas, estados, reacciones, modificadores, fusiones estrella y defensas (PLAN-NOVA.md, «Sistema de armas»).
// Cada portador solo admite las cargas de su lista «admite» (un láser no dispara balas cinéticas).
// CIFRAS PROVISIONALES de la fase 0. El contenido es JSON estricto a propósito: herramientas/nova/nova-balance.py lo lee de aquí, así hay una sola fuente.
'use strict';
const NOVA_ARMAS = {
 "version": "provisional-0.1",
 "nota": "Cifras PROVISIONALES de la fase 0 (PLAN-NOVA.md). Lo decidido son las tablas; los números se iteran con herramientas/nova/nova-balance.py y con el prototipo.",
 "portadores": {
  "railgun": { "nombre": "Railgun", "dano": 62, "cadencia": 0.72, "proyectiles": 1, "acierto": 1.0, "alcance": 560, "arco": 3, "objetivos": 1.5, "admite": ["cinetica", "energia", "explosiva"], "fuerte": "Un objetivo, largo alcance", "debil": "Grupos" },
  "flak": { "nombre": "Flak", "dano": 14, "cadencia": 1.7, "proyectiles": 6, "acierto": 0.5, "alcance": 230, "arco": 50, "objetivos": 2.5, "admite": ["cinetica", "termica", "explosiva"], "fuerte": "Grupos, corto alcance", "debil": "Blindaje" },
  "laser": { "nombre": "Láser", "dano": 14, "cadencia": 2.4, "proyectiles": 1, "acierto": 0.8, "alcance": 320, "arco": 2, "objetivos": 1.0, "admite": ["energia", "termica", "em"], "fuerte": "Precisión, acumula estados", "debil": "Recarga lenta al saturar" },
  "lanzador": { "nombre": "Lanzador", "dano": 40, "cadencia": 1.0, "proyectiles": 1, "acierto": 0.8, "alcance": 640, "arco": 20, "objetivos": 1.0, "admite": ["explosiva", "termica", "em", "cinetica"], "fuerte": "Lo que huye, alcance", "debil": "Interceptables" },
  "drones": { "nombre": "Drones", "dano": 12, "cadencia": 1.8, "proyectiles": 3, "acierto": 1.0, "alcance": 220, "arco": 360, "objetivos": 1.0, "admite": ["cinetica", "energia", "em", "explosiva"], "fuerte": "Cobertura 360°, defensa", "debil": "Daño bajo por unidad" }
 },
 "cargas": {
  "cinetica": { "nombre": "Cinética", "contra": "Casco", "estado": "brecha", "multDano": 1.0, "multGrupo": 1.0, "multCasco": 1.0, "multEscudo": 0.6, "forma": "cuadrado", "color": "#ff9a3c", "especialidad": "Daño físico al casco; rebota en el escudo (×0,6)" },
  "energia": { "nombre": "Energía", "contra": "Escudos", "estado": "escudoCaido", "multDano": 1.0, "multGrupo": 1.0, "multCasco": 1.0, "multEscudo": 2.0, "forma": "círculo", "color": "#4aa8ff", "especialidad": "Doble daño a escudos y normal al casco" },
  "termica": { "nombre": "Térmica", "contra": "Casco a largo plazo", "estado": "sobrecalentado", "multDano": 0.85, "multGrupo": 1.1, "multCasco": 1.0, "multEscudo": 1.0, "forma": "rombo", "color": "#ff4b4b", "especialidad": "Ablanda el casco: cuanto más calor, más daño físico recibe" },
  "em": { "nombre": "EM", "contra": "Sistemas", "estado": "interferido", "multDano": 0.6, "multGrupo": 1.2, "multCasco": 0.0, "multEscudo": 0.0, "forma": "rayo", "color": "#b46bff", "especialidad": "No hace daño: debilita defensa, armas y regeneración; el escudo la repele" },
  "explosiva": { "nombre": "Explosiva", "contra": "Área", "estado": "marcado", "multDano": 1.1, "multGrupo": 1.5, "multCasco": 1.0, "multEscudo": 1.0, "forma": "estrella", "color": "#ffd93d", "especialidad": "Daño en área y marca: el siguiente impacto de otro tipo es crítico" }
 },
 "estados": {
  "brecha": { "nombre": "Brecha", "duracion": 4, "efecto": "El casco roto recibe +50 % de cinético y pierde blindaje", "visible": "grietas y chispas" },
  "escudoCaido": { "nombre": "Escudo caído", "duracion": 3, "efecto": "Ventana de 3 s sin escudo", "visible": "escudo apagado" },
  "sobrecalentado": { "nombre": "Sobrecalentado", "duracion": 5, "efecto": "Se acumula; al tope sus armas fallan y explota", "visible": "casco al rojo" },
  "interferido": { "nombre": "Interferido", "duracion": 5, "efecto": "Sus armas hacen −30 % de daño, recibe +15 % de daño, no regenera escudo y acumula sistemas hasta el apagón", "visible": "aro violeta" },
  "apagon": { "nombre": "Apagón", "duracion": 2, "efecto": "No dispara ni maniobra bien 2 s (jefes y capitanes, 1 s); lo causa acumular golpes de EM", "visible": "luces apagadas" },
  "marcado": { "nombre": "Marcado", "duracion": 4, "efecto": "El siguiente impacto de otro tipo es crítico", "visible": "retícula" }
 },
 "reacciones": [
  { "id": "fundido", "nombre": "Fundido", "a": "brecha", "b": "termica", "cargaA": "cinetica", "cargaB": "termica", "mult": 3.0, "efecto": "El casco roto se derrite: daño continuo ×3" },
  { "id": "impactoLimpio", "nombre": "Impacto limpio", "a": "escudoCaido", "b": "cinetica", "cargaA": "energia", "cargaB": "cinetica", "mult": 2.0, "efecto": "Crítico garantizado (crítico = ×2)" },
  { "id": "detonacion", "nombre": "Detonación", "a": "sobrecalentado", "b": "explosiva", "cargaA": "termica", "cargaB": "explosiva", "mult": 1.8, "efecto": "La explosión del enemigo se propaga a los vecinos" },
  { "id": "aQuemarropa", "nombre": "A quemarropa", "a": "interferido", "b": "cualquiera", "cargaA": "em", "cargaB": "cinetica", "mult": 2.0, "efecto": "+100 % mientras esté Interferido" },
  { "id": "dobleMarca", "nombre": "Doble marca", "a": "marcado", "b": "marcado", "cargaA": "explosiva", "cargaB": "explosiva", "mult": 2.2, "efecto": "El crítico también aplica Brecha" },
  { "id": "cortocircuito", "nombre": "Cortocircuito", "a": "brecha", "b": "em", "cargaA": "cinetica", "cargaB": "em", "mult": 1.0, "duracionX": 2, "efecto": "Interferido dura el doble (alarga A quemarropa)" }
 ],
 "combos": {
  "ablandado": { "nombre": "Ablandado", "cargas": ["termica", "cinetica", "explosiva"], "porCalor": 0.005, "max": 0.5, "efecto": "Cada punto de calor suma 0,5 % de daño cinético y explosivo (tope +50 %)" },
  "sobrecargaLenta": { "nombre": "Sobrecarga lenta", "cargas": ["em", "termica"], "calor": 1.5, "sinEscudo": 8, "efecto": "Interferido: el calor sube ×1,5 más rápido; si le das al casco no regenera escudo durante 8 s" },
  "cortacircuitos": { "nombre": "Cortacircuitos", "cargas": ["energia", "em"], "escudoCaido": 6, "efecto": "EM sobre un escudo caído lo mantiene caído el doble (6 s)" },
  "plasma": { "nombre": "Plasma", "cargas": ["energia", "termica"], "calor": 6, "efecto": "La energía sobre un enemigo con calor le suma 6 de calor por impacto" },
  "pulsoExpansivo": { "nombre": "Pulso expansivo", "cargas": ["em", "explosiva"], "duracion": 3, "sistemas": 25, "efecto": "La explosión sobre un Interferido interfiere a los vecinos sin escudo" },
  "interferencia": { "nombre": "Interferencia", "cargas": ["em"], "sistemas": 25, "danoEnemigo": 0.7, "defensa": 0.15, "efecto": "Cada golpe de EM suma 25 de sistemas; a 100 llega el Apagón" },
  "laser": { "nombre": "Láser", "cargas": ["termica", "em"], "acumula": 1.5, "efecto": "El láser acumula calor y sistemas ×1,5" }
 },
 "modificadores": {
  "cadena": { "nombre": "Cadena", "efecto": "Salta a otro enemigo", "mult": 1.3, "origen": "élites" },
  "perforante": { "nombre": "Perforante", "efecto": "Atraviesa", "mult": 1.2, "origen": "élites" },
  "vampirico": { "nombre": "Vampírico", "efecto": "Repara casco con el daño", "mult": 1.0, "origen": "élites" },
  "critico": { "nombre": "Crítico", "efecto": "+15 % de probabilidad de crítico", "mult": 1.15, "origen": "élites" },
  "rafaga": { "nombre": "Ráfaga", "efecto": "Tres disparos, más recarga", "mult": 1.2, "origen": "élites" },
  "sifon": { "nombre": "Sifón", "efecto": "Los enemigos muertos sueltan más chatarra", "mult": 1.0, "origen": "élites" }
 },
 "tamanos": { "S": 1.0, "M": 2.4, "L": 5.5 },
 "mejora": { "porNivel": 0.25, "maxNiveles": 5, "nota": "+25 % de daño por mejora de carta (provisional)" },
 "coincidencia": { "factor": 0.6, "nota": "Parte del tiempo en que los dos estados de una reacción coinciden sobre el mismo enemigo (provisional)" },
 "fusionMixta": { "mult": 1.15, "nota": "Una fusión ocupa una ranura y rinde lo de dos: premio +15 %" },
 "fusiones": [
  { "id": "railgunMetralla", "nombre": "Railgun de metralla", "portador": "railgun", "carga": "explosiva", "tipo": "mixta", "nombreProvisional": false, "efecto": "Perfora y estalla" },
  { "id": "flakIncandescente", "nombre": "Flak incandescente", "portador": "flak", "carga": "termica", "tipo": "mixta", "nombreProvisional": false, "efecto": "Metralla recalentada: Sobrecalentado en cono" },
  { "id": "misilEMP", "nombre": "Misil EMP", "portador": "lanzador", "carga": "em", "tipo": "mixta", "nombreProvisional": false, "efecto": "Apaga un enemigo" },
  { "id": "hazEnfocado", "nombre": "Haz enfocado", "portador": "laser", "carga": "termica", "tipo": "doble", "mult": 1.2, "nombreProvisional": false, "efecto": "El doble de ancho; Sobrecalienta el doble de rápido" },
  { "id": "railgunGemela", "nombre": "Railgun gemela", "portador": "railgun", "carga": "cinetica", "tipo": "doble", "mult": 1.3, "nombreProvisional": false, "efecto": "Dos proyectiles en abanico" },
  { "id": "bateriaFlak", "nombre": "Batería de flak", "portador": "flak", "carga": "cinetica", "tipo": "doble", "mult": 1.25, "nombreProvisional": false, "efecto": "Cono completo" },
  { "id": "canonIones", "nombre": "Cañón de iones", "portador": "railgun", "carga": "energia", "tipo": "mixta", "nombreProvisional": true, "efecto": "Perfora y deja sin escudo" },
  { "id": "misilRacimo", "nombre": "Misil de racimo", "portador": "lanzador", "carga": "explosiva", "tipo": "mixta", "nombreProvisional": true, "efecto": "Marca a todo un grupo" },
  { "id": "misilPerforador", "nombre": "Misil perforador", "portador": "lanzador", "carga": "cinetica", "tipo": "mixta", "nombreProvisional": true, "efecto": "Abre Brecha a distancia" },
  { "id": "dronesKamikaze", "nombre": "Drones kamikaze", "portador": "drones", "carga": "explosiva", "tipo": "mixta", "nombreProvisional": true, "efecto": "Los drones estallan al impactar" },
  { "id": "dronesParasito", "nombre": "Drones parásito", "portador": "drones", "carga": "em", "tipo": "mixta", "nombreProvisional": true, "efecto": "Se pegan al casco y lo apagan" },
  { "id": "tormentaDrones", "nombre": "Tormenta de drones", "portador": "drones", "carga": "cinetica", "tipo": "doble", "mult": 1.3, "nombreProvisional": true, "efecto": "Enjambre doble" },
  { "id": "enjambreMisiles", "nombre": "Enjambre de misiles", "portador": "lanzador", "carga": "explosiva", "tipo": "doble", "mult": 1.3, "nombreProvisional": true, "efecto": "Salva doble" }
 ],
 "modulosDefensa": {
  "escudo": { "nombre": "Escudo", "absorbe": "energía", "cae_ante": "cinético", "capacidad": 200, "regen": 15 },
  "blindaje": { "nombre": "Blindaje", "absorbe": "cinético", "cae_ante": "térmico", "capacidad": 260, "regen": 0 },
  "generadorEM": { "nombre": "Generador EM", "efecto": "Pulso que apaga lo cercano", "pulso": 3, "recarga": 12 },
  "interceptores": { "nombre": "Interceptores", "efecto": "Drones que derriban misiles", "derriba": 0.7 },
  "disipador": { "nombre": "Disipador", "efecto": "Vacía tu propio calor", "calorPorSeg": 20 }
 },
 "combosDefensa": [
  { "id": "escudoMetralla", "nombre": "Escudo de metralla", "a": "escudo", "b": "flak", "efecto": "Cada impacto que absorbe dispara metralla alrededor", "sirve": "Builds de embestida", "propuesta": false },
  { "id": "escudoTermico", "nombre": "Escudo térmico", "a": "escudo", "b": "laser", "efecto": "Refleja calor y Sobrecalienta a quien te pega de cerca", "sirve": "Contra enjambres", "propuesta": false },
  { "id": "misilesInterceptores", "nombre": "Misiles interceptores", "a": "lanzador", "b": "escudo", "efecto": "Los misiles derriban proyectiles enemigos", "sirve": "Contra misiles (Streamers)", "propuesta": false },
  { "id": "misilEMPdef", "nombre": "Misil EMP", "a": "lanzador", "b": "generadorEM", "efecto": "Apaga las armas de un enemigo 3 s (jefes, 1 s)", "sirve": "Anti-jefe", "propuesta": false },
  { "id": "burbuja", "nombre": "Burbuja", "a": "generadorEM", "b": "escudo", "efecto": "Mientras el escudo aguanta, nada alrededor dispara", "sirve": "Ventana para tragar naves", "propuesta": false },
  { "id": "cascoVivo", "nombre": "Casco vivo", "a": "blindaje", "b": "drones", "efecto": "Los drones reparan el blindaje entre oleadas", "sirve": "Expediciones largas", "propuesta": false },
  { "id": "sobrecargaControlada", "nombre": "Sobrecarga controlada", "a": "disipador", "b": "laser", "efecto": "Los láseres pasan su tope sin fallar 4 s", "sirve": "Builds láser", "propuesta": false },
  { "id": "ariete", "nombre": "Ariete", "a": "blindaje", "b": "cinetica", "efecto": "Embestir aplica Brecha sin coste de casco", "sirve": "Build Animales Locos", "propuesta": false },
  { "id": "escudoOrbital", "nombre": "Escudo orbital", "a": "escudo", "b": "drones", "efecto": "Los drones absorben impactos antes que el escudo", "sirve": "Builds de drones", "propuesta": true },
  { "id": "blindajeReactivo", "nombre": "Blindaje reactivo", "a": "blindaje", "b": "explosiva", "efecto": "Estalla al recibir un impacto fuerte", "sirve": "Contra embestidas", "propuesta": true },
  { "id": "cortinaFlak", "nombre": "Cortina de flak", "a": "interceptores", "b": "flak", "efecto": "Derriba misiles en cono", "sirve": "Contra enjambres de misiles", "propuesta": true },
  { "id": "defensaPuntual", "nombre": "Defensa puntual", "a": "interceptores", "b": "laser", "efecto": "El láser derriba proyectiles", "sirve": "Contra artillería", "propuesta": true },
  { "id": "enjambreAturdidor", "nombre": "Enjambre aturdidor", "a": "generadorEM", "b": "drones", "efecto": "Los drones llevan el pulso EM a distancia", "sirve": "Control de grupos", "propuesta": true },
  { "id": "escudoRefrigerado", "nombre": "Escudo refrigerado", "a": "disipador", "b": "escudo", "efecto": "El escudo regenera más rápido con poco calor", "sirve": "Builds de escudo", "propuesta": true },
  { "id": "radiador", "nombre": "Radiador", "a": "disipador", "b": "blindaje", "efecto": "El blindaje se repara al disipar", "sirve": "Contra térmico", "propuesta": true },
  { "id": "domo", "nombre": "Domo", "a": "interceptores", "b": "escudo", "efecto": "Un escudo pequeño sobre cada misil derribado", "sirve": "Resistencia a salvas", "propuesta": true }
 ],
 "combosDefensaNota": "El plan enumera 8 combinaciones (propuesta:false); las otras 8 (propuesta:true) completan las 16 del encargo y fueron aceptadas por Arkioner el 15-10-2026 (siguen con propuesta:true para saber su origen)."
};
