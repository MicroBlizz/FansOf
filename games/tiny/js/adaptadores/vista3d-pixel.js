// Tiny Fans · adaptador · VISTA 3D · PÍXEL: las dos texturas pequeñas, el contorno suave por profundidad, el azul de las sombras y la
// ampliación con píxel entero (los sombreadores del boceto 4). Lo usa vista3d.js: TN.vistaPixel.crea(renderer, lejos) da
// { tamano(anchoReal, altoReal, anchoPixeles), pinta(escena, camara, sub), escala, ancho, alto }.
'use strict';
TN.vistaPixel = {
  POST: `precision highp float; uniform sampler2D tColor, tDepth; uniform vec2 uRes; uniform float uRango, uBorde, uUmbral; varying vec2 vUv;
    float D(vec2 o){ return texture2D(tDepth, vUv + o / uRes).r * uRango; }
    void main(){
      vec3 c = texture2D(tColor, vUv).rgb; float d = D(vec2(0.)), e = 0.;
      e += step(uUmbral, D(vec2(1.,0.)) - d); e += step(uUmbral, D(vec2(-1.,0.)) - d); e += step(uUmbral, D(vec2(0.,1.)) - d); e += step(uUmbral, D(vec2(0.,-1.)) - d);
      c *= 1. - uBorde * clamp(e, 0., 1.);
      float l = dot(c, vec3(.299,.587,.114));
      c = mix(c, c * vec3(.85,.92,1.18), (1. - l) * .45);
      c = mix(vec3(l), c, 1.1);
      gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
    }`,
  COPIA: 'precision highp float; uniform sampler2D tPost; uniform vec2 uRes; uniform float uEscala; uniform vec2 uSub; void main(){ vec2 p = floor((gl_FragCoord.xy + uSub * uEscala) / uEscala) + 1.; gl_FragColor = texture2D(tPost, (p + .5) / uRes); }',
  crea(renderer, lejos) {
    const T = THREE;
    const textura = () => new T.WebGLRenderTarget(2, 2, { minFilter: T.NearestFilter, magFilter: T.NearestFilter, format: T.RGBAFormat, generateMipmaps: false });
    const escena = textura(), post = textura(), sub = new T.Vector2();
    escena.depthTexture = new T.DepthTexture(2, 2); escena.depthTexture.type = T.UnsignedShortType;
    const postMat = new T.ShaderMaterial({ depthTest: false, fragmentShader: TN.vistaPixel.POST,
      uniforms: { tColor: { value: escena.texture }, tDepth: { value: escena.depthTexture }, uRes: { value: new T.Vector2(2, 2) }, uRango: { value: lejos - .1 }, uBorde: { value: .34 }, uUmbral: { value: .3 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }' });
    const copiaMat = new T.ShaderMaterial({ depthTest: false, fragmentShader: TN.vistaPixel.COPIA,
      uniforms: { tPost: { value: post.texture }, uRes: { value: new T.Vector2(2, 2) }, uEscala: { value: 1 }, uSub: { value: sub } },
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0., 1.); }' });
    const cuadro = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), postEsc = new T.Scene(), copiaEsc = new T.Scene();
    postEsc.add(new T.Mesh(new T.PlaneGeometry(2, 2), postMat)); copiaEsc.add(new T.Mesh(new T.PlaneGeometry(2, 2), copiaMat));
    const yo = { escala: 1, ancho: 2, alto: 2,
      // píxel entero: todos cuadrados e iguales; 2 de margen para el ajuste fino de la cámara
      tamano(anchoReal, altoReal, anchoPixeles) {
        yo.escala = Math.max(1, Math.round(anchoReal / anchoPixeles));
        yo.ancho = Math.ceil(anchoReal / yo.escala) + 2; yo.alto = Math.ceil(altoReal / yo.escala) + 2;
        escena.setSize(yo.ancho, yo.alto); post.setSize(yo.ancho, yo.alto);
        postMat.uniforms.uRes.value.set(yo.ancho, yo.alto); copiaMat.uniforms.uRes.value.set(yo.ancho, yo.alto); copiaMat.uniforms.uEscala.value = yo.escala;
      },
      pinta(esc, camara, subX, subY) {
        sub.set(subX, subY);
        renderer.setRenderTarget(escena); renderer.render(esc, camara);
        renderer.setRenderTarget(post); renderer.render(postEsc, cuadro);
        renderer.setRenderTarget(null); renderer.render(copiaEsc, cuadro);
      } };
    return yo;
  },
};
