"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const APP_REGISTER_URL = "https://app.wazelo.in/auth/register";
const APP_LOGIN_URL = "https://app.wazelo.in/auth/login";

// ─── Lightning WebGL Shader ───────────────────────────────────────────────────
const Lightning: React.FC<{ hue?: number; speed?: number; intensity?: number; size?: number }> = ({
  hue = 220, speed = 1, intensity = 1, size = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; };
    resize();
    window.addEventListener("resize", resize);

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vert = `attribute vec2 p; void main(){ gl_Position=vec4(p,0,1); }`;
    const frag = `
      precision mediump float;
      uniform vec2 iRes; uniform float iTime,uHue,uSpeed,uIntensity,uSize;
      #define N 10
      vec3 hsv2rgb(vec3 c){vec3 r=clamp(abs(mod(c.x*6.+vec3(0,4,2),6.)-3.)-1.,0.,1.);return c.z*mix(vec3(1),r,c.y);}
      float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
      float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
      mat2 rot(float t){float c=cos(t),s=sin(t);return mat2(c,-s,s,c);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);float a=h12(i),b=h12(i+vec2(1,0)),c=h12(i+vec2(0,1)),d=h12(i+vec2(1,1));vec2 t=smoothstep(0.,1.,f);return mix(mix(a,b,t.x),mix(c,d,t.x),t.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<N;i++){v+=a*noise(p);p*=rot(.45)*2.;a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/iRes*2.-1.; uv.x*=iRes.x/iRes.y;
        uv+=2.*fbm(uv*uSize+.8*iTime*uSpeed)-1.;
        float d=abs(uv.x);
        vec3 col=hsv2rgb(vec3(uHue/360.,.7,.8))*pow(mix(0.,.07,h11(iTime*uSpeed))/d,1.)*uIntensity;
        gl_FragColor=vec4(col,1);
      }`;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const vs = compile(vert, gl.VERTEX_SHADER);
    const fs = compile(frag, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "iRes");
    const uTime = gl.getUniformLocation(prog, "iTime");
    const uH = gl.getUniformLocation(prog, "uHue");
    const uSp = gl.getUniformLocation(prog, "uSpeed");
    const uIn = gl.getUniformLocation(prog, "uIntensity");
    const uSz = gl.getUniformLocation(prog, "uSize");

    let id: number;
    const t0 = performance.now();
    const render = () => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform1f(uH, hue); gl.uniform1f(uSp, speed);
      gl.uniform1f(uIn, intensity); gl.uniform1f(uSz, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      id = requestAnimationFrame(render);
    };
    id = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(id); };
  }, [hue, speed, intensity, size]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
};

