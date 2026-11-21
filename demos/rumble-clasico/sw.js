// Fans of Rumble Clásico vive ahora en games/rumble-clasico (ADR 142): este service worker solo borra la copia sin conexión que dejó aquí y se da de baja. Se borra el 18-2-2027.
'use strict';
self.COPIAS_VIEJAS = /^forclasico-v/;   // las copias de sus versiones anteriores, que también borraba
importScripts('../../core/js/mudanza/reglas.js', '../../core/js/mudanza/sw.js');
