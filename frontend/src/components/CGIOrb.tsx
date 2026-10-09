import { useEffect, useRef } from 'react';

const vertexShader = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const fragmentShader = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;

  mat2 rotate2d(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + vec3(.1, .2, .3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1.,0.,0.)), f.x),
                   mix(hash3(i + vec3(0.,1.,0.)), hash3(i + vec3(1.,1.,0.)), f.x), f.y),
               mix(mix(hash3(i + vec3(0.,0.,1.)), hash3(i + vec3(1.,0.,1.)), f.x),
                   mix(hash3(i + vec3(0.,1.,1.)), hash3(i + vec3(1.,1.,1.)), f.x), f.y), f.z);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(uv, -1.9));
    vec3 center = vec3(u_pointer.x * .12 + sin(u_time * .28) * .035,
                       u_pointer.y * .10 + cos(u_time * .34) * .045, 0.0);
    vec3 oc = ro - center;
    float b = dot(oc, rd);
    float h = b * b - dot(oc, oc) + .78 * .78;

    if (h < 0.0) {
      float halo = exp(h * 16.0) * .21;
      gl_FragColor = vec4(vec3(.54, .29, .95) * halo + vec3(.09, .42, .58) * halo, halo);
      return;
    }

    float t = -b - sqrt(h);
    vec3 position = ro + rd * t;
    vec3 normal = normalize(position - center);
    float turn = u_time * .16;
    normal.xz = rotate2d(turn) * normal.xz;
    normal.xy = rotate2d(-turn * .73) * normal.xy;

    float cloud = noise3(normal * 4.1 + vec3(0.0, u_time * .05, -u_time * .035));
    float bands = .5 + .5 * sin(normal.x * 7.5 + normal.y * 9.0 - u_time * .72 + cloud * 3.5);
    vec3 deep = vec3(.12, .075, .32);
    vec3 teal = vec3(.05, .43, .53);
    vec3 rose = vec3(.72, .17, .48);
    vec3 base = mix(deep, teal, smoothstep(.08, .92, bands));
    base = mix(base, rose, smoothstep(.62, .98, bands) * .72);

    vec3 viewDir = normalize(ro - position);
    vec3 lightA = normalize(vec3(-.65, .8, 1.2));
    vec3 lightB = normalize(vec3(1.0, -.4, .7));
    float diffuse = max(dot(normal, lightA), 0.0);
    float softLight = max(dot(normal, lightB), 0.0);
    float specular = pow(max(dot(reflect(-lightA, normal), viewDir), 0.0), 34.0);
    float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.6);
    vec3 color = base * (.24 + diffuse * .62 + softLight * .16);
    color += vec3(.68, .48, 1.0) * specular * 1.65;
    color += vec3(.38, .2, .88) * rim * .78;
    color += vec3(.02, .28, .34) * smoothstep(.6, 1.0, cloud);
    color = color / (1.0 + color * .22);
    color = pow(color, vec3(.9));

    float alpha = smoothstep(0.0, .026, sqrt(h));
    gl_FragColor = vec4(color, alpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function CGIOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    if (!buffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const pointerLocation = gl.getUniformLocation(program, 'u_pointer');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let pointerX = 0;
    let pointerY = 0;
    let visible = true;
    let frameId = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    };
    const render = (timestamp: number) => {
      if (!visible || document.hidden) return;
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      if (resolutionLocation) gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      if (pointerLocation) gl.uniform2f(pointerLocation, pointerX, pointerY);
      if (timeLocation) gl.uniform1f(timeLocation, reducedMotion ? 0 : timestamp * .001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reducedMotion) frameId = window.requestAnimationFrame(render);
    };
    const start = () => {
      if (!reducedMotion && !document.hidden) {
        window.cancelAnimationFrame(frameId);
        frameId = window.requestAnimationFrame(render);
      } else {
        render(0);
      }
    };
    const handleVisibility = () => {
      if (document.hidden) window.cancelAnimationFrame(frameId);
      else start();
    };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else window.cancelAnimationFrame(frameId);
    }, { threshold: .01 }) : null;

    resize();
    if (observer) observer.observe(canvas);
    else start();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', updatePointer, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', updatePointer);
      document.removeEventListener('visibilitychange', handleVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return <div className="cgi-orb" role="img" aria-label="A luminous, animated three-dimensional orb representing a new career orbit">
    <div className="cgi-orb-fallback" />
    <canvas className="cgi-orb-canvas" ref={canvasRef} aria-hidden="true" />
  </div>;
}
