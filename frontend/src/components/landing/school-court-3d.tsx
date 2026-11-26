'use client';

import { useEffect, useRef, useState } from 'react';

type Vec3 = readonly [number, number, number];

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
const REST_CAMERA = {
  yaw: -0.62,
  pitch: 0.24,
  zoom: 1.02,
} as const;

const HOVER_CAMERA = {
  zoom: 1.24,
  yawRange: 0.22,
  pitchRange: 0.09,
} as const;

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

  // 6 & 7. GEDUNG L DUA LANTAI dengan selasar (koridor) di depan ruang kelas.
  // Setiap lantai: lantai selasar, dinding kelas, pintu, jendela, pilar, dan railing lantai 2.
  type WingAxis = 'x' | 'z';
  type WingBay = {
    readonly a0: number;
    readonly a1: number;
    readonly details: boolean;
    readonly rail: boolean;
    readonly slabFront: boolean;
  };
  type WingSpec = {
    readonly along: WingAxis;
    readonly wallPlane: number;
    readonly hallEdge: number;
    readonly slabEdge: number;
    readonly pillarPlane: number;
    readonly railPlane: number;
    readonly bays: readonly WingBay[];
    readonly pillars: readonly number[];
  };

  const wp = (along: WingAxis, a: number, y: number, d: number): Vec3 =>
    along === 'x' ? [a, y, d] : [d, y, a];
  const vRect = (
    along: WingAxis,
    plane: number,
    a0: number,
    a1: number,
    y0: number,
    y1: number,
  ): Vec3[] => [
    wp(along, a0, y0, plane),
    wp(along, a1, y0, plane),
    wp(along, a1, y1, plane),
    wp(along, a0, y1, plane),
  ];
  const hRect = (
    along: WingAxis,
    a0: number,
    a1: number,
    d0: number,
    d1: number,
    y: number,
  ): Vec3[] => [
    wp(along, a0, y, d0),
    wp(along, a1, y, d0),
    wp(along, a1, y, d1),
    wp(along, a0, y, d1),
  ];

  function buildWing(spec: WingSpec) {
    const { along } = spec;
    const toward = Math.sign(spec.hallEdge - spec.wallPlane);
    const detailPlane = spec.wallPlane + toward * 0.02;

    for (const bay of spec.bays) {
      const { a0, a1 } = bay;
      const c = (a0 + a1) / 2;

      // Lantai selasar lantai 1 (keramik abu)
      faces.push({
        points: hRect(along, a0, a1, spec.wallPlane, spec.hallEdge, 0.06),
        fill: '#9C9E96',
        stroke: '#8B8D85',
        lineWidth: 0.6,
        groundOrder: 5,
      });
      // Dinding ruang kelas lantai 1 (lebih teduh) dan lantai 2
      faces.push({ points: vRect(along, spec.wallPlane, a0, a1, 0, 2.45), fill: '#B9AF92' });
      faces.push({ points: vRect(along, spec.wallPlane, a0, a1, 2.45, 4.5), fill: '#DCD4B8' });
      // Pelat lantai 2 = plafon selasar bawah sekaligus lantai selasar atas
      faces.push({
        points: hRect(along, a0, a1, spec.wallPlane, spec.slabEdge, 2.45),
        fill: '#A9ABA2',
        stroke: '#979990',
        lineWidth: 0.6,
      });
      if (bay.slabFront) {
        faces.push({ points: vRect(along, spec.slabEdge, a0, a1, 2.2, 2.45), fill: '#5E6560' });
      }

      if (bay.details) {
        for (const base of [0, 2.45]) {
          // Pintu kelas kayu
          faces.push({
            points: vRect(along, detailPlane, c - 0.68, c - 0.12, base + 0.06, base + 1.72),
            fill: '#7A5236',
            stroke: '#4A3324',
            lineWidth: 1.2,
            zBias: 0.4,
          });
          // Jendela kelas berbingkai terang
          faces.push({
            points: vRect(along, detailPlane, c, c + 0.8, base + 0.85, base + 1.6),
            fill: '#34454C',
            stroke: '#EFE8D4',
            lineWidth: 1.4,
            zBias: 0.4,
          });
          lines.push({
            a: wp(along, c + 0.4, base + 0.85, detailPlane),
            b: wp(along, c + 0.4, base + 1.6, detailPlane),
            color: '#EFE8D4',
            width: 1.2,
            zBias: 0.45,
          });
        }
      }

      if (bay.rail) {
        // Railing selasar lantai 2
        lines.push(
          {
            a: wp(along, a0, 3.4, spec.railPlane),
            b: wp(along, a1, 3.4, spec.railPlane),
            color: '#2F3532',
            width: 1.8,
            zBias: 0.65,
          },
          {
            a: wp(along, a0, 2.95, spec.railPlane),
            b: wp(along, a1, 2.95, spec.railPlane),
            color: '#2F3532',
            width: 1.1,
            zBias: 0.65,
          },
        );
        const n = Math.max(2, Math.round((a1 - a0) / 0.34));
        for (let k = 1; k < n; k++) {
          const a = a0 + ((a1 - a0) * k) / n;
          lines.push({
            a: wp(along, a, 2.45, spec.railPlane),
            b: wp(along, a, 3.4, spec.railPlane),
            color: '#3A413E',
            width: 0.9,
            zBias: 0.6,
          });
        }
      }
    }

    // Pilar selasar di tepi luar, dipisah per lantai agar tertutup pelat dengan benar
    for (const p of spec.pillars) {
      lines.push(
        {
          a: wp(along, p, 0, spec.pillarPlane),
          b: wp(along, p, 2.2, spec.pillarPlane),
          color: '#575E59',
          width: 4,
          zBias: 0.55,
        },
        {
          a: wp(along, p, 2.45, spec.pillarPlane),
          b: wp(along, p, 4.5, spec.pillarPlane),
          color: '#575E59',
          width: 4,
          zBias: 0.55,
        },
      );
    }
  }

  // Massa bangunan di belakang dinding kelas (tanpa sisi depan agar tidak menimpa detail)
  faces.push(
    ...makeBoxFaces(0.3, 0, -6.3, 12.6, 4.5, 1.2, {
      top: '#C7BE9E',
      front: '#DCD4B8',
      back: '#C4BBA0',
      left: '#CFC7AB',
      right: '#D5CDB1',
    }).filter((_, i) => i !== 1),
  );
  faces.push(
    ...makeBoxFaces(6.1, 0, -0.15, 1.2, 4.5, 11.1, {
      top: '#C7BE9E',
      front: '#E2DAC0',
      back: '#C4BBA0',
      left: '#DCD4B8',
      right: '#C4BBA0',
    }).filter((_, i) => i !== 3),
  );

  // Sayap kiri: dinding kelas di z = -5.7, selasar menghadap lapangan (+z)
  const leftBay = (a0: number, a1: number): WingBay => ({
    a0,
    a1,
    details: true,
    rail: true,
    slabFront: true,
  });
  buildWing({
    along: 'x',
    wallPlane: -5.7,
    hallEdge: -4.7,
    slabEdge: -4.5,
    pillarPlane: -4.75,
    railPlane: -4.6,
    bays: [
      leftBay(-6.0, -4.3),
      leftBay(-4.3, -2.6),
      leftBay(-2.6, -0.9),
      leftBay(-0.9, 0.8),
      leftBay(0.8, 2.5),
      leftBay(2.5, 4.5),
      { a0: 4.5, a1: 5.5, details: false, rail: false, slabFront: false },
    ],
    pillars: [-5.95, -4.3, -2.6, -0.9, 0.8, 2.5, 4.5],
  });

  // Sayap kanan: dinding kelas di x = 5.5, selasar menghadap lapangan (-x)
  const rightBay = (a0: number, a1: number): WingBay => ({
    a0,
    a1,
    details: true,
    rail: true,
    slabFront: true,
  });
  buildWing({
    along: 'z',
    wallPlane: 5.5,
    hallEdge: 4.5,
    slabEdge: 4.3,
    pillarPlane: 4.55,
    railPlane: 4.6,
    bays: [
      { a0: -5.7, a1: -4.7, details: false, rail: false, slabFront: false },
      rightBay(-4.7, -2.7),
      rightBay(-2.7, -0.7),
      rightBay(-0.7, 1.3),
      rightBay(1.3, 3.3),
      rightBay(3.3, 5.4),
    ],
    pillars: [-2.7, -0.7, 1.3, 3.3, 5.35],
  });

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
  lines.push({
    a: [-1.72, 2.32, -4.18],
    b: [-1.38, 2.32, -4.18],
    color: '#E88A2E',
    width: 2.2,
    zBias: 0.14,
  });

  // 10. Tiang bendera tinggi di depan sayap kanan dekat papan nama (sesuai foto)
  lines.push({
    a: [4.05, 0, -0.45],
    b: [4.05, 5.4, -0.45],
    color: '#E5E1D8',
    width: 2.1,
    zBias: 0.15,
  });

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
 * dilengkapi papan nama "SMK TIARA NUSA" dengan interaksi hover zoom-in halus.
 */
