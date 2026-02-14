"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

import "./threads.css";

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform float uMorphProgress;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

// === 7 faders: x-position (0-1), knob center Y (0-1), knob height (0-1) ===
// Positions tuned to match the atto sound logo
const int FADER_COUNT = 7;

vec3 getFader(int i) {
    // Returns vec3(xPos, knobCenterY, knobHalfHeight)
    // Heart-shaped pattern: tops form two humps, bottoms form a V
    // Top contour:  0.68  0.72↑ 0.68  0.62↓ 0.68  0.72↑ 0.66
    // Bot contour:  0.50  0.44  0.36  0.26↓ 0.38  0.48  0.46
    if (i == 0) return vec3(0.27, 0.59, 0.18);
    if (i == 1) return vec3(0.35, 0.58, 0.25);
    if (i == 2) return vec3(0.42, 0.52, 0.29);
    if (i == 3) return vec3(0.50, 0.44, 0.33);
    if (i == 4) return vec3(0.58, 0.53, 0.26);
    if (i == 5) return vec3(0.65, 0.60, 0.21);
    return         vec3(0.73, 0.56, 0.19);
}

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

// SDF capsule: distance from point p to line segment a→b, with radius r
float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

// Draw all 7 faders as SDF shapes, with noise displacement controlled by morph
float drawFaders(vec2 uv, float morph, float time) {
    float aspect = iResolution.x / iResolution.y;
    // Work in aspect-corrected coordinates centered at 0.5
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

    // Responsive scaling: on portrait/narrow screens, shrink capsules to avoid overlap
    float rScale = smoothstep(0.5, 1.5, aspect);  // 0 at portrait, 1 at landscape

    float result = 0.0;
    float px = pixel(1.0, iResolution.xy);

    // On portrait screens, spread faders wider to fill more of the width
    float xSpread = mix(1.7, 1.0, rScale);

    for (int i = 0; i < FADER_COUNT; i++) {
        vec3 fader = getFader(i);
        float fx = (fader.x - 0.5) * xSpread * aspect;
        float fy = fader.y - 0.5;
        float kh = fader.z * mix(0.55, 1.0, rScale);

        // Apply noise displacement that grows with morph
        float nSeed = float(i) * 13.7;
        float dispX = Perlin2D(vec2(time * 0.4 + nSeed, uv.y * 3.0)) * morph * 0.4;
        float dispY = Perlin2D(vec2(time * 0.3 + nSeed + 50.0, uv.y * 2.0)) * morph * 0.2;

        vec2 offset = vec2(dispX, dispY);

        // Thin stem (full height vertical line)
        float stemWidth = mix(0.0018 * mix(0.6, 1.0, rScale), 0.0005, morph);
        float stemDist = abs(p.x - fx - offset.x) - stemWidth;
        // Fade stem opacity as morph increases
        float stemAlpha = smoothstep(px * 2.0, 0.0, stemDist) * mix(0.45, 0.0, smoothstep(0.0, 0.7, morph));

        // Capsule knob
        vec2 knobTop = vec2(fx, fy + kh) + offset;
        vec2 knobBot = vec2(fx, fy - kh) + offset;
        float knobRadius = mix(0.028 * mix(0.5, 1.0, rScale), 0.003, morph);
        float knobDist = sdCapsule(p, knobBot, knobTop, knobRadius);
        float knobAlpha = smoothstep(px * 2.0, -px * 0.5, knobDist) * 0.78 * (1.0 - smoothstep(0.0, 0.9, morph));

        result = max(result, max(stemAlpha, knobAlpha));
    }

    return result;
}

// Original thread line function
float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float morph = uMorphProgress; // 0 = logo, 1 = threads

    // === Threads (fade in as morph increases) ===
    float threadsFade = smoothstep(0.2, 0.8, morph);
    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }
    float threadsVal = (1.0 - line_strength) * threadsFade;

    // === Procedural faders (visible when morph is low) ===
    float fadersVal = drawFaders(uv, morph, iTime);

    // === Combine: max blending so both layers contribute ===
    float combined = max(threadsVal, fadersVal);
    fragColor = vec4(uColor * combined, combined);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function computeMorphProgress(timeSeconds: number): number {
  const PAUSE = 2.5; // seconds to hold each state
  const MORPH = 3.5; // seconds per transition
  const CYCLE = (PAUSE + MORPH) * 2; // 12s total

  const t = timeSeconds % CYCLE;

  if (t < PAUSE) return 0;
  if (t < PAUSE + MORPH) return easeInOutSine((t - PAUSE) / MORPH);
  if (t < PAUSE * 2 + MORPH) return 1;
  return 1 - easeInOutSine((t - PAUSE * 2 - MORPH) / MORPH);
}

interface ThreadsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  enableMorph?: boolean;
  morphProgressRef?: React.RefObject<number>;
}

export default function Threads({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  enableMorph = false,
  morphProgressRef,
  ...rest
}: ThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(undefined);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMorphProgress: { value: enableMorph ? 0.0 : 1.0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = clientWidth;
      program.uniforms.iResolution.value.g = clientHeight;
      program.uniforms.iResolution.value.b = clientWidth / clientHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e: MouseEvent) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMouse = [x, y];
    }
    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }
    if (enableMouseInteraction) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    function update(t: number) {
      if (enableMouseInteraction) {
        const smoothing = 0.05;
        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      const timeSeconds = t * 0.001;
      program.uniforms.iTime.value = timeSeconds;

      if (enableMorph) {
        const morphValue = computeMorphProgress(timeSeconds);
        program.uniforms.uMorphProgress.value = morphValue;
        if (morphProgressRef) {
          (morphProgressRef as { current: number }).current = morphValue;
        }
      }

      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    }
    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", resize);

      if (enableMouseInteraction) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [color, amplitude, distance, enableMouseInteraction, enableMorph, morphProgressRef]);

  return <div ref={containerRef} className="threads-container" {...rest} />;
}
