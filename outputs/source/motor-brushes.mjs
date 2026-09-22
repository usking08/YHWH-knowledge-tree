// GT01 authored brush and spring geometry, millimetres, motor-shaft-local.
// The motor owns the Three.js runtime and materials; no THREE import here.
export function makeGT01MotorBrushes(T) {
  const TAU = 2 * Math.PI, V = p => new T.Vector3(...p), components = [];
  function meshBuilder() {
    const positions = [], normals = [];
    function tri(a, b, c, na, nb = na, nc = na) {
      const cross = V(b).sub(V(a)).cross(V(c).sub(V(a)));
      if (cross.dot(V(na).add(V(nb)).add(V(nc))) < 0) {
        [b, c] = [c, b]; [nb, nc] = [nc, nb];
      }
      positions.push(...a, ...b, ...c); normals.push(...na, ...nb, ...nc);
    }
    function quad(a, b, c, d, na, nb = na, nc = na, nd = na) {
      tri(a, b, c, na, nb, nc); tri(a, c, d, na, nc, nd);
    }
    function finish(name) {
      const g = new T.BufferGeometry(); g.name = name;
      g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      g.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
      g.computeBoundingBox(); g.computeBoundingSphere(); return g;
    }
    return { tri, quad, finish };
  }

  const R = 5.2, x0 = 42.8, x1 = 46.2, halfWidth = 1.6;
  const outerY = 9.2, bevel = 0.15, shoulderY = outerY - bevel;
  const holeR = 0.4, holeY = 8.1, holeDepth = 0.7, holeSteps = 64;
  const contactHalfAngle = Math.asin(halfWidth / R);
  const profile = [];
  for (let j = 0; j <= 128; j++) {
    const angle = contactHalfAngle * (1 - 2 * j / 128);
    profile.push([R * Math.cos(angle), R * Math.sin(angle)]);
  }
  profile.push([shoulderY, -halfWidth], [shoulderY, halfWidth]);
  const hole = Array.from({ length: holeSteps }, (_, j) => {
    const a = -TAU * j / holeSteps;
    return [holeY + holeR * Math.cos(a), holeR * Math.sin(a)];
  });
  const brush = meshBuilder();
  // Extruded lower boundary, including the true concave cylindrical contact.
  // The upper face is omitted here so the bevel is one connected boundary.
  for (let j = 0; j < profile.length; j++) {
    const p = profile[j], q = profile[(j + 1) % profile.length];
    if (p[0] === shoulderY && q[0] === shoulderY) continue;
    const edgeNormal = V([0, q[1] - p[1], p[0] - q[0]]).normalize().toArray();
    const curved = j < 128;
    const np = curved ? [0, -p[0] / R, -p[1] / R] : edgeNormal;
    const nq = curved ? [0, -q[0] / R, -q[1] / R] : edgeNormal;
    brush.quad([x0, ...p], [x0, ...q], [x1, ...q], [x1, ...p], np, nq, nq, np);
  }
  function axialCap(x, withHole, sign) {
    const holes = withHole ? [hole.map(p => new T.Vector2(...p))] : [];
    const triangles = T.ShapeUtils.triangulateShape(
      profile.map(p => new T.Vector2(...p)), holes);
    const points = withHole ? [...profile, ...hole] : profile;
    for (const ids of triangles) brush.tri(...ids.map(i => [x, ...points[i]]), [sign, 0, 0]);
  }
  axialCap(x0, true, -1); axialCap(x1, false, 1);
  const lower = [[x0, shoulderY, -halfWidth], [x1, shoulderY, -halfWidth],
    [x1, shoulderY, halfWidth], [x0, shoulderY, halfWidth]];
  const upper = [[x0 + bevel, outerY, -halfWidth + bevel],
    [x1 - bevel, outerY, -halfWidth + bevel],
    [x1 - bevel, outerY, halfWidth - bevel],
    [x0 + bevel, outerY, halfWidth - bevel]];
  const bevelNormals = [[0, 1, -1], [1, 1, 0], [0, 1, 1], [-1, 1, 0]];
  for (let j = 0; j < 4; j++) brush.quad(lower[j], lower[(j + 1) % 4],
    upper[(j + 1) % 4], upper[j], V(bevelNormals[j]).normalize().toArray());
  brush.quad(...upper, [0, 1, 0]);
  // Actual blind bore: front cap hole, inward cylindrical wall, solid floor.
  for (let j = 0; j < holeSteps; j++) {
    const a = hole[j], b = hole[(j + 1) % holeSteps];
    const na = [0, (holeY - a[0]) / holeR, -a[1] / holeR];
    const nb = [0, (holeY - b[0]) / holeR, -b[1] / holeR];
    brush.quad([x0, ...a], [x0 + holeDepth, ...a],
      [x0 + holeDepth, ...b], [x0, ...b], na, na, nb, nb);
    brush.tri([x0 + holeDepth, holeY, 0], [x0 + holeDepth, ...a],
      [x0 + holeDepth, ...b], [-1, 0, 0]);
  }
  const brushGeometry = brush.finish('D05-P14g-positive');

  const spring = meshBuilder(), wireRadius = 0.14, coilRadius = 1.1;
  const turns = 5, axialRise = 4.02, endRise = 0.30;
  const longitudinalSteps = 5 * 128, wireSteps = 24;
  // Five turns with low-pitch closing turns and C1 transitions. Zero endpoint
  // slope puts the wire extrema exactly on the two radial support planes.
  function advance(t) {
    if (t <= 1) return { h: endRise * (2 * t * t - t * t * t),
      dh: endRise * (4 * t - 3 * t * t) };
    if (t >= 4) { const q = 5 - t, start = advance(q);
      return { h: axialRise - start.h, dh: start.dh }; }
    const u = (t - 1) / 3, middleRise = axialRise - 2 * endRise;
    const extra = middleRise - 3 * endRise;
    return { h: endRise + 3 * endRise * u + extra * (3 * u * u - 2 * u * u * u),
      dh: endRise + extra * (6 * u - 6 * u * u) / 3 };
  }
  const rings = [], centreline = [], tangents = [];
  for (let j = 0; j <= longitudinalSteps; j++) {
    const t = turns * j / longitudinalSteps, a = TAU * t, rise = advance(t);
    const centre = V([44.5 + coilRadius * Math.cos(a), 9.34 + rise.h,
      coilRadius * Math.sin(a)]);
    const tangent = V([-TAU * coilRadius * Math.sin(a), rise.dh,
      TAU * coilRadius * Math.cos(a)]).normalize();
    const n = V([Math.cos(a), 0, Math.sin(a)]), b = n.clone().cross(tangent).normalize();
    const ring = [];
    for (let k = 0; k < wireSteps; k++) {
      const angle = TAU * k / wireSteps;
      const normal = n.clone().multiplyScalar(Math.cos(angle)).addScaledVector(b, Math.sin(angle));
      ring.push({ p: centre.clone().addScaledVector(normal, wireRadius).toArray(), n: normal.toArray() });
    }
    rings.push(ring); centreline.push(centre.toArray()); tangents.push(tangent.toArray());
  }
  for (let j = 0; j < longitudinalSteps; j++) for (let k = 0; k < wireSteps; k++) {
    const next = (k + 1) % wireSteps, a = rings[j][k], b = rings[j + 1][k];
    const c = rings[j + 1][next], d = rings[j][next];
    spring.quad(a.p, b.p, c.p, d.p, a.n, b.n, c.n, d.n);
  }
  for (const j of [0, longitudinalSteps]) for (let k = 0; k < wireSteps; k++) {
    const sign = j === 0 ? -1 : 1, normal = tangents[j].map(v => sign * v);
    spring.tri(centreline[j], rings[j][k].p, rings[j][(k + 1) % wireSteps].p, normal);
  }
  const springGeometry = spring.finish('D05-P14h-positive');
  springGeometry.userData = { centreline: centreline.map(p => [...p]), wireRadius,
    turns, endRisePerTurn: endRise, longitudinalSteps, wireSteps };

  for (let k = 0; k < 2; k++) {
    const sign = k === 0 ? 1 : -1;
    const g = brushGeometry.clone(), s = springGeometry.clone();
    if (k) { g.rotateX(Math.PI); s.rotateX(Math.PI); }
    g.computeBoundingBox(); s.computeBoundingBox();
    g.name = 'D05-P14g-' + (k + 1); s.name = 'D05-P14h-' + (k + 1);
    s.userData = { ...springGeometry.userData,
      centreline: centreline.map(([x, y, z]) => [x, sign * y, sign * z]) };
    components.push({ ref: 'D05-P14g', instance: k + 1,
      name: (k ? '負 Y 側' : '正 Y 側') + '圓柱凹面碳刷', material: 'carbon',
      surfaces: [['連續碳刷、圓柱接觸面、外端倒角與引線盲座', g]],
      interfaces: { contactRadius: R, contactCylinderAxis: [1, 0, 0],
        contactCylinderCentre: [0, 0, 0], contactAxialX: [x0, x1],
        contactAngleHalfSpan: contactHalfAngle, rotationAboutX: k * Math.PI,
        radialAxis: [0, sign, 0], brushWidthZ: 3.2, outerEndY: sign * outerY,
        outerEdgeChamfer: bevel, springContactPlaneY: sign * outerY,
        springContactFlatX: [x0 + bevel, x1 - bevel], springContactFlatZ: [-1.45, 1.45],
        leadBlindSeat: { opening: [x0, sign * holeY, 0], axisIntoBrush: [1, 0, 0],
          diameter: 0.8, depth: holeDepth, floorX: x0 + holeDepth },
        envelope: { min: g.boundingBox.min.toArray(), max: g.boundingBox.max.toArray() } },
      explode: [0, sign * 14, 0] });
    components.push({ ref: 'D05-P14h', instance: k + 1,
      name: (k ? '負 Y 側' : '正 Y 側') + '碳刷壓縮彈簧', material: 'springSteel',
      surfaces: [['五圈連續變節距鋼線、低節距端圈及兩個封口', s]],
      interfaces: { springAxis: [0, sign, 0], springAxisOrigin: [44.5, 0, 0],
        wireDiameter: 0.28, coilCentreRadius: coilRadius, turns,
        innerSupportPlaneY: sign * 9.2, outerSupportPlaneY: sign * 13.5,
        installedHeight: 4.3, centrelineEndY: [sign * 9.34, sign * 13.36],
        closingTurnAxialRise: endRise, endCaps: 2,
        radialEnvelopeFromSpringAxis: 1.24,
        envelope: { min: s.boundingBox.min.toArray(), max: s.boundingBox.max.toArray() } },
      explode: [0, sign * 23, 0] });
  }
  brushGeometry.dispose(); springGeometry.dispose();
  return { components, interfaces: { units: 'mm', coordinateSpace: 'motor-shaft-local',
    shaftAxis: [1, 0, 0], shaftCentre: [0, 0, 0], authority: 'AUTHOR_DESIGN',
    brushCount: 2, springCount: 2, commutatorContactRadius: R,
    brushContactAxialX: [x0, x1], brushRotationAboutX: [0, Math.PI],
    leadSeatOpenings: [[42.8, 8.1, 0], [42.8, -8.1, 0]],
    leadSeatDrillAxis: [1, 0, 0], leadSeatDiameter: 0.8, leadSeatDepth: 0.7 } };
}
