'use client';

import { useEffect, useRef, useState } from 'react';

type Vec3 = readonly [number, number, number];
type CameraPreset = 'corner' | 'sign' | 'top';

type Face = {
  readonly points: readonly Vec3[];
  readonly fill: string;
  readonly stroke?: string;
  readonly lineWidth?: number;
  readonly groundOrder?: number;
  readonly zBias?: number;
};

type LineSeg = {
  readonly a: Vec3;
  readonly b: Vec3;
  readonly color: string;
  readonly width: number;
  readonly groundOrder?: number;
  readonly zBias?: number;
};

type Signboard3D = {
  readonly topLeft: Vec3;
  readonly topRight: Vec3;
  readonly bottomRight: Vec3;
  readonly bottomLeft: Vec3;
  readonly text: string;
};

/**
 * Sudut kamera baku mengikuti foto sudut L lapangan & gedung SMK Tiara Nusa.
 */
const PRESETS: Readonly<
  Record<CameraPreset, { yaw: number; pitch: number; zoom: number; label: string }>
> = {
  corner: { yaw: -0.62, pitch: 0.24, zoom: 1.04, label: 'Sudut Utama' },
  sign: { yaw: -0.82, pitch: 0.14, zoom: 1.25, label: 'Papan Nama' },
  top: { yaw: -0.58, pitch: 0.74, zoom: 0.96, label: 'Tampak Atas' },
};

function makeBoxFaces(
  cx: number,
  cy: number,
  cz: number,
  w: number,
  h: number,
  d: number,
  colors: { top: string; front: string; back?: string; left: string; right: string },
  options?: { groundOrder?: number; zBias?: number },
): Face[] {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const y0 = cy;
  const y1 = cy + h;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  const meta = {
    ...(options?.groundOrder !== undefined ? { groundOrder: options.groundOrder } : {}),
    ...(options?.zBias !== undefined ? { zBias: options.zBias } : {}),
  };

  return [
    {
      points: [
        [x0, y1, z0],
        [x1, y1, z0],
        [x1, y1, z1],
        [x0, y1, z1],
      ],
      fill: colors.top,
      ...meta,
    },
    {
      points: [
        [x0, y0, z1],
        [x1, y0, z1],
        [x1, y1, z1],
        [x0, y1, z1],
      ],
      fill: colors.front,
      ...meta,
    },
    {
      points: [
        [x1, y0, z0],
        [x0, y0, z0],
        [x0, y1, z0],
        [x1, y1, z0],
      ],
      fill: colors.back ?? colors.front,
      ...meta,
    },
    {
      points: [
        [x0, y0, z0],
        [x0, y0, z1],
        [x0, y1, z1],
        [x0, y1, z0],
      ],
      fill: colors.left,
      ...meta,
    },
    {
      points: [
        [x1, y0, z1],
        [x1, y0, z0],
        [x1, y1, z0],
        [x1, y1, z1],
      ],
      fill: colors.right,
      ...meta,
    },
  ];
}

