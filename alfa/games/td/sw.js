// Fans of TD · Jugar sin conexión. Es el común de core/js/sw.js; este archivo tiene que estar aquí para que valga solo para este juego.
self.COPIAS_VIEJAS = /^fortd-v/;   // las copias que guardaban las versiones anteriores: se borran al activarse
importScripts('../../core/js/sw.js?v=' + (new URL(self.location).searchParams.get('v') || '0'));
