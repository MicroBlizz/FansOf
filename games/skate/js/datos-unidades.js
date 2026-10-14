// Fans of Skate · las cifras de las unidades (vida, daño, cadencia, alcance y velocidad). Vienen de Fans of Rumble y se guardan aquí para que el juego no dependa de otro.
'use strict';
const SK_UNIDADES = {
 "squirrel": {
  "hp": 150,
  "dmg": 15,
  "cd": 0.9,
  "range": 8,
  "speed": 52,
  "r": 12,
  "sight": 120
 },
 "fox": {
  "hp": 200,
  "dmg": 18,
  "cd": 1.2,
  "range": 8,
  "speed": 42,
  "r": 14,
  "sight": 130,
  "stealth": 8,
  "surprise": 3,
  "restealth": 3
 },
 "bunny": {
  "hp": 500,
  "dmg": 25,
  "cd": 1.1,
  "range": 10,
  "speed": 36,
  "r": 20,
  "sight": 150,
  "jumpCd": 8,
  "jumpDmg": 50,
  "jumpR": 72,
  "jumpRange": 210
 },
 "beaver": {
  "hp": 100,
  "dmg": 180,
  "cd": 1,
  "range": 6,
  "speed": 58,
  "r": 12,
  "sight": 140,
  "buildings": true,
  "kamikaze": true,
  "splash": 50,
  "splashDmg": 60
 },
 "meercat": {
  "hp": 190,
  "dmg": 8,
  "cd": 1,
  "range": 8,
  "speed": 32,
  "r": 12,
  "sight": 110,
  "healer": true,
  "heal": 14,
  "healCd": 1.7,
  "healR": 95
 },
 "junkcoon": {
  "hp": 240,
  "dmg": 26,
  "cd": 1.7,
  "range": 115,
  "speed": 36,
  "r": 14,
  "sight": 150,
  "ranged": "trash",
  "splash": 42
 },
 "mechavaca": {
  "hp": 950,
  "dmg": 24,
  "cd": 1.3,
  "range": 10,
  "speed": 26,
  "r": 22,
  "sight": 140,
  "eject": "vaca"
 },
 "vaca": {
  "hp": 160,
  "dmg": 12,
  "cd": 0.9,
  "range": 8,
  "speed": 46,
  "r": 12,
  "sight": 120
 },
 "necrolord": {
  "hp": 560,
  "dmg": 26,
  "cd": 1.4,
  "range": 100,
  "speed": 32,
  "r": 18,
  "sight": 150,
  "ranged": "shadow",
  "summon": "skeleton",
  "summonN": 2,
  "summonCd": 8
 },
 "skeleton": {
  "hp": 75,
  "dmg": 12,
  "cd": 0.8,
  "range": 6,
  "speed": 52,
  "r": 9,
  "sight": 110
 },
 "zombie": {
  "hp": 140,
  "dmg": 16,
  "cd": 1.1,
  "range": 8,
  "speed": 32,
  "r": 12,
  "sight": 110
 },
 "ghostmage": {
  "hp": 170,
  "dmg": 28,
  "cd": 1.5,
  "range": 110,
  "speed": 36,
  "r": 13,
  "sight": 150,
  "ranged": "frost",
  "slow": {
   "f": 0.5,
   "t": 1.2
  }
 },
 "banshee": {
  "hp": 220,
  "dmg": 18,
  "cd": 1.2,
  "range": 80,
  "speed": 38,
  "r": 13,
  "sight": 140,
  "ranged": "wave",
  "splash": 34,
  "pulse": {
   "cd": 7,
   "r": 80,
   "stun": 1.2,
   "kind": "daze",
   "text": "¡AAAAAH!",
   "color": "rgba(230,220,255,.9)",
   "tc": "#e6dcff",
   "sfx": "wail"
  }
 },
 "twitchking": {
  "hp": 600,
  "dmg": 30,
  "cd": 1.1,
  "range": 10,
  "speed": 36,
  "r": 19,
  "sight": 150,
  "aura": {
   "r": 110,
   "mult": 1.3
  }
 },
 "subswarm": {
  "hp": 110,
  "dmg": 14,
  "cd": 0.8,
  "range": 6,
  "speed": 54,
  "r": 9,
  "sight": 110
 },
 "hypebeast": {
  "hp": 360,
  "dmg": 22,
  "cd": 0.65,
  "range": 8,
  "speed": 54,
  "r": 12,
  "sight": 130
 },
 "viralbot": {
  "hp": 190,
  "dmg": 20,
  "cd": 1.1,
  "range": 110,
  "speed": 38,
  "r": 13,
  "sight": 150,
  "ranged": "clip",
  "stunOnHit": 0.4
 },
 "snackmom": {
  "hp": 220,
  "dmg": 8,
  "cd": 1,
  "range": 8,
  "speed": 30,
  "r": 13,
  "sight": 110,
  "healer": true,
  "heal": 16,
  "healCd": 1.7,
  "healR": 95
 },
 "hypetrain": {
  "hp": 580,
  "dmg": 50,
  "cd": 1.3,
  "range": 8,
  "speed": 48,
  "r": 18,
  "sight": 140,
  "buildings": true
 },
 "banhammer": {
  "hp": 1000,
  "dmg": 32,
  "cd": 1.4,
  "range": 12,
  "speed": 26,
  "r": 21,
  "sight": 140,
  "knock": 22,
  "cleave": {
   "r": 38,
   "f": 0.7
  }
 },
 "epicchampion": {
  "hp": 640,
  "dmg": 32,
  "cd": 1.2,
  "range": 10,
  "speed": 36,
  "r": 20,
  "sight": 150,
  "teamFight": {
   "cd": 8,
   "r": 110
  }
 },
 "cupidarcher": {
  "hp": 125,
  "dmg": 15,
  "cd": 0.8,
  "range": 115,
  "speed": 44,
  "r": 11,
  "sight": 150,
  "ranged": "arrow"
 },
 "hoplite": {
  "hp": 160,
  "dmg": 16,
  "cd": 1,
  "range": 14,
  "speed": 36,
  "r": 11,
  "sight": 120
 },
 "shieldmaiden": {
  "hp": 420,
  "dmg": 18,
  "cd": 1.1,
  "range": 10,
  "speed": 34,
  "r": 15,
  "sight": 130,
  "armor": 0.35
 },
 "thundergod": {
  "hp": 240,
  "dmg": 28,
  "cd": 1.6,
  "range": 105,
  "speed": 34,
  "r": 15,
  "sight": 150,
  "chain": {
   "n": 2,
   "r": 75,
   "f": 0.7
  }
 },
 "medusa": {
  "hp": 240,
  "dmg": 18,
  "cd": 1.2,
  "range": 90,
  "speed": 36,
  "r": 13,
  "sight": 140,
  "ranged": "venom",
  "pulse": {
   "cd": 8,
   "r": 90,
   "stun": 1.4,
   "kind": "stone",
   "text": "¡MIRADA DE PIEDRA!",
   "color": "rgba(200,215,190,.95)",
   "tc": "#d4f5c4",
   "sfx": "womp"
  }
 },
 "minotaur": {
  "hp": 950,
  "dmg": 38,
  "cd": 1.4,
  "range": 10,
  "speed": 30,
  "r": 21,
  "sight": 140,
  "charge": {
   "dist": 70,
   "mult": 2.2,
   "stun": 0.8
  }
 },
 "cybermarine": {
  "hp": 560,
  "dmg": 13,
  "cd": 0.45,
  "range": 100,
  "speed": 34,
  "r": 19,
  "sight": 150,
  "ranged": "bullet",
  "summon": "drone",
  "summonN": 2,
  "summonCd": 9,
  "summonDrop": true
 },
 "drone": {
  "hp": 80,
  "dmg": 8,
  "cd": 0.6,
  "range": 90,
  "speed": 50,
  "r": 8,
  "sight": 140,
  "ranged": "bullet"
 },
 "nanobot": {
  "hp": 70,
  "dmg": 9,
  "cd": 0.7,
  "range": 6,
  "speed": 56,
  "r": 8,
  "sight": 110
 },
 "cyberninja": {
  "hp": 280,
  "dmg": 24,
  "cd": 0.8,
  "range": 8,
  "speed": 46,
  "r": 12,
  "sight": 150,
  "blink": {
   "cd": 5,
   "dist": 80
  }
 },
 "techdroid": {
  "hp": 200,
  "dmg": 8,
  "cd": 1,
  "range": 8,
  "speed": 30,
  "r": 13,
  "sight": 110,
  "healer": true,
  "heal": 14,
  "healCd": 1.7,
  "healR": 95
 },
 "hackerkid": {
  "hp": 150,
  "dmg": 12,
  "cd": 1,
  "range": 90,
  "speed": 40,
  "r": 11,
  "sight": 140,
  "ranged": "code",
  "hack": {
   "cd": 8,
   "r": 170,
   "t": 3.5
  }
 },
 "neonsniper": {
  "hp": 150,
  "dmg": 60,
  "cd": 2.4,
  "range": 170,
  "speed": 34,
  "r": 12,
  "sight": 190,
  "ranged": "snipe"
 },
 "siegemech": {
  "hp": 820,
  "dmg": 38,
  "cd": 2,
  "range": 120,
  "speed": 24,
  "r": 22,
  "sight": 150,
  "ranged": "shell",
  "splash": 45
 },
 "memelord": {
  "hp": 540,
  "dmg": 24,
  "cd": 1.2,
  "range": 90,
  "speed": 34,
  "r": 18,
  "sight": 150,
  "ranged": "card",
  "viral": {
   "cd": 7
  }
 },
 "suchdog": {
  "hp": 150,
  "dmg": 16,
  "cd": 0.8,
  "range": 8,
  "speed": 56,
  "r": 11,
  "sight": 120
 },
 "gifblaster": {
  "hp": 200,
  "dmg": 11,
  "cd": 0.45,
  "range": 100,
  "speed": 44,
  "r": 12,
  "sight": 140,
  "ranged": "gif"
 },
 "synthcat": {
  "hp": 210,
  "dmg": 24,
  "cd": 1.4,
  "range": 100,
  "speed": 36,
  "r": 13,
  "sight": 140,
  "ranged": "note",
  "splash": 36
 },
 "trollbot": {
  "hp": 680,
  "dmg": 16,
  "cd": 1,
  "range": 8,
  "speed": 34,
  "r": 16,
  "sight": 130,
  "taunt": {
   "r": 110
  }
 },
 "stonks": {
  "hp": 460,
  "dmg": 30,
  "cd": 1.1,
  "range": 8,
  "speed": 40,
  "r": 14,
  "sight": 140,
  "buildings": true,
  "stonks": {
   "step": 0.15,
   "max": 10
  }
 },
 "chonkcat": {
  "hp": 1100,
  "dmg": 26,
  "cd": 1.4,
  "range": 10,
  "speed": 26,
  "r": 23,
  "sight": 140,
  "pulse": {
   "cd": 6,
   "r": 55,
   "stun": 0.6,
   "dmg": 30,
   "kind": "daze",
   "text": "¡SE SIENTA!",
   "color": "rgba(255,220,150,.95)",
   "tc": "#ffd28a",
   "sfx": "slam"
  }
 },
 "skullknight": {
  "hp": 520,
  "dmg": 32,
  "cd": 1.3,
  "range": 10,
  "speed": 36,
  "r": 18,
  "sight": 140,
  "slow": {
   "f": 0.5,
   "t": 1.6
  }
 },
 "stitchbrute": {
  "hp": 1050,
  "dmg": 50,
  "cd": 1.4,
  "range": 10,
  "speed": 27,
  "r": 24,
  "sight": 140,
  "buildings": true,
  "deathBlast": {
   "r": 70,
   "dmg": 90
  }
 },
 "becario": {
  "hp": 130,
  "dmg": 13,
  "cd": 1,
  "range": 8,
  "speed": 44,
  "r": 12,
  "sight": 120
 },
 "starbot": {
  "hp": 170,
  "dmg": 18,
  "cd": 1.3,
  "range": 105,
  "speed": 36,
  "r": 14,
  "sight": 150,
  "ranged": "plasma"
 },
 "fallen": {
  "hp": 800,
  "dmg": 34,
  "cd": 1.6,
  "range": 10,
  "speed": 26,
  "r": 21,
  "sight": 170,
  "buildings": true
 },
 "cajabotin": {
  "hp": 320,
  "dmg": 10,
  "cd": 1,
  "range": 8,
  "speed": 30,
  "r": 15,
  "sight": 120,
  "eject": "becario",
  "ejectN": 3,
  "ejectTxt": "¡BOTÍN!"
 },
 "soportebot": {
  "hp": 200,
  "dmg": 8,
  "cd": 1,
  "range": 8,
  "speed": 30,
  "r": 13,
  "sight": 110,
  "healer": true,
  "heal": 14,
  "healCd": 1.8,
  "healR": 95
 },
 "parchebot": {
  "hp": 760,
  "dmg": 22,
  "cd": 1.3,
  "range": 10,
  "speed": 28,
  "r": 20,
  "sight": 140,
  "armor": 0.3
 },
 "progamer": {
  "hp": 560,
  "dmg": 17,
  "cd": 0.7,
  "range": 10,
  "speed": 38,
  "r": 18,
  "sight": 150,
  "combo": {
   "n": 4,
   "mult": 3,
   "stun": 0.6
  }
 },
 "noobs": {
  "hp": 90,
  "dmg": 11,
  "cd": 0.9,
  "range": 6,
  "speed": 48,
  "r": 10,
  "sight": 110
 },
 "speedrunner": {
  "hp": 230,
  "dmg": 28,
  "cd": 0.8,
  "range": 8,
  "speed": 70,
  "r": 12,
  "sight": 140,
  "buildings": true
 },
 "modder": {
  "hp": 200,
  "dmg": 8,
  "cd": 1,
  "range": 8,
  "speed": 30,
  "r": 13,
  "sight": 110,
  "healer": true,
  "heal": 15,
  "healCd": 1.7,
  "healR": 95
 },
 "coleccionista": {
  "hp": 210,
  "dmg": 24,
  "cd": 1.25,
  "range": 110,
  "speed": 36,
  "r": 13,
  "sight": 150,
  "ranged": "disc",
  "bounce": 0.6
 },
 "ragequitter": {
  "hp": 480,
  "dmg": 24,
  "cd": 1,
  "range": 8,
  "speed": 40,
  "r": 15,
  "sight": 130,
  "deathBlast": {
   "r": 70,
   "dmg": 100,
   "txt": "¡RAGE QUIT!",
   "rgb": "255,90,90",
   "c1": "#ff6b6b",
   "c2": "#ffd0d0",
   "tc": "#ff8a8a"
  }
 },
 "recreativa": {
  "hp": 950,
  "dmg": 26,
  "cd": 1.3,
  "range": 10,
  "speed": 26,
  "r": 22,
  "sight": 140,
  "eject": "noobs",
  "ejectN": 2,
  "ejectTxt": "¡INSERT COIN!"
 },
 "vikingo": {
  "hp": 620,
  "dmg": 26,
  "cd": 1.1,
  "range": 10,
  "speed": 34,
  "r": 19,
  "sight": 150,
  "shieldUp": {
   "cd": 8,
   "r": 100,
   "amt": 80,
   "t": 6
  }
 },
 "swarmbug": {
  "hp": 65,
  "dmg": 10,
  "cd": 0.6,
  "range": 6,
  "speed": 60,
  "r": 8,
  "sight": 110
 },
 "vikingsquad": {
  "hp": 170,
  "dmg": 15,
  "cd": 1,
  "range": 10,
  "speed": 38,
  "r": 11,
  "sight": 120
 },
 "retromarine": {
  "hp": 230,
  "dmg": 9,
  "cd": 0.4,
  "range": 100,
  "speed": 36,
  "r": 13,
  "sight": 150,
  "ranged": "bullet"
 },
 "ghostagent": {
  "hp": 170,
  "dmg": 62,
  "cd": 2.4,
  "range": 165,
  "speed": 36,
  "r": 12,
  "sight": 190,
  "ranged": "snipe",
  "stealth": 8,
  "surprise": 2,
  "restealth": 3
 },
 "rockracer": {
  "hp": 420,
  "dmg": 36,
  "cd": 1.3,
  "range": 95,
  "speed": 56,
  "r": 16,
  "sight": 150,
  "buildings": true,
  "ranged": "missile"
 },
 "titanbeta": {
  "hp": 1150,
  "dmg": 34,
  "cd": 1.4,
  "range": 12,
  "speed": 26,
  "r": 23,
  "sight": 140,
  "fury": {
   "f": 0.5,
   "mult": 1.5,
   "spd": 1.3
  }
 },
 "directora": {
  "hp": 520,
  "dmg": 22,
  "cd": 1.1,
  "range": 95,
  "speed": 34,
  "r": 18,
  "sight": 150,
  "ranged": "wave",
  "action": {
   "cd": 8,
   "r": 110,
   "t": 4
  }
 },
 "extras": {
  "hp": 70,
  "dmg": 9,
  "cd": 0.7,
  "range": 6,
  "speed": 54,
  "r": 9,
  "sight": 110
 },
 "doble": {
  "hp": 300,
  "dmg": 22,
  "cd": 0.8,
  "range": 8,
  "speed": 46,
  "r": 12,
  "sight": 150,
  "blink": {
   "cd": 5,
   "dist": 80,
   "col": "#ffcb3d",
   "ring": "rgba(255,203,61,.9)",
   "txt": "¡ACROBACIA!"
  }
 },
 "detective": {
  "hp": 190,
  "dmg": 18,
  "cd": 1.1,
  "range": 110,
  "speed": 36,
  "r": 12,
  "sight": 150,
  "ranged": "bullet",
  "mark": {
   "t": 4,
   "f": 0.25
  }
 },
 "heroe": {
  "hp": 520,
  "dmg": 26,
  "cd": 1,
  "range": 8,
  "speed": 44,
  "r": 14,
  "sight": 140,
  "armor": 0.3
 },
 "spoiler": {
  "hp": 230,
  "dmg": 16,
  "cd": 1.1,
  "range": 80,
  "speed": 38,
  "r": 13,
  "sight": 140,
  "ranged": "paper",
  "pulse": {
   "cd": 7,
   "r": 85,
   "stun": 1.3,
   "kind": "daze",
   "text": "¡SPOILER!",
   "color": "rgba(255,240,180,.95)",
   "tc": "#ffe9a8",
   "sfx": "wail"
  }
 },
 "kaiju": {
  "hp": 1100,
  "dmg": 40,
  "cd": 1.5,
  "range": 12,
  "speed": 25,
  "r": 24,
  "sight": 140,
  "buildings": true,
  "cleave": {
   "r": 44,
   "f": 0.6
  }
 },
 "descargabot": {
  "hp": 110,
  "dmg": 12,
  "cd": 0.9,
  "range": 6,
  "speed": 50,
  "r": 11,
  "sight": 110
 },
 "licenciabot": {
  "hp": 230,
  "dmg": 22,
  "cd": 1.2,
  "range": 105,
  "speed": 36,
  "r": 13,
  "sight": 150,
  "ranged": "contract",
  "life": 22
 },
 "plusbot": {
  "hp": 210,
  "dmg": 8,
  "cd": 1,
  "range": 8,
  "speed": 30,
  "r": 13,
  "sight": 110,
  "healer": true,
  "heal": 15,
  "healCd": 1.8,
  "healR": 95
 },
 "cobradlc": {
  "hp": 520,
  "dmg": 40,
  "cd": 1.3,
  "range": 8,
  "speed": 40,
  "r": 16,
  "sight": 140,
  "buildings": true,
  "steal": 0.4
 },
 "servidorbot": {
  "hp": 900,
  "dmg": 24,
  "cd": 1.3,
  "range": 10,
  "speed": 26,
  "r": 21,
  "sight": 140,
  "pulse": {
   "cd": 9,
   "r": 75,
   "stun": 1,
   "kind": "daze",
   "text": "¡SIN CONEXIÓN!",
   "color": "rgba(120,170,255,.95)",
   "tc": "#a9c8ff",
   "sfx": "womp"
  }
 },
 "remasterbot": {
  "hp": 700,
  "dmg": 30,
  "cd": 1.3,
  "range": 10,
  "speed": 30,
  "r": 20,
  "sight": 140,
  "remaster": 0.5
 },
 "huron": {
  "hp": 230,
  "dmg": 24,
  "cd": 0.9,
  "range": 8,
  "speed": 50,
  "r": 13,
  "sight": 140,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "sombra": {
  "hp": 220,
  "dmg": 26,
  "cd": 1,
  "range": 8,
  "speed": 46,
  "r": 13,
  "sight": 140,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "hater": {
  "hp": 240,
  "dmg": 24,
  "cd": 0.95,
  "range": 8,
  "speed": 48,
  "r": 13,
  "sight": 140,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "arpia": {
  "hp": 210,
  "dmg": 26,
  "cd": 0.95,
  "range": 8,
  "speed": 50,
  "r": 13,
  "sight": 140,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "dron": {
  "hp": 190,
  "dmg": 24,
  "cd": 0.8,
  "range": 8,
  "speed": 54,
  "r": 12,
  "sight": 140,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "clickbait": {
  "hp": 220,
  "dmg": 25,
  "cd": 0.95,
  "range": 8,
  "speed": 48,
  "r": 14,
  "sight": 140,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "campero": {
  "hp": 250,
  "dmg": 24,
  "cd": 1,
  "range": 8,
  "speed": 44,
  "r": 14,
  "sight": 140,
  "stealth": 4,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "espia": {
  "hp": 220,
  "dmg": 26,
  "cd": 0.95,
  "range": 8,
  "speed": 48,
  "r": 13,
  "sight": 140,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 },
 "paparazzi": {
  "hp": 220,
  "dmg": 22,
  "cd": 1,
  "range": 8,
  "speed": 48,
  "r": 13,
  "sight": 140,
  "flash": 1,
  "leap": {
   "range": 250,
   "cd": 9,
   "mult": 2
  }
 }
};
