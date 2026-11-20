// Tiny Fans · adaptador · MODELOS · BICHOS: hormiga, araña (y su tela) y cucaracha. Dueño: N4 (modelos 3D).
// ARCHIVO-INTERFAZ: lo deja N1 vacío pero cargable; su dueño lo rellena sin cambiar los nombres que expone. Contrato: docs/guia/juegos/tiny/README.md.
'use strict';
TN.modelos.hormiga = () => null;
TN.modelos.arana = () => null;
TN.modelos.cucaracha = () => null;
TN.modelos.tela = radio => null;
// el de una clase de bicho por su nombre ('hormiga', 'arana', 'cucaracha')
TN.modelos.bicho = clase => TN.modelos[clase]();
