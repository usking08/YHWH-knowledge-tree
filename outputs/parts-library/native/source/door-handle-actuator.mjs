// D11-P05a author geometry, mm: X along handle, Y outboard, Z up.
// Generated D11-P05-r1 is a shape candidate; explicit interfaces below govern.
export function makeGT01DoorHandleActuator(T) {
  const TAU = Math.PI * 2, positions = [], normals = [];
  const V = p => new T.Vector3(...p), eps = 1e-9;
  const snap = n => Math.abs(n) < 1e-12 ? 0 : n;
  function triangle(a, b, c, na, nb = na, nc = na) {
    const cross = V(b).sub(V(a)).cross(V(c).sub(V(a)));
    if (cross.dot(V(na).add(V(nb)).add(V(nc))) < 0) {
      [b, c] = [c, b]; [nb, nc] = [nc, nb];
    }
    positions.push(...a, ...b, ...c); normals.push(...na, ...nb, ...nc);
  }
  function quad(a, b, c, d, na, nb = na, nc = na, nd = na) {
    triangle(a, b, c, na, nb, nc); triangle(a, c, d, na, nc, nd);
  }
  const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < eps;
  function append(target, points) {
    for (const p of points) if (!target.length || !same(target.at(-1), p)) target.push([...p]);
    return target;
  }
  function clean(points) {
    const result = append([], points);
    if (result.length > 1 && same(result[0], result.at(-1))) result.pop();
    return result;
  }
  // Earcut can remove collinear boundary vertices. Splitting only affected
  // triangles retains all exact mating nodes without moving interface planes.
  function cap(outline, holes, z, sign) {
    const points = [...outline, ...holes.flat()];
    const triangles = T.ShapeUtils.triangulateShape(outline.map(p => new T.Vector2(...p)),
      holes.map(h => h.map(p => new T.Vector2(...p))));
    // Legalize interior diagonals. Boundary-constrained Delaunay flips avoid
    // long skinny Earcut triangles grazing adjacent curved-boundary vertices.
    // This changes triangulation only, never the part's boundary or fit sizes.
    const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const angle = (a, c, b) => Math.atan2(Math.abs(cross(c, a, b)),
      (a[0] - c[0]) * (b[0] - c[0]) + (a[1] - c[1]) * (b[1] - c[1]));
    let flips = 0, changed = true;
    while (changed) {
      changed = false; const shared = new Map(), edited = new Set();
      for (let t = 0; t < triangles.length; t++) for (let j = 0; j < 3; j++) {
        const a = triangles[t][j], b = triangles[t][(j + 1) % 3], k = a < b ? a + ',' + b : b + ',' + a;
        if (!shared.has(k)) shared.set(k, []);
        shared.get(k).push({ t, a, b, c: triangles[t][(j + 2) % 3] });
      }
      for (const pair of shared.values()) {
        if (pair.length !== 2 || pair.some(e => edited.has(e.t))) continue;
        const [one, two] = pair, a = one.a, b = one.b, c = one.c, d = two.c;
        const pa = points[a], pb = points[b], pc = points[c], pd = points[d];
        if (cross(pa, pb, pc) * cross(pa, pb, pd) >= -1e-16 ||
          cross(pc, pd, pa) * cross(pc, pd, pb) >= -1e-16) continue;
        if (angle(pa, pc, pb) + angle(pa, pd, pb) <= Math.PI + 1e-9) continue;
        triangles[one.t] = [c, d, a]; triangles[two.t] = [d, c, b];
        edited.add(one.t); edited.add(two.t); changed = true; flips++;
        if (flips > triangles.length * triangles.length) throw new Error('Cap triangulation did not converge');
      }
    }
    for (const ids of triangles) {
      const corners = ids.map(i => points[i]), boundary = [];
      for (let j = 0; j < 3; j++) {
        const a = corners[j], b = corners[(j + 1) % 3];
        const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
        const edge = [{ t: 0, p: a }];
        for (const p of points) {
          const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2;
          if (t <= 1e-8 || t >= 1 - 1e-8) continue;
          if (Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) < 1e-8 * Math.sqrt(l2)) edge.push({ t, p });
        }
        edge.sort((a, b) => a.t - b.t); append(boundary, edge.map(e => e.p));
      }
      if (boundary.length === 3) triangle(...corners.map(p => [...p, z]), [0, 0, sign]);
      else {
        const centre = [corners.reduce((s, p) => s + p[0], 0) / 3,
          corners.reduce((s, p) => s + p[1], 0) / 3, z];
        for (let j = 0; j < boundary.length; j++) triangle(centre,
          [...boundary[j], z], [...boundary[(j + 1) % boundary.length], z], [0, 0, sign]);
      }
    }
  }
  const hub = [-46, -10], eye = [-28, -10], hubR = 6, eyeR = 3.4, eyeBoreR = 2.075;
  const cp = (centre, radius, angle) => [centre[0] + radius * snap(Math.cos(angle)),
    centre[1] + radius * snap(Math.sin(angle))];
  const thetaA = Math.PI + Math.asin(4 / 6), thetaB = TAU - Math.acos(-3.5 / 6);
  const hubAngles = [...Array.from({ length: 384 }, (_, i) => TAU * i / 384), thetaA, thetaB]
    .sort((a, b) => a - b).filter((a, i, values) => i === 0 || Math.abs(a - values[i - 1]) > 1e-10);
  function hubArc(a, b) {
    const direction = b >= a ? 1 : -1, lo = Math.min(a, b), hi = Math.max(a, b), angles = [a, b];
    for (const angle of hubAngles) for (const offset of [-TAU, 0, TAU]) {
      const v = angle + offset; if (v > lo + 1e-10 && v < hi - 1e-10) angles.push(v);
    }
    angles.sort((x, y) => direction * (x - y)); return angles.map(a => cp(hub, hubR, a));
  }
  function arc(centre, radius, start, end, maxStep = TAU / 384) {
    const angles = [start, end], lo = Math.min(start, end), hi = Math.max(start, end);
    for (let k = Math.ceil(lo / maxStep); k <= Math.floor(hi / maxStep); k++) {
      const a = k * maxStep; if (a > lo + 1e-10 && a < hi - 1e-10) angles.push(a);
    }
    angles.sort((a, b) => (end > start ? 1 : -1) * (a - b));
    return angles.map(a => cp(centre, radius, a));
  }
  function bezier(a, b, c, d, steps = 40) {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps, u = 1 - t;
      return [0, 1].map(k => u ** 3 * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t ** 3 * d[k]);
    });
  }
  const upperHub = cp(hub, hubR, Math.PI / 3), lowerHub = cp(hub, hubR, 5 * Math.PI / 3);
  const upperEye = cp(eye, eyeR, 2 * Math.PI / 3), lowerEye = cp(eye, eyeR, 4 * Math.PI / 3);
  const waist = [-35, -8.05], upperLink = [];
  append(upperLink, bezier(upperHub, [upperHub[0] + 2.4, upperHub[1] - 2.4 / Math.sqrt(3)], [-37, -8.05], waist));
  append(upperLink, bezier(waist, [-33.2, -8.05], [upperEye[0] - 1.4, upperEye[1] - 1.4 / Math.sqrt(3)], upperEye));
  const lowerLink = upperLink.map(([x, y]) => [x, -20 - y]);
  const pointKey = p => p.map(v => v.toFixed(9)).join(','), waistNormals = new Map();
  for (const [path, side] of [[upperLink, 1], [lowerLink, -1]]) {
    for (let j = 0; j < path.length; j++) {
      const before = path[Math.max(0, j - 1)], after = path[Math.min(path.length - 1, j + 1)];
      let normal = V([-side * (after[1] - before[1]), side * (after[0] - before[0]), 0]).normalize().toArray();
      if (j === 0) normal = [(path[j][0] - hub[0]) / hubR, (path[j][1] - hub[1]) / hubR, 0];
      if (j === path.length - 1) normal = [(path[j][0] - eye[0]) / eyeR, (path[j][1] - eye[1]) / eyeR, 0];
      waistNormals.set(pointKey(path[j]), normal);
    }
  }
  const outerSlotAngle = Math.asin(0.7 / eyeR), innerSlotAngle = Math.asin(0.7 / eyeBoreR);
  const eyePath = [];
  append(eyePath, arc(eye, eyeR, 4 * Math.PI / 3, 3 * Math.PI / 2 - outerSlotAngle));
  append(eyePath, [cp(eye, eyeBoreR, 3 * Math.PI / 2 - innerSlotAngle)]);
  append(eyePath, arc(eye, eyeBoreR, 3 * Math.PI / 2 - innerSlotAngle, -Math.PI / 2 + innerSlotAngle));
  append(eyePath, [cp(eye, eyeR, 3 * Math.PI / 2 + outerSlotAngle)]);
  append(eyePath, arc(eye, eyeR, 3 * Math.PI / 2 + outerSlotAngle, TAU + 2 * Math.PI / 3));
  const rightBoundary = [];
  append(rightBoundary, lowerLink); append(rightBoundary, eyePath); append(rightBoundary, [...upperLink].reverse());
  const footA = cp(hub, hubR, thetaA), footB = cp(hub, hubR, thetaB);
  const footPath = [footA, [-52, -14], [-52, -23], [-51.45, -23], [-49.95, -23], [-49.5, -23], footB];
  const outline = [];
  append(outline, rightBoundary); append(outline, hubArc(Math.PI / 3, thetaA));
  append(outline, footPath); append(outline, hubArc(thetaB, 5 * Math.PI / 3));
  const baseOutline = clean(outline);
  const pivotHole = arc(hub, 2.1, 0, TAU).slice(0, -1);

  // A shared perimeter forms the side of the main plate, including the open
  // eye's inner wall and both real slot walls. No tube overlaps the link.
  for (let j = 0; j < baseOutline.length; j++) {
    const p = baseOutline[j], q = baseOutline[(j + 1) % baseOutline.length];
    const faceNormal = V([q[1] - p[1], p[0] - q[0], 0]).normalize().toArray();
    let np = faceNormal, nq = faceNormal;
    if (waistNormals.has(pointKey(p)) && waistNormals.has(pointKey(q))) {
      np = waistNormals.get(pointKey(p)); nq = waistNormals.get(pointKey(q));
    }
    for (const [centre, radius, sign] of [[hub, 6, 1], [eye, eyeR, 1], [eye, eyeBoreR, -1]]) {
      if (Math.abs(Math.hypot(p[0] - centre[0], p[1] - centre[1]) - radius) < 1e-7 &&
        Math.abs(Math.hypot(q[0] - centre[0], q[1] - centre[1]) - radius) < 1e-7) {
        np = [sign * (p[0] - centre[0]) / radius, sign * (p[1] - centre[1]) / radius, 0];
        nq = [sign * (q[0] - centre[0]) / radius, sign * (q[1] - centre[1]) / radius, 0];
      }
    }
    quad([...p, -6], [...q, -6], [...q, -3.1], [...p, -3.1], np, nq, nq, np);
  }
  // Bottom cap contains a boundary notch at the spring block root, omitting
  // the 1.5 x 5 mm shared face instead of hiding it under a separate primitive.
  const bottomFoot = [footA, [-52, -14], [-52, -23], [-51.45, -23],
    [-51.45, -18], [-49.95, -18], [-49.95, -23], [-49.5, -23], footB];
  const bottom = [];
  append(bottom, rightBoundary); append(bottom, hubArc(Math.PI / 3, thetaA));
  append(bottom, bottomFoot); append(bottom, hubArc(thetaB, 5 * Math.PI / 3));
  cap(clean(bottom), [pivotHole], -6, -1);

  // Only the plate material outside the collar gets a top face here.
  const rightTop = append([...rightBoundary], hubArc(Math.PI / 3, -Math.PI / 3));
  cap(clean(rightTop), [], -3.1, 1);
  const footTop = append([...footPath], hubArc(thetaB, thetaA));
  cap(clean(footTop), [], -3.1, 1);

  // Collar outer wall uses the same split hub circle as plate and top caps.
  const hubRing = hubAngles.map(a => cp(hub, 6, a));
  for (let j = 0; j < hubRing.length; j++) {
    const p = hubRing[j], q = hubRing[(j + 1) % hubRing.length];
    const normal = p => [(p[0] + 46) / 6, (p[1] + 10) / 6, 0];
    quad([...p, -3.1], [...q, -3.1], [...q, -2.1], [...p, -2.1], normal(p), normal(q), normal(q), normal(p));
  }
  const cutAngle = Math.asin(4.1 / 5.1);
  const dSeat = arc(hub, 5.1, -cutAngle, Math.PI + cutAngle);
  // Both cut endpoints are on one exact Y plane, avoiding a multi-flat socket.
  dSeat[0][1] = -14.1; dSeat[dSeat.length - 1][1] = -14.1;
  cap(hubRing, [dSeat], -2.1, 1);
  cap(dSeat, [pivotHole], -3.1, 1); // D recess floor, not a large through-hole.
  for (let j = 0; j < dSeat.length; j++) {
    const p = dSeat[j], q = dSeat[(j + 1) % dSeat.length], isFlat = j === dSeat.length - 1;
    const normal = p => isFlat ? [0, 1, 0] : [-(p[0] + 46) / 5.1, -(p[1] + 10) / 5.1, 0];
    quad([...p, -3.1], [...p, -2.1], [...q, -2.1], [...q, -3.1], normal(p), normal(p), normal(q), normal(q));
  }
  for (let j = 0; j < pivotHole.length; j++) {
    const p = pivotHole[j], q = pivotHole[(j + 1) % pivotHole.length];
    const normal = p => [-(p[0] + 46) / 2.1, -(p[1] + 10) / 2.1, 0];
    quad([...p, -6], [...p, -3.1], [...q, -3.1], [...q, -6], normal(p), normal(p), normal(q), normal(q));
  }
  const block = [[-51.45, -23], [-49.95, -23], [-49.95, -18], [-51.45, -18]];
  cap(block, [], -8.4, -1);
  for (let j = 0; j < block.length; j++) {
    const p = block[j], q = block[(j + 1) % block.length];
    const normal = V([q[1] - p[1], p[0] - q[0], 0]).normalize().toArray();
    quad([...p, -8.4], [...q, -8.4], [...q, -6], [...p, -6], normal);
  }

  const geometry = new T.BufferGeometry(); geometry.name = 'D11-P05a-R1-single-actuator';
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return { geometry, revision: 'D11-P05a-R1', interfaces: {
    units: 'mm', coordinateFrame: { X: 'handle length', Y: 'outboard', Z: 'up' },
    designAuthority: 'AUTHOR_DESIGN', sourceShapeCandidate: 'D11-P05-r1.png',
    pivot: { centre: [-46, -10], axis: [0, 0, 1], boreDiameter: 4.2,
      boreAxialZ: [-6, -3.1], throughBase: true, outerRadius: 6 },
    plate: { axialZ: [-6, -3.1], thickness: 2.9, backFaceRecesses: false },
    dSeat: { centre: [-46, -10], axis: [0, 0, 1], radius: 5.1, flatY: -14.1,
      flatCount: 1, keepHalfPlane: 'Y >= -14.1', floorZ: -3.1, rimZ: -2.1,
      recessDepth: 1, throughLargeOpening: false, collarOuterRadius: 6 },
    cableEye: { centre: [-28, -10], axis: [0, 0, 1], outerRadius: 3.4,
      holeRadius: 2.075, slotWidth: 1.4, slotDirection: [0, -1, 0],
      slotX: [-28.7, -27.3], axialZ: [-6, -3.1], openToExterior: true },
    rearLeg: { relativeToPivot: { x: [-6, -3.5], y: [-13, -4] },
      globalX: [-52, -49.5], globalY: [-23, -14], axialZ: [-6, -3.1] },
    springContact: { blockX: [-51.45, -49.95], blockY: [-23, -18], blockZ: [-8.4, -6],
      planeX: -49.95, outwardNormal: [1, 0, 0], joinedRootArea: 7.5,
      contactFaceBounds: { min: [-49.95, -23, -8.4], max: [-49.95, -18, -6] } },
    envelope: { min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() },
    materialGrade: 'UNSPECIFIED', loadVerification: 'NOT_CLAIMED',
    construction: 'single shared boundary with collar recess, cable-eye slot and integral spring block'
  } };
}