// ─── Earth Globe (procedural WebGL) ──────────────────────────────────────────
const EarthGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    };
    resize();

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // ── Shaders ──────────────────────────────────────────────────────────────
    const vertSrc = `
      attribute vec3 aPos;
      attribute vec2 aUV;
      attribute vec3 aNorm;
      uniform mat4 uMVP;
      uniform mat3 uNormMat;
      varying vec2 vUV;
      varying vec3 vNorm;
      varying vec3 vPos;
      void main(){
        vUV = aUV;
        vNorm = normalize(uNormMat * aNorm);
        vPos = aPos;
        gl_Position = uMVP * vec4(aPos, 1.0);
      }
    `;

    const fragSrc = `
      precision highp float;
      varying vec2 vUV;
      varying vec3 vNorm;
      varying vec3 vPos;
      uniform float uTime;

      // ── Noise helpers ──
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
                   mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
      }
      float fbm(vec2 p){
        float v=0.0,a=0.5;
        for(int i=0;i<6;i++){v+=a*noise(p);p*=2.1;a*=0.5;}
        return v;
      }

      void main(){
        // UV → land/ocean mask
        vec2 uv = vUV;
        float n = fbm(uv * 4.0 + vec2(1.7, 0.9));
        float n2 = fbm(uv * 8.0 + vec2(3.1, 2.3));
        float land = smoothstep(0.52, 0.58, n + n2 * 0.18);

        // Ocean color — deep teal-blue
        vec3 ocean = mix(vec3(0.02,0.10,0.22), vec3(0.04,0.18,0.35), fbm(uv*6.0));
        // Land color — earthy greens and browns
        vec3 lowLand = mix(vec3(0.12,0.22,0.08), vec3(0.20,0.30,0.10), noise(uv*12.0));
        vec3 highland = mix(vec3(0.28,0.22,0.14), vec3(0.38,0.30,0.18), noise(uv*20.0));
        float elev = fbm(uv*10.0+vec2(5.0));
        vec3 landColor = mix(lowLand, highland, smoothstep(0.45,0.65,elev));

        // Ice caps
        float lat = abs(vUV.y - 0.5) * 2.0; // 0 at equator, 1 at poles
        float ice = smoothstep(0.78, 0.92, lat + noise(uv*8.0)*0.1);
        landColor = mix(landColor, vec3(0.88,0.92,0.96), ice);
        ocean = mix(ocean, vec3(0.80,0.88,0.94), ice);

        vec3 surface = mix(ocean, landColor, land);

        // ── Lighting ──
        vec3 lightDir = normalize(vec3(1.2, 0.8, 1.0)); // sun direction
        float diff = max(dot(vNorm, lightDir), 0.0);
        float ambient = 0.12;
        vec3 lit = surface * (ambient + diff * 0.88);

        // Ocean specular
        vec3 viewDir = normalize(vec3(0,0,1));
        vec3 halfV = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNorm, halfV),0.0), 64.0) * (1.0 - land) * 0.6;
        lit += vec3(0.7,0.85,1.0) * spec;

        // ── Atmosphere rim — Wazelo amber ──
        float rim = 1.0 - max(dot(vNorm, viewDir), 0.0);
        rim = pow(rim, 3.5);
        vec3 atmo = vec3(1.0, 0.72, 0.49) * rim * 1.2; // #ffb77d amber
        lit += atmo;

        // Night side city-lights twinkle (subtle)
        float night = smoothstep(0.1, -0.2, diff);
        float city = fbm(uv*18.0) * land;
        lit += vec3(1.0,0.85,0.5) * city * night * 0.4;

        gl_FragColor = vec4(lit, 1.0);
      }
    `;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(vertSrc, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(fragSrc, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // ── Sphere geometry (lat/lon grid) ──────────────────────────────────────
    const SLICES = 64, STACKS = 64;
    const positions: number[] = [], uvs: number[] = [], normals: number[] = [], indices: number[] = [];

    for (let i = 0; i <= STACKS; i++) {
      const phi = (i / STACKS) * Math.PI;
      for (let j = 0; j <= SLICES; j++) {
        const theta = (j / SLICES) * 2 * Math.PI;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        positions.push(x, y, z);
        normals.push(x, y, z);
        uvs.push(j / SLICES, i / STACKS);
      }
    }
    for (let i = 0; i < STACKS; i++) {
      for (let j = 0; j < SLICES; j++) {
        const a = i * (SLICES + 1) + j;
        const b = a + SLICES + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const mkBuf = (data: Float32Array, type: number) => {
      const buf = gl.createBuffer()!;
      gl.bindBuffer(type, buf);
      gl.bufferData(type, data, gl.STATIC_DRAW);
      return buf;
    };
    const posBuf = mkBuf(new Float32Array(positions), gl.ARRAY_BUFFER);
    const uvBuf = mkBuf(new Float32Array(uvs), gl.ARRAY_BUFFER);
    const normBuf = mkBuf(new Float32Array(normals), gl.ARRAY_BUFFER);
    const idxBuf = mkBuf(new Uint16Array(indices) as unknown as Float32Array, gl.ELEMENT_ARRAY_BUFFER);

    const bindAttr = (buf: WebGLBuffer, name: string, size: number) => {
      const loc = gl.getAttribLocation(prog, name);
      if (loc < 0) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    // ── Matrix helpers ────────────────────────────────────────────────────────
    const perspective = (fov: number, aspect: number, near: number, far: number) => {
      const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
      return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);
    };
    const rotY = (a: number) => new Float32Array([Math.cos(a),0,Math.sin(a),0, 0,1,0,0, -Math.sin(a),0,Math.cos(a),0, 0,0,0,1]);
    const mulMat4 = (a: Float32Array, b: Float32Array) => {
      const out = new Float32Array(16);
      for (let i=0;i<4;i++) for (let j=0;j<4;j++) for (let k=0;k<4;k++) out[i*4+j]+=a[i*4+k]*b[k*4+j];
      return out;
    };
    const translate = (x: number, y: number, z: number) => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);

    const uMVP = gl.getUniformLocation(prog, "uMVP");
    const uNM = gl.getUniformLocation(prog, "uNormMat");
    const uTime = gl.getUniformLocation(prog, "uTime");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    let animId: number;
    const t0 = performance.now();

    const render = () => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const t = (performance.now() - t0) / 1000;
      const aspect = canvas.width / canvas.height;
      const proj = perspective(0.7, aspect, 0.1, 100);
      const model = mulMat4(translate(0, 0, -2.6), rotY(t * 0.25));
      const mvp = mulMat4(proj, model);

      gl.uniformMatrix4fv(uMVP, false, mvp);
      // Normal matrix (simplified — just rotation part, no non-uniform scale)
      gl.uniformMatrix3fv(uNM, false, new Float32Array([
        model[0],model[1],model[2],
        model[4],model[5],model[6],
        model[8],model[9],model[10],
      ]));
      gl.uniform1f(uTime, t);

      bindAttr(posBuf, "aPos", 3);
      bindAttr(uvBuf, "aUV", 2);
      bindAttr(normBuf, "aNorm", 3);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", borderRadius: "50%" }}
    />
  );
};

// ─── DashBar — animated bar for analytics chart ──────────────────────────────
const DashBar: React.FC<{ pct: number }> = ({ pct }) => {
  const [h, setH] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setH(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{
      width: "100%",
      height: `${h}%`,
      background: "linear-gradient(to top, #d97707, #ffb77d)",
      borderRadius: "4px 4px 0 0",
      transition: "height 0.8s ease",
    }} />
  );
};

