import { type ReactNode, useEffect, useRef, useState } from 'react';
import './shader-art.css';

export type ShaderArtProps = {
  speed?: number;
  intensity?: number;
  scale?: number;
  interactive?: boolean;
  paused?: boolean;
  colors?: { base?: string; accent?: string; ink?: string };
  className?: string;
  children?: ReactNode;
};

const VERTEX = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAGMENT = `precision highp float;
uniform vec2 view;
uniform float time, scale, intensity;
uniform vec2 pointer;
uniform vec3 base, accent, ink;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.0 + 1.7; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * view) / min(view.x, view.y);
  vec2 p = uv * 1.2 / scale;
  p -= pointer * 0.055 * exp(-dot(uv - pointer, uv - pointer) * 5.0);
  float t = time * 0.045;
  vec2 warp = vec2(fbm(p + vec2(t, 1.2)), fbm(p + vec2(3.7, -t)));
  float field = fbm(p + 1.6 * warp);
  float crest = smoothstep(0.28, 0.65, field);
  float edge = smoothstep(0.12, 0.7, abs(uv.x));
  float strength = intensity * (0.08 + 0.9 * crest) * (0.25 + 0.75 * edge);
  vec3 color = mix(base, mix(ink, accent, crest), strength);
  gl_FragColor = vec4(color, 1.0);
}`;

function colorOf(element: HTMLElement, value: string) {
  const probe = document.createElement('canvas');
  const paint = probe.getContext('2d', { willReadFrequently: true });
  element.style.color = value;
  const resolved = getComputedStyle(element).color;
  element.style.color = '';
  if (!paint) return [0, 0, 0];
  paint.fillStyle = resolved;
  paint.fillRect(0, 0, 1, 1);
  return [...paint.getImageData(0, 0, 1, 1).data].slice(0, 3).map((channel) => channel / 255);
}

export function ShaderArt({
  speed = 1,
  intensity = 0.7,
  scale = 1,
  interactive = true,
  paused = false,
  colors,
  className = '',
  children,
}: ShaderArtProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revision, setRevision] = useState(0);
  const [fallback, setFallback] = useState(false);
  const base = colors?.base ?? 'var(--background, #f5f3ed)';
  const accent = colors?.accent ?? 'var(--primary, #087e82)';
  const ink = colors?.ink ?? 'var(--foreground, #202b2c)';

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: false, depth: false, alpha: false });
    if (!canvas || !gl) { setFallback(true); return undefined; }

    const compile = (kind: number, source: string) => {
      const shader = gl.createShader(kind);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
      gl.deleteShader(shader);
      return null;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const source = precision?.precision ? FRAGMENT : FRAGMENT.replace('precision highp float;', 'precision mediump float;');
    const fragment = compile(gl.FRAGMENT_SHADER, source);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    if (!vertex || !fragment || !program || !buffer) {
      gl.deleteShader(vertex); gl.deleteShader(fragment); gl.deleteProgram(program); gl.deleteBuffer(buffer);
      setFallback(true);
      return undefined;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'position');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program); gl.deleteBuffer(buffer);
      setFallback(true);
      return undefined;
    }
    setFallback(false);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform3fv(uniform('base'), colorOf(canvas, base));
    gl.uniform3fv(uniform('accent'), colorOf(canvas, accent));
    gl.uniform3fv(uniform('ink'), colorOf(canvas, ink));
    gl.uniform1f(uniform('scale'), Math.min(4, Math.max(0.25, scale)));
    gl.uniform1f(uniform('intensity'), Math.min(1, Math.max(0, intensity)));

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = 0, elapsed = 0;
    let pointer = { x: 0, y: 0 };
    const render = (now: number) => {
      frame = 0;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const fit = Math.min(1, Math.sqrt(1200000 / Math.max(1, canvas.clientWidth * canvas.clientHeight * ratio * ratio)));
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio * fit));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio * fit));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      elapsed += last ? Math.min((now - last) / 1000, 0.1) * Math.min(4, Math.max(0, speed)) : 0;
      last = now;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniform('view'), width, height);
      gl.uniform1f(uniform('time'), elapsed + 80);
      gl.uniform2f(uniform('pointer'), pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!paused && !motion.matches && !document.hidden) frame = requestAnimationFrame(render);
    };
    const wake = () => { cancelAnimationFrame(frame); last = 0; frame = requestAnimationFrame(render); };
    const aim = (event: PointerEvent) => {
      if (!interactive || event.pointerType === 'touch') return;
      const bounds = canvas.getBoundingClientRect();
      const side = Math.max(1, Math.min(bounds.width, bounds.height));
      pointer = { x: (event.clientX - bounds.left - bounds.width / 2) / side, y: (bounds.bottom - event.clientY - bounds.height / 2) / side };
    };
    const contextLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); setFallback(true); };
    const contextRestored = () => setRevision((current) => current + 1);
    wake();
    window.addEventListener('resize', wake);
    window.addEventListener('pointermove', aim, { passive: true });
    document.addEventListener('visibilitychange', wake);
    motion.addEventListener('change', wake);
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.addEventListener('webglcontextrestored', contextRestored);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', wake);
      window.removeEventListener('pointermove', aim);
      document.removeEventListener('visibilitychange', wake);
      motion.removeEventListener('change', wake);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [base, accent, ink, speed, intensity, scale, interactive, paused, revision]);

  return <div className={`shader-art ${className}`} data-fallback={fallback || undefined} style={{ backgroundColor: base, backgroundImage: fallback ? `radial-gradient(ellipse at 12% 18%, color-mix(in srgb, ${accent} 22%, transparent), transparent 42%), radial-gradient(ellipse at 88% 76%, color-mix(in srgb, ${ink} 12%, transparent), transparent 48%)` : 'none' }}>
    <canvas ref={canvasRef} aria-hidden="true" hidden={fallback} />
    {children}
  </div>;
}

export default ShaderArt;
