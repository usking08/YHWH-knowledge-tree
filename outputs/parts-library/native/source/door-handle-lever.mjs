// D11-P01 authored dimensions, mm. X length, Y outboard, Z up.
// The two generated reference images inform shape only; they are not metrology.
export function makeGT01DoorHandleLever(T) {
  const TAU = 2 * Math.PI, positions = [], normals = [];
  const V = p => new T.Vector3(...p);
  const snap = v => Math.abs(v) < 1e-12 ? 0 : v;
  function tri(a, b, c, na, nb = na, nc = na) {
    const cross = V(b).sub(V(a)).cross(V(c).sub(V(a)));
    if(cross.lengthSq()<1e-18)return;
    if (cross.dot(V(na).add(V(nb)).add(V(nc))) < 0) {
      [b, c] = [c, b]; [nb, nc] = [nc, nb];
    }
    positions.push(...a, ...b, ...c); normals.push(...na, ...nb, ...nc);
  }
  function quad(a, b, c, d, na, nb = na, nc = na, nd = na) {
    tri(a, b, c, na, nb, nc); tri(a, c, d, na, nc, nd);
  }
  function cap(outline, holes, map, normal) {
    const faces = T.ShapeUtils.triangulateShape(outline.map(p => new T.Vector2(...p)),
      holes.map(h => h.map(p => new T.Vector2(...p))));
    const points = [...outline, ...holes.flat()];
    for (const ids of faces) tri(...ids.map(i => map(points[i])), normal);
  }

  // Capsule perimeter has straight middle rails and genuine semicircular ends.
  // All perimeter rings share vertices, including the circular edge fillets.
  const capsuleArcSteps = 96, edgeSteps = 8, edgeRadius = 0.6;
  function capsule(radius) {
    const points = [], outward = [];
    for (const [cx, start] of [[58, -Math.PI / 2], [-58, Math.PI / 2]]) {
      for (let j = 0; j <= capsuleArcSteps; j++) {
        const a = start + Math.PI * j / capsuleArcSteps;
        const co = snap(Math.cos(a)), si = snap(Math.sin(a));
        points.push([cx + radius * co, radius * si]); outward.push([co, si]);
      }
    }
    return { points, outward };
  }
  const layers = [];
  for (let j = 0; j <= edgeSteps; j++) {
    const a = Math.PI * j / (2 * edgeSteps);
    layers.push({ y: -2.4 - edgeRadius * Math.cos(a), r: 10.4 + edgeRadius * Math.sin(a),
      radialNormal: Math.sin(a), yNormal: -Math.cos(a) });
  }
  layers.push({ y: -0.6, r: 11, radialNormal: 1, yNormal: 0 });
  for (let j = edgeSteps - 1; j >= 0; j--) {
    const a = Math.PI * j / (2 * edgeSteps);
    layers.push({ y: -0.6 + edgeRadius * Math.cos(a), r: 10.4 + edgeRadius * Math.sin(a),
      radialNormal: Math.sin(a), yNormal: Math.cos(a) });
  }
  const panelRings = layers.map(layer => {
    const outline = capsule(layer.r);
    return outline.points.map(([x, z], i) => ({ p: [x, layer.y, z],
      n: [outline.outward[i][0] * layer.radialNormal, layer.yNormal,
        outline.outward[i][1] * layer.radialNormal] }));
  });
  for (let k = 0; k < panelRings.length - 1; k++) {
    for (let j = 0; j < panelRings[k].length; j++) {
      const next = (j + 1) % panelRings[k].length;
      const a = panelRings[k][j], b = panelRings[k + 1][j];
      const c = panelRings[k + 1][next], d = panelRings[k][next];
      quad(a.p, b.p, c.p, d.p, a.n, b.n, c.n, d.n);
    }
  }
  const panelCap = capsule(10.4).points;
  cap(panelCap, [], ([x, z]) => [x, 0, z], [0, 1, 0]);
  // This opening is the shared root of the integral rib, not a hole through
  // the finished part. Its interior panel/rib faces are both omitted.
  const ribRoot = [[-51, -2], [-51, 2], [20, 2], [20, -2]];
  cap(panelCap, [ribRoot], ([x, z]) => [x, -3, z], [0, -1, 0]);

  const boss = { x: -46, y: -10, outerR: 5, boreR: 2.05, z0: -3, z1: 7 };
  const circleSteps = 512;
  const circle = (radius, index) => {
    const a = TAU * index / circleSteps;
    return [boss.x + radius * snap(Math.cos(a)), boss.y + radius * snap(Math.sin(a))];
  };
  const outer = Array.from({ length: circleSteps }, (_, j) => circle(boss.outerR, j));
  // A single lower D flat keys the separate cable actuator. The round upper
  // bearing and visible face are unchanged; there is no hidden overlapping key.
  const keyed = outer.map(([x,y])=>[x,Math.max(y,-14)]);
  const inner = Array.from({ length: circleSteps }, (_, j) => circle(boss.boreR, j));
  const radialNormal = (p, sign = 1) => [sign * (p[0] - boss.x) / boss.outerR,
    sign * (p[1] - boss.y) / boss.outerR, 0];

  // The neck and taper replace the upper half of the boss perimeter at Z±2.
  // Outside that band the same boss continues to the two axial annular ends.
  for (const [za, zb, lowerHalfOnly] of [[-3, -2, false], [-2, 2, true], [2, 7, false]]) {
    for (let j = 0; j < circleSteps; j++) {
      if (lowerHalfOnly && j < circleSteps / 2) continue;
      const loop=za===-3?keyed:outer;
      const p = loop[j], q = loop[(j + 1) % circleSteps];
      const n=za===-3&&p[1]===-14&&q[1]===-14?[0,-1,0]:null;
      quad([...p, za], [...q, za], [...q, zb], [...p, zb],
        n||radialNormal(p), n||radialNormal(q), n||radialNormal(q), n||radialNormal(p));
    }
  }
  for (let j = 0; j < circleSteps; j++) {
    const next = (j + 1) % circleSteps, p = inner[j], q = inner[next];
    const ni = p => [-(p[0] - boss.x) / boss.boreR, -(p[1] - boss.y) / boss.boreR, 0];
    quad([...p, -3], [...p, 7], [...q, 7], [...q, -3], ni(p), ni(p), ni(q), ni(q));
    for (const [z, sign] of [[-3, -1], [7, 1]]) {
      const loop=z===-3?keyed:outer;
      quad([...inner[j], z], [...loop[j], z], [...loop[next], z], [...inner[next], z], [0, 0, sign]);
    }
    quad([...keyed[j],-2],[...outer[j],-2],[...outer[next],-2],[...keyed[next],-2],[0,0,-1]);
  }

  // Neck footprint X[-51,-41] reaches the boss equator. The rear depth then
  // decreases from 5 mm at X=-41 to zero at X=+20; Z thickness stays 4 mm.
  const rootLeft = [-51, -3], rootRight = [20, -3], taperHeel = [-41, -8];
  const arcRight = outer[0], arcLeft = outer[circleSteps / 2];
  const ribSides = [[rootLeft, arcLeft], [arcRight, taperHeel], [taperHeel, rootRight]];
  for (const [p, q] of ribSides) {
    const normal = V([q[1] - p[1], p[0] - q[0], 0]).normalize().toArray();
    quad([...p, -2], [...q, -2], [...q, 2], [...p, 2], normal);
  }
  // Top/bottom of only the material outside the boss disk. No annular internal
  // caps remain inside the continuous boss/neck overlap.
  const transition = [rootLeft, rootRight, taperHeel, arcRight];
  for (let j = 1; j <= circleSteps / 2; j++) transition.push(outer[j]);
  for (const [z, sign] of [[-2, -1], [2, 1]]) cap(transition, [], ([x, y]) => [x, y, z], [0, 0, sign]);

  const geometry = new T.BufferGeometry();
  geometry.name = 'D11-P01-R2-keyed-continuous-lever';
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return { geometry, revision: 'D11-P01-R2', interfaces: {
    units: 'mm', coordinateFrame: { X: 'length', Y: 'outboard', Z: 'up' },
    pivot: { position: [-46, -10, 0], axis: [0, 0, 1], boreDiameter: 4.10,
      bossOuterDiameter: 10, bossAxialZ: [-3, 7], boreAxialZ: [-3, 7],
      through: true, extraYBore: false, actuatorKey:{type:'single D flat',flatY:-14,axialZ:[-3,-2]} },
    panel: { length: 138, height: 22, endRadius: 11, outerFaceY: 0, backFaceY: -3,
      edgeFilletRadius: 0.6, envelope: { min: [-69, -3, -11], max: [69, 0, 11] } },
    rib: { axialZ: [-2, 2], neckAxialX: [-51, -41], neckY: [-10, -3],
      rootFaceY: -3, rootAxialX: [-51, 20], taperStart: [-41, -8], taperEnd: [20, -3],
      continuousWithPanelAndBoss: true },
    outerEnvelope: { min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() },
    designAuthority: 'AUTHOR_DESIGN', references: ['D11-P01-r1.png', 'D11-handle-r1.png'],
    referenceAuthority: 'generated shape candidates, not measurements',
    materialBoundary: { materialProvidedByParent: true,
      formIntent: 'single continuous cast or moulded lever with applied green finish',
      materialGrade: 'UNSPECIFIED', manufacturingValidated: false },
    assemblyOrAestheticAcceptance: 'NOT_CLAIMED'
  } };
}