function buildCornerScene(): { faces: Face[]; lines: LineSeg[]; signboard: Signboard3D } {
  const faces: Face[] = [];
  const lines: LineSeg[] = [];

  // 1. Dasar teras merah bata lapangan (groundOrder 1)
  faces.push(
    ...makeBoxFaces(
      -0.2,
      -0.4,
      0.2,
      11.6,
      0.4,
      10.8,
      {
        top: '#A9463E',
        front: '#82342D',
        back: '#762E28',
        left: '#762E28',
        right: '#8F3A33',
      },
      { groundOrder: 1 },
    ),
  );

  // 2. Permukaan lapangan hijau (groundOrder 2)
  faces.push({
    points: [
      [-5.3, 0.02, -4.4],
      [4.5, 0.02, -4.4],
      [4.5, 0.02, 4.8],
      [-5.3, 0.02, 4.8],
    ],
    fill: '#397B58',
    stroke: '#F2EFE6',
    lineWidth: 1.4,
    groundOrder: 2,
  });

  // 3. Garis lapangan putih: garis tengah + busur 3 poin di depan sayap kiri (groundOrder 3)
  lines.push({
    a: [-5.3, 0.04, 1.3],
    b: [4.5, 0.04, 1.3],
    color: '#FFFDF8',
    width: 1.6,
    groundOrder: 3,
  });
  for (let i = 0; i < 18; i++) {
    const a0 = (i / 18) * Math.PI;
    const a1 = ((i + 1) / 18) * Math.PI;
    lines.push({
      a: [-0.8 + Math.cos(a0) * 2.7, 0.04, -4.4 + Math.sin(a0) * 2.2],
      b: [-0.8 + Math.cos(a1) * 2.7, 0.04, -4.4 + Math.sin(a1) * 2.2],
      color: '#FFFDF8',
      width: 1.5,
      groundOrder: 3,
    });
  }

  // 4. Lingkaran tengah merah berpinggir putih (groundOrder 4)
  const circlePts: Vec3[] = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    circlePts.push([-0.6 + Math.cos(a) * 0.95, 0.04, 1.3 + Math.sin(a) * 0.95]);
  }
  faces.push({
    points: circlePts,
    fill: '#B64F4A',
    stroke: '#FFFDF8',
    lineWidth: 1.8,
    groundOrder: 4,
  });

  // 5. Pepohonan tinggi rindang di belakang atap gedung (sesuai foto)
  const backTrees: Array<{ x: number; z: number; h: number; w: number }> = [
    { x: -3.2, z: -7.8, h: 6.2, w: 2.3 },
    { x: -0.4, z: -8.0, h: 7.0, w: 2.6 },
    { x: 2.6, z: -8.1, h: 7.5, w: 2.8 },
    { x: 5.8, z: -7.8, h: 7.8, w: 2.9 },
    { x: 7.8, z: -5.2, h: 7.6, w: 2.7 },
    { x: 8.0, z: -2.0, h: 7.2, w: 2.6 },
    { x: 7.9, z: 1.4, h: 6.8, w: 2.5 },
  ];
  for (const t of backTrees) {
    faces.push(
      ...makeBoxFaces(t.x, 4.4, t.z, t.w, t.h - 4.2, t.w, {
        top: '#5C7B52',
        front: '#496743',
        back: '#3D5738',
        left: '#3F5B3A',
        right: '#52724B',
      }),
    );
    faces.push(
      ...makeBoxFaces(t.x, t.h - 0.3, t.z, t.w * 0.85, 1.1, t.w * 0.85, {
        top: '#719166',
        front: '#5B7C52',
        left: '#4D6B46',
        right: '#65875B',
      }),
    );
  }

  // 6. GEDUNG SAYAP KIRI (sepanjang z = -5.8, dari x = -6.0 sampai x = 6.4)
  // Lantai 1 koridor gelap
  faces.push(
    ...makeBoxFaces(0.2, 0, -5.8, 12.4, 2.2, 2.2, {
      top: '#4A504B',
      front: '#323833',
      back: '#2A2F2B',
      left: '#2D322E',
      right: '#383E39',
    }),
  );
  // Pelat lantai 2
  faces.push(
    ...makeBoxFaces(0.2, 2.2, -5.7, 12.6, 0.25, 2.4, {
      top: '#646B65',
      front: '#474F4A',
      left: '#3E4540',
      right: '#4F5752',
    }),
  );
  // Lantai 2 dinding krem hangat
  faces.push(
    ...makeBoxFaces(0.2, 2.45, -5.8, 12.4, 2.05, 2.1, {
      top: '#C7BE9E',
      front: '#DCD4B8',
      back: '#C4BBA0',
      left: '#CFC7AB',
      right: '#D5CDB1',
    }),
  );
  // Atap genteng abu gelap miring (sayap kiri)
  faces.push(
    ...makeBoxFaces(0.2, 4.5, -5.85, 12.8, 0.55, 2.75, {
      top: '#5C6461',
      front: '#454C49',
      back: '#3D4340',
      left: '#3E4542',
      right: '#4C5451',
    }),
  );
  faces.push(
    ...makeBoxFaces(0.2, 5.05, -6.15, 12.4, 0.45, 1.8, {
      top: '#69726E',
      front: '#505855',
      left: '#49504D',
      right: '#565F5C',
    }),
  );

  // Jendela & pilar lantai 2 sayap kiri
  for (const wx of [-4.6, -2.7, -0.8, 1.1, 3.0]) {
    faces.push({
      points: [
        [wx - 0.58, 2.9, -4.72],
        [wx + 0.58, 2.9, -4.72],
        [wx + 0.58, 4.05, -4.72],
        [wx - 0.58, 4.05, -4.72],
      ],
      fill: '#232826',
      stroke: '#3A413E',
      lineWidth: 1,
      zBias: 0.05,
    });
    // Pilar abu gelap
    lines.push({ a: [wx + 0.92, 0, -4.68], b: [wx + 0.92, 4.5, -4.68], color: '#474D49', width: 3.2, zBias: 0.08 });
  }
  // Railing balkon sayap kiri
  lines.push(
    { a: [-5.8, 3.02, -4.62], b: [4.6, 3.02, -4.62], color: '#2F3532', width: 1.8, zBias: 0.1 },
    { a: [-5.8, 2.65, -4.62], b: [4.6, 2.65, -4.62], color: '#2F3532', width: 1.1, zBias: 0.1 },
  );

  // 7. GEDUNG SAYAP KANAN (sepanjang x = 5.6, dari z = -4.7 sampai z = 5.4)
  // Lantai 1 koridor gelap
  faces.push(
    ...makeBoxFaces(5.6, 0, 0.35, 2.2, 2.2, 10.1, {
      top: '#4A504B',
      front: '#383E39',
      left: '#353B36',
      right: '#2B302C',
    }),
  );
  // Pelat lantai 2
  faces.push(
    ...makeBoxFaces(5.5, 2.2, 0.35, 2.4, 0.25, 10.2, {
      top: '#646B65',
      front: '#4D5550',
      left: '#4A524D',
      right: '#3E4540',
    }),
  );
  // Lantai 2 dinding krem hangat
  faces.push(
    ...makeBoxFaces(5.6, 2.45, 0.35, 2.1, 2.05, 10.1, {
      top: '#C7BE9E',
      front: '#D5CDB1',
      left: '#E2DAC0',
      right: '#C4BBA0',
    }),
  );
  // Atap genteng abu gelap miring (sayap kanan)
  faces.push(
    ...makeBoxFaces(5.65, 4.5, 0.35, 2.75, 0.55, 10.5, {
      top: '#5C6461',
      front: '#4C5451',
      left: '#48504D',
      right: '#3E4542',
    }),
  );
  faces.push(
    ...makeBoxFaces(5.95, 5.05, 0.35, 1.8, 0.45, 10.1, {
      top: '#69726E',
      front: '#565F5C',
      left: '#525B58',
      right: '#464E4B',
    }),
  );

  // Jendela & pilar lantai 2 sayap kanan (menghadap lapangan ke arah -x)
  for (const wz of [-3.2, -1.2, 0.8, 2.8, 4.3]) {
    faces.push({
      points: [
        [4.52, 2.9, wz - 0.62],
        [4.52, 2.9, wz + 0.62],
        [4.52, 4.05, wz + 0.62],
        [4.52, 4.05, wz - 0.62],
      ],
      fill: '#232826',
      stroke: '#3A413E',
      lineWidth: 1,
      zBias: 0.05,
    });
    lines.push({ a: [4.48, 0, wz + 0.96], b: [4.48, 4.5, wz + 0.96], color: '#474D49', width: 3.2, zBias: 0.08 });
  }
  // Railing balkon sayap kanan
  lines.push(
    { a: [4.42, 3.02, -4.6], b: [4.42, 3.02, 5.1], color: '#2F3532', width: 1.8, zBias: 0.1 },
    { a: [4.42, 2.65, -4.6], b: [4.42, 2.65, 5.1], color: '#2F3532', width: 1.1, zBias: 0.1 },
  );

  // 8. PAPAN NAMA 3D "SMK TIARA NUSA" di fasad atas sayap kanan dekat sudut L (persis foto)
  const signboard: Signboard3D = {
    topLeft: [4.34, 4.55, -4.35],
    topRight: [4.34, 4.55, -0.85],
    bottomRight: [4.34, 3.88, -0.85],
    bottomLeft: [4.34, 3.88, -4.35],
    text: 'SMK TIARA NUSA',
  };

  // 9. Papan basket hijau berbingkai putih & gawang futsal putih di depan sayap kiri (sesuai foto)
  lines.push(
    { a: [-1.55, 0.02, -4.45], b: [-1.55, 2.35, -4.45], color: '#49524F', width: 2.2 },
    // Gawang futsal putih
    { a: [0.3, 0.02, -4.35], b: [0.3, 1.35, -4.35], color: '#FFFDF8', width: 2.2 },
    { a: [2.1, 0.02, -4.35], b: [2.1, 1.35, -4.35], color: '#FFFDF8', width: 2.2 },
    { a: [0.3, 1.35, -4.35], b: [2.1, 1.35, -4.35], color: '#FFFDF8', width: 2.2 },
  );
  // Papan basket hijau
  faces.push({
    points: [
      [-2.15, 2.15, -4.4],
      [-0.95, 2.15, -4.4],
      [-0.95, 2.95, -4.4],
      [-2.15, 2.95, -4.4],
    ],
    fill: '#1E5A3E',
    stroke: '#FFFDF8',
    lineWidth: 2,
    zBias: 0.12,
  });
  // Ring basket
  lines.push({ a: [-1.72, 2.32, -4.18], b: [-1.38, 2.32, -4.18], color: '#E88A2E', width: 2.2, zBias: 0.14 });

  // 10. Tiang bendera tinggi di depan sayap kanan dekat papan nama (sesuai foto)
  lines.push({ a: [4.05, 0, -0.45], b: [4.05, 5.4, -0.45], color: '#E5E1D8', width: 2.1, zBias: 0.15 });

  return { faces, lines, signboard };
}