export function SchoolCourt3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const cameraRef = useRef<{
    yaw: number;
    pitch: number;
    zoom: number;
    targetYaw: number;
    targetPitch: number;
    targetZoom: number;
    hovered: boolean;
  }>({
    yaw: REST_CAMERA.yaw,
    pitch: REST_CAMERA.pitch,
    zoom: REST_CAMERA.zoom,
    targetYaw: REST_CAMERA.yaw,
    targetPitch: REST_CAMERA.pitch,
    targetZoom: REST_CAMERA.zoom,
    hovered: false,
  });

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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      if (!cam.hovered && !prefersReducedMotion) {
        sway += 0.008;
        cam.targetYaw = REST_CAMERA.yaw + Math.sin(sway) * 0.04;
        cam.targetPitch = REST_CAMERA.pitch + Math.cos(sway * 0.7) * 0.012;
        cam.targetZoom = REST_CAMERA.zoom;
      }

      const ease = prefersReducedMotion ? 1 : 0.075;
      cam.yaw += (cam.targetYaw - cam.yaw) * ease;
      cam.pitch += (cam.targetPitch - cam.pitch) * ease;
      cam.zoom += (cam.targetZoom - cam.zoom) * ease;

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
      const tr = projectPoint(
        scene.signboard.topRight,
        cam.yaw,
        cam.pitch,
        width,
        height,
        cam.zoom,
      );
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

  function handlePointerEnter() {
    cameraRef.current.hovered = true;
    cameraRef.current.targetZoom = HOVER_CAMERA.zoom;
    setIsHovered(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const cam = cameraRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    // Posisi kursor ternormalisasi [-1, 1] untuk paralaks kamera halus
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    cam.hovered = true;
    cam.targetYaw = REST_CAMERA.yaw - nx * HOVER_CAMERA.yawRange;
    cam.targetPitch = Math.max(
      0.14,
      Math.min(0.42, REST_CAMERA.pitch + ny * HOVER_CAMERA.pitchRange),
    );
    cam.targetZoom = HOVER_CAMERA.zoom;
  }

  function handlePointerLeave() {
    const cam = cameraRef.current;
    cam.hovered = false;
    cam.targetYaw = REST_CAMERA.yaw;
    cam.targetPitch = REST_CAMERA.pitch;
    cam.targetZoom = REST_CAMERA.zoom;
    setIsHovered(false);
  }

  return (
    <div
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-surface select-none"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Model 3D sudut gedung dan lapangan SMK Tiara Nusa dengan papan nama SMK TIARA NUSA"
        className="h-full w-full"
      />

      {/* Vignette halus di bagian bawah agar label menyatu elegan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy/25 via-navy/5 to-transparent"
      />

      <div className="pointer-events-none absolute bottom-3.5 left-3.5 flex items-center gap-2 rounded-full border border-surface/60 bg-surface/85 px-3.5 py-1.5 text-[11px] font-semibold text-navy shadow-xs backdrop-blur-sm transition-all duration-500">
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full transition-colors duration-300 ${
            isHovered ? 'bg-orange' : 'bg-navy/50'
          }`}
        />
        <span>SMK Tiara Nusa One &bull; Kampus Terpadu</span>
      </div>
    </div>
  );
}
