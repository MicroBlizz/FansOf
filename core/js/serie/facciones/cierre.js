// Fans Of · Lo que se calcula cuando ya están todas las cartas puestas: el gashapón de cada facción y los hechizos de las empresas
'use strict';
const GACHA_CARDS = {"animales": ["huron", "sp_bellotas", "sp_botiquin", "sp_pulgas"], "nomuertos": ["sombra", "sp_lapidas", "sp_formol", "sp_eternas", "sp_crunch"], "streamers": ["hater", "sp_donaciones", "sp_merienda", "sp_baneo"], "heroes": ["arpia", "sp_rayo", "sp_ambrosia", "sp_nerfeo"], "ciber": ["dron", "sp_orbital", "sp_nanobots", "sp_update"], "memes": ["clickbait", "sp_gatos", "sp_likes", "sp_confusion"], "gamer": ["campero", "sp_critico", "sp_energetica", "sp_ping", "sp_review"], "olvidados": ["espia", "sp_cartuchos", "sp_parchefan", "sp_cancelado"], "pop": ["paparazzi", "sp_taquilla", "sp_maquillaje", "sp_remake"]};
for (const f in GACHA_CARDS) FACTIONS[f].gacha = GACHA_CARDS[f];
FACTIONS.microblizz.spells = ['sp_despido']; FACTIONS.phony.spells = ['sp_cobro'];   // v0.9.15: hechizos de las empresas