// ─── Hero Section ─────────────────────────────────────────────────────────────
export const HeroSection: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const navLinks: [string, string][] = [
    ["Features", "#features"],
    ["Use Cases", "/use-cases"],
    ["Pricing", "#pricing"],
    ["About", "/about"],
  ];

  const fade = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
    }),
  };

  return (
    <div style={{ position: "relative", width: "100%", background: "#131313", color: "#fff", fontFamily: "'Inter',sans-serif" }}>

      {/* ── Background layer ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        {/* Amber glow orb behind planet */}
        <div style={{
          position: "absolute", bottom: "-20%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,119,6,0.28) 0%, transparent 70%)",
          filter: "blur(50px)",
        }} />
        {/* Lightning canvas — full bleed, amber hue ~35 */}
        <div style={{ position: "absolute", inset: 0 }}>
          {mounted && <Lightning hue={35} speed={1.5} intensity={0.7} size={2.2} />}
        </div>
        {/* Earth Globe */}
        <div className="wz-globe" style={{
          position: "absolute", bottom: "-30%", left: "50%", transform: "translateX(-50%)",
          width: 620, height: 620, borderRadius: "50%",
          overflow: "hidden", zIndex: 2,
        }}>
          {mounted && <EarthGlobe />}
        </div>
        {/* Soft overlay for text contrast */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(19,19,19,0.6) 0%, rgba(19,19,19,0.15) 50%, rgba(19,19,19,0.65) 100%)", zIndex: 3 }} />
      </div>

      {/* ── Content layer ── */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh", paddingBottom: 60 }}>

        {/* Navbar */}
        <div style={{ padding: "20px 32px 0", display: "flex", justifyContent: "center" }}>
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "flex", alignItems: "center", gap: 0,
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 100, padding: "8px 12px 8px 20px",
              width: "100%", maxWidth: 780,
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>
              Wazelo <span style={{ color: "#ffb77d" }}>CRM</span>
            </span>

            {/* Desktop nav links */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="wz-hidden-mobile">
              {navLinks.map(([label, href]) => (
                <a key={label} href={href} style={{
                  fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)",
                  textDecoration: "none", padding: "6px 14px", borderRadius: 100,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                >{label}</a>
              ))}
            </div>

            {/* CTA group */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <a href={APP_LOGIN_URL} style={{
                fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)",
                textDecoration: "none", padding: "6px 14px", borderRadius: 100,
              }} className="wz-show-desktop">Sign In</a>
              <a href={APP_REGISTER_URL} style={{
                fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 100,
                background: "#fff", color: "#111", textDecoration: "none",
                whiteSpace: "nowrap",
              }} className="wz-nav-cta">Get Started Free</a>
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 4 }}
                className="wz-show-mobile"
                aria-label="Menu"
              >
                {[0,1,2].map(i => (
                  <span key={i} style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2,
                    transform: menuOpen ? (i===0 ? "rotate(45deg) translate(4px,4px)" : i===2 ? "rotate(-45deg) translate(4px,-4px)" : "scaleX(0)") : "none",
                    transition: "all 0.25s ease",
                  }} />
                ))}
              </button>
            </div>
          </motion.nav>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.96)", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}
            >
              <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 24 }}>✕</button>
              {navLinks.map(([l, h]) => <a key={l} href={h} onClick={() => setMenuOpen(false)} style={{ fontSize: 20, color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>{l}</a>)}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <a href={APP_LOGIN_URL} style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", color: "#ddd", textDecoration: "none", fontSize: 14 }}>Sign In</a>
                <a href={APP_REGISTER_URL} style={{ padding: "12px 24px", borderRadius: 8, background: "#fff", color: "#111", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>Get Started Free</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero body */}
        <div className="wz-hero-body" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "0 24px 0", position: "relative" }}>

          {/* ── Top text block ── */}
          <div className="wz-hero-text" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 680, position: "relative", zIndex: 2, width: "100%", paddingTop: 20, paddingBottom: 8 }}>

            {/* Badge */}
            <motion.a
              href={APP_REGISTER_URL}
              custom={0} variants={fade} initial="hidden" animate="show"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px", borderRadius: 100, marginBottom: 20,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)", textDecoration: "none",
                fontSize: "clamp(11px, 3vw, 13px)", color: "rgba(255,255,255,0.85)",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ffb77d", display: "inline-block", flexShrink: 0 }} />
              Official WhatsApp Business API
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3L13 8L8 13M13 8H3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.a>

            <motion.h1
              custom={1} variants={fade} initial="hidden" animate="show"
              style={{ fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 10px", color: "#fff" }}
            >
              Wazelo CRM
            </motion.h1>

            <motion.h2
              custom={2} variants={fade} initial="hidden" animate="show"
              style={{ fontSize: "clamp(18px, 4.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.03em", margin: "0 0 18px",
                background: "linear-gradient(135deg, #e0e0e0, #888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              WhatsApp for Growing Teams
            </motion.h2>

            <motion.p
              custom={3} variants={fade} initial="hidden" animate="show"
              style={{ fontSize: "clamp(13px, 3vw, 15px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 480 }}
            >
              Shared inbox, bulk campaigns, automation &amp; AI chatbot — all on the official WhatsApp Business API. From ₹499/mo.
            </motion.p>

            {/* CTAs */}
            <motion.div custom={4} variants={fade} initial="hidden" animate="show" className="wz-cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 12, width: "100%" }}>
              <a href={APP_REGISTER_URL} style={{
                padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14,
                background: "linear-gradient(135deg, #ffb77d, #d97707)",
                color: "#4d2600", textDecoration: "none",
                boxShadow: "0 0 40px rgba(255,183,125,0.25)",
              }}>Start Free Trial</a>
              <a href="/contact#demo" style={{
                padding: "12px 28px", borderRadius: 8, fontWeight: 500, fontSize: 14,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", textDecoration: "none", backdropFilter: "blur(8px)",
              }}>Book a Demo</a>
            </motion.div>

         
          </div>

          {/* ── Analytics Dashboard Mockup ── */}
          <motion.div
            custom={6} variants={fade} initial="hidden" animate="show"
            className="wz-mockup"
            style={{
              width: "calc(100% + 48px)", maxWidth: 1200,
              marginLeft: -24, marginRight: -24,
              borderRadius: 20,
              boxShadow: "0 0 0 1px rgba(255,183,125,0.1), 0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(217,119,6,0.1)",
              overflow: "hidden",
              position: "relative", zIndex: 5,
              flexShrink: 0,
              background: "#131313",
            }}
          >
            {/* Chrome bar */}
            <div style={{ background: "#0e0e0e", height: 38, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
              <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "3px 20px", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter',sans-serif" }}>
                  app.wazelo.in/analytics
                </div>
              </div>
            </div>

            {/* App shell — sidebar + main */}
            <div style={{ display: "flex", height: 520 }}>

              {/* Sidebar nav */}
              <div className="wz-sidebar" style={{ width: 200, flexShrink: 0, background: "#0b0b0b", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", padding: "16px 0" }}>
                <div style={{ padding: "0 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", fontFamily: "'Inter',sans-serif" }}>Wazelo <span style={{ color: "#ffb77d" }}>CRM</span></span>
                </div>
                {[
                  { icon: "💬", label: "Inbox",      active: false },
                  { icon: "📊", label: "Analytics",  active: true  },
                  { icon: "👥", label: "Contacts",   active: false },
                  { icon: "📢", label: "Campaigns",  active: false },
                  { icon: "⚡", label: "Automation", active: false },
                  { icon: "⚙️", label: "Settings",   active: false },
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 16px", margin: "1px 8px", borderRadius: 8,
                    background: item.active ? "rgba(255,183,125,0.12)" : "transparent",
                    borderLeft: item.active ? "2px solid #ffb77d" : "2px solid transparent",
                    cursor: "pointer",
                  }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: item.active ? 600 : 400, color: item.active ? "#ffb77d" : "rgba(229,226,225,0.45)", fontFamily: "'Inter',sans-serif" }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Page header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Inter',sans-serif" }}>Analytics</div>
                    <div style={{ fontSize: 11, color: "rgba(219,194,176,0.45)", fontFamily: "'Inter',sans-serif", marginTop: 2 }}>Last 7 days · Updated just now</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["7D","30D","90D"].map((r, i) => (
                      <div key={r} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, background: i === 0 ? "rgba(255,183,125,0.15)" : "transparent", border: i === 0 ? "1px solid rgba(255,183,125,0.3)" : "1px solid rgba(255,255,255,0.08)", color: i === 0 ? "#ffb77d" : "rgba(229,226,225,0.45)", fontFamily: "'Inter',sans-serif", cursor: "pointer" }}>{r}</div>
                    ))}
                  </div>
                </div>

                {/* KPI cards — 4 cols, exact from AnalyticsMockup */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="wz-kpi-grid">
                  {[
                    { label: "Total Messages", value: "48,500", delta: "+12%", good: true },
                    { label: "Avg Response",   value: "4m 12s", delta: "-8%",  good: true },
                    { label: "CSAT Score",     value: "4.3/5",  delta: "+0.3", good: true },
                    { label: "Resolution Rate",value: "87%",    delta: "+5%",  good: true },
                  ].map(kpi => (
                    <div key={kpi.label} style={{ background: "#2a2a2a", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, color: "rgba(219,194,176,0.55)", marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>{kpi.label}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Inter',sans-serif" }}>{kpi.value}</span>
                        <span style={{ fontSize: 11, color: "#34d399", fontFamily: "'Inter',sans-serif" }}>{kpi.delta}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart + Leaderboard row — exact from AnalyticsMockup */}
                <div style={{ display: "grid", gridTemplateColumns: "60% 1fr", gap: 12 }} className="wz-chart-row">

                  {/* Bar chart */}
                  <div style={{ background: "#2a2a2a", borderRadius: 12, padding: "16px 16px 12px" }}>
                    <div style={{ fontSize: 12, color: "rgba(219,194,176,0.55)", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>Message Volume — Last 7 Days</div>
                    <div style={{ height: 130, display: "flex", alignItems: "flex-end", gap: 6 }}>
                      {[
                        { day: "Mon", h: 62 }, { day: "Tue", h: 88 }, { day: "Wed", h: 45 },
                        { day: "Thu", h: 91 }, { day: "Fri", h: 73 }, { day: "Sat", h: 58 }, { day: "Sun", h: 84 },
                      ].map(({ day, h }) => (
                        <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%" }}>
                          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                            <DashBar pct={h} />
                          </div>
                          <span style={{ fontSize: 9, color: "rgba(219,194,176,0.4)", fontFamily: "'Inter',sans-serif" }}>{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agent leaderboard */}
                  <div style={{ background: "#2a2a2a", borderRadius: 12, padding: "16px 16px 12px" }}>
                    <div style={{ fontSize: 12, color: "rgba(219,194,176,0.55)", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>Top Agents</div>
                    {[
                      { name: "Priya S.", convs: 142, time: "3m 40s", score: 4.8 },
                      { name: "Rahul K.", convs: 118, time: "5m 12s", score: 4.5 },
                      { name: "Meera J.", convs: 97,  time: "6m 05s", score: 4.1 },
                      { name: "Arjun T.", convs: 83,  time: "7m 22s", score: 3.9 },
                    ].map((agent, i) => (
                      <div key={agent.name} style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "9px 0" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,183,125,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#ffb77d", flexShrink: 0, fontFamily: "'Inter',sans-serif" }}>{i + 1}</div>
                        <span style={{ fontSize: 12, color: "#e5e2e1", flex: 1, fontFamily: "'Inter',sans-serif" }}>{agent.name}</span>
                        <span style={{ fontSize: 11, color: "rgba(219,194,176,0.45)", minWidth: 28, textAlign: "right", fontFamily: "'Inter',sans-serif" }}>{agent.convs}</span>
                        <span style={{ fontSize: 10, color: "rgba(219,194,176,0.35)", minWidth: 40, textAlign: "right", fontFamily: "'Inter',sans-serif" }}>{agent.time}</span>
                        <span style={{ fontSize: 11, color: "#ffb77d", minWidth: 30, textAlign: "right", fontFamily: "'Inter',sans-serif" }}>{agent.score} ★</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaign performance mini-table */}
                <div style={{ background: "#2a2a2a", borderRadius: 12, padding: "16px" }}>
                  <div style={{ fontSize: 12, color: "rgba(219,194,176,0.55)", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>Recent Campaigns</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: "8px 16px", alignItems: "center" }}>
                    {/* Header */}
                    {["Campaign", "Sent", "Delivered", "Read", "Replied"].map(h => (
                      <div key={h} style={{ fontSize: 10, color: "rgba(219,194,176,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Inter',sans-serif" }}>{h}</div>
                    ))}
                    {/* Rows */}
                    {[
                      { name: "Diwali Offer 🎆",   sent: "12,400", del: "12,180", read: "9,840",  rep: "1,240" },
                      { name: "Restock Alert",      sent: "8,200",  del: "8,050",  read: "6,100",  rep: "820"   },
                      { name: "Follow-up Drip #3",  sent: "5,600",  del: "5,530",  read: "4,200",  rep: "670"   },
                    ].map(row => (
                      <React.Fragment key={row.name}>
                        <div style={{ fontSize: 12, color: "#e5e2e1", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</div>
                        {[row.sent, row.del, row.read, row.rep].map((v, vi) => (
                          <div key={vi} style={{ fontSize: 12, color: vi === 3 ? "#ffb77d" : "rgba(219,194,176,0.6)", textAlign: "right", fontFamily: "'Inter',sans-serif" }}>{v}</div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .wz-hidden-mobile { display: none !important; }
          .wz-show-mobile { display: flex !important; }
          .wz-show-desktop { display: none !important; }
          .wz-nav-cta { display: none !important; }
          .wz-globe {
            width: min(420px, 110vw) !important;
            height: min(420px, 110vw) !important;
            bottom: -22% !important;
          }
          .wz-hero-body { padding: 0 0 !important; }
          .wz-hero-text { padding-top: 16px !important; padding-left: 16px !important; padding-right: 16px !important; }
          .wz-cta-row { flex-direction: column !important; width: 100% !important; }
          .wz-cta-row a { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
          .wz-mockup {
            border-radius: 16px !important;
            margin-bottom: 32px !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .wz-mockup > div:nth-child(2) { height: 360px !important; }
          .wz-sidebar { display: none !important; }
        }
        @media (min-width: 641px) {
          .wz-show-mobile { display: none !important; }
          .wz-show-desktop { display: flex !important; }
          .wz-nav-cta { display: inline-block !important; }
        }
      `}</style>
    </div>
  );
};