function projectPoint(
  point: Vec3,
  yaw: number,
  pitch: number,
  width: number,
  height: number,
  zoom: number,
): { x: number; y: number; depth: number } {
  const [px, py, pz] = point;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  const rx = px * cy - pz * sy;
  const rz1 = px * sy + pz * cy;

  const ry = py * cp - rz1 * sp;
  const rz = py * sp + rz1 * cp;

  const cameraDist = 17.5;
  const focal = Math.min(width, height) * 1.18 * zoom;
  const scale = focal / (cameraDist - rz);

  return {
    x: width * 0.5 + rx * scale,
    y: height * 0.63 - ry * scale,
    depth: rz,
  };
}

/**
 * Model 3D ringan sudut gedung L & lapangan SMK Tiara Nusa
 * dilengkapi papan nama "SMK TIARA NUSA" yang ikut berputar dalam 3D.
 */
export function SchoolCourt3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preset, setPreset] = useState<CameraPreset>('corner');
  const [autoRotate, setAutoRotate] = useState(false);

  const cameraRef = useRef({
    yaw: PRESETS.corner.yaw,
    pitch: PRESETS.corner.pitch,
    zoom: PRESETS.corner.zoom,
    targetYaw: PRESETS.corner.yaw,
    targetPitch: PRESETS.corner.pitch,
    targetZoom: PRESETS.corner.zoom,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let rafId = 0;
    let sway = 0;
    const scene = buildCornerScene();

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    function draw() {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const cam = cameraRef.current;
      if (autoRotateRef.current && !cam.dragging) {
        sway += 0.012;
        cam.targetYaw = PRESETS.corner.yaw + Math.sin(sway) * 0.24;
      }
      cam.yaw += (cam.targetYaw - cam.yaw) * 0.1;
      cam.pitch += (cam.targetPitch - cam.pitch) * 0.1;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;

      // Langit cerah berawan lembut selaras palet design.md
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, '#B5D0EA');
      bg.addColorStop(0.42, '#EAF0F6');
      bg.addColorStop(1, '#F8F3E8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      type DrawItem =
        | {
            kind: 'face';
            groundOrder: number;
            depth: number;
            projected: Array<{ x: number; y: number }>;
            face: Face;
          }
        | {
            kind: 'line';
            groundOrder: number;
            depth: number;
            a: { x: number; y: number };
            b: { x: number; y: number };
            line: LineSeg;
          };

      const queue: DrawItem[] = [];

      for (const face of scene.faces) {
        const proj = face.points.map((pt) =>
          projectPoint(pt, cam.yaw, cam.pitch, width, height, cam.zoom),
        );
        const avgDepth =
          proj.reduce((sum, p) => sum + p.depth, 0) / proj.length + (face.zBias ?? 0);
        queue.push({
          kind: 'face',
          groundOrder: face.groundOrder ?? 10,
          depth: avgDepth,
          projected: proj,
          face,
        });
      }

      for (const line of scene.lines) {
        const pa = projectPoint(line.a, cam.yaw, cam.pitch, width, height, cam.zoom);
        const pb = projectPoint(line.b, cam.yaw, cam.pitch, width, height, cam.zoom);
        queue.push({
          kind: 'line',
          groundOrder: line.groundOrder ?? 10,
          depth: (pa.depth + pb.depth) / 2 + (line.zBias ?? 0),
          a: pa,
          b: pb,
          line,
        });
      }

      queue.sort((a, b) => {
        if (a.groundOrder !== b.groundOrder) {
          return a.groundOrder - b.groundOrder;
        }
        return a.depth - b.depth;
      });

      for (const item of queue) {
        if (item.kind === 'face') {
          ctx.beginPath();
          item.projected.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.fillStyle = item.face.fill;
          ctx.fill();
          if (item.face.stroke) {
            ctx.strokeStyle = item.face.stroke;
            ctx.lineWidth = (item.face.lineWidth ?? 1) * dpr * 0.7;
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(item.a.x, item.a.y);
          ctx.lineTo(item.b.x, item.b.y);
          ctx.strokeStyle = item.line.color;
          ctx.lineWidth = item.line.width * dpr * 0.75;
          ctx.stroke();
        }
      }

      // Gambar papan nama 3D "SMK TIARA NUSA" sejajar dengan perspektif dinding sayap kanan
      const tl = projectPoint(scene.signboard.topLeft, cam.yaw, cam.pitch, width, height, cam.zoom);
      const tr = projectPoint(scene.signboard.topRight, cam.yaw, cam.pitch, width, height, cam.zoom);
      const br = projectPoint(
        scene.signboard.bottomRight,
        cam.yaw,
        cam.pitch,
        width,
        height,
        cam.zoom,
      );
      const bl = projectPoint(
        scene.signboard.bottomLeft,
        cam.yaw,
        cam.pitch,
        width,
        height,
        cam.zoom,
      );

      // Badan papan nama putih
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();
      ctx.fillStyle = '#FFFDF8';
      ctx.fill();
      ctx.strokeStyle = '#C8C1B4';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      // Teks "SMK TIARA NUSA" mengikuti kemiringan dan lebar papan nama 3D
      const cx = (tl.x + tr.x + br.x + bl.x) / 4;
      const cy = (tl.y + tr.y + br.y + bl.y) / 4;
      const dx = tr.x - tl.x;
      const dy = tr.y - tl.y;
      const boardWidth = Math.hypot(dx, dy);
      const boardHeight = Math.hypot(bl.x - tl.x, bl.y - tl.y);
      const angle = Math.atan2(dy, dx);

      if (boardWidth > 20) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        const fontSize = Math.max(8, Math.min(boardHeight * 0.56, boardWidth * 0.11));
        ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Emblem sekolah kecil di sisi kiri teks
        const emblemR = Math.max(2.5, fontSize * 0.34);
        ctx.beginPath();
        ctx.arc(-boardWidth * 0.39, 0, emblemR, 0, Math.PI * 2);
        ctx.fillStyle = '#123568';
        ctx.fill();

        ctx.fillStyle = '#9B2226';
        ctx.fillText(scene.signboard.text, boardWidth * 0.04, 0.5, boardWidth * 0.78);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  function applyPreset(next: CameraPreset) {
    setPreset(next);
    setAutoRotate(false);
    cameraRef.current.targetYaw = PRESETS[next].yaw;
    cameraRef.current.targetPitch = PRESETS[next].pitch;
    cameraRef.current.targetZoom = PRESETS[next].zoom;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="relative aspect-[16/10] w-full cursor-grab select-none active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Model 3D sudut gedung dan lapangan SMK Tiara Nusa dengan papan nama SMK TIARA NUSA"
          className="h-full w-full touch-none"
          onPointerDown={(event) => {
            const cam = cameraRef.current;
            cam.dragging = true;
            cam.lastX = event.clientX;
            cam.lastY = event.clientY;
            setAutoRotate(false);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const cam = cameraRef.current;
            if (!cam.dragging) return;
            const dx = event.clientX - cam.lastX;
            const dy = event.clientY - cam.lastY;
            cam.lastX = event.clientX;
            cam.lastY = event.clientY;
            // Batasi sudut agar tetap menghadap sudut dalam gedung L seperti foto
            cam.targetYaw = Math.max(-1.12, Math.min(-0.18, cam.targetYaw + dx * 0.006));
            cam.targetPitch = Math.max(0.1, Math.min(0.88, cam.targetPitch + dy * 0.005));
          }}
          onPointerUp={() => {
            cameraRef.current.dragging = false;
          }}
          onPointerCancel={() => {
            cameraRef.current.dragging = false;
          }}
        />

        <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-line bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-navy backdrop-blur-xs">
          Model 3D SMK Tiara Nusa · Geser untuk memutar
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface px-4 py-2.5">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PRESETS) as CameraPreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                preset === key && !autoRotate
                  ? 'border-navy bg-navy text-cream'
                  : 'border-line bg-cream text-ink hover:border-navy'
              }`}
            >
              {PRESETS[key].label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          aria-pressed={autoRotate}
          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
            autoRotate
              ? 'border-navy bg-blue/40 text-navy'
              : 'border-line bg-cream text-muted hover:text-ink'
          }`}
        >
          {autoRotate ? 'Gerak Halus: Aktif' : 'Gerak Halus: Jeda'}
        </button>
      </div>
    </div>
  );
}
