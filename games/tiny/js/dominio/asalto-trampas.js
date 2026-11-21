// Tiny Fans · dominio · ASALTO · TRAMPAS: lo que hace cada trampa del nido abandonado (chinchetas, ratonera, charco de pegamento y
// ventilador). Una tabla por clase de trampa, nunca un switch. Cada una dice qué pasa al entrar en su casilla (entra: { dano, gasta } o
// null si nada), cuánto frena mientras se está encima (freno) y si sopla (el ventilador empuja en ráfagas: lo aplica TN.Asalto).
// Las trampas se pisan o se esquivan; la grapadora no las rompe. reglas: AJUSTES (sus cifras, en reglas.asalto.trampas). Puro.
// Dueño: N3 (reglas).
'use strict';
TN.trampas = {
  chinchetas: { entra: r => ({ dano: r.asalto.trampas.chinchetas.dano, gasta: false }), freno: () => 1, sopla: false },
  ratonera: { entra: r => ({ dano: r.asalto.trampas.ratonera.dano, gasta: true }), freno: () => 1, sopla: false },
  pegamento: { entra: () => ({ dano: 0, gasta: false }), freno: r => r.asalto.trampas.pegamento.freno, sopla: false },
  ventilador: { entra: () => null, freno: () => 1, sopla: true },
};
