// Fans Of Sótano · Jugar sin conexión. Es el común de core/js/sw.js; este archivo tiene que estar aquí para que valga solo para este juego.
'use strict';
importScripts('../../core/js/sw.js?v=' + (new URL(self.location).searchParams.get('v') || '0'));
