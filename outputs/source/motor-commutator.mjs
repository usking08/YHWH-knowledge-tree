// GT01 authored commutator geometry, millimetres. Shaft axis +X; Y=Z=0.
// No THREE import: the owning motor supplies its own Three.js runtime as T.
export function makeGT01Commutator(T) {
  const TAU = 2 * Math.PI, count = 12, period = TAU / count;
  const grooveAngle = 0.20 / 5.2, halfAngle = (period - grooveAngle) / 2;
  const copperSteps = 64, grooveSteps = 8;
  // Move the whole commutator forward of the winding crown; radius and topology
  // stay unchanged. All published coordinates are in the final motor frame.
  const X = x => x - 6, span = limits => limits.map(X);
  const radial = (x, r, angle) => [X(x), r * Math.cos(angle), r * Math.sin(angle)];
  const components = [], terminals = [];

  // Vertices are deliberately split at profile corners: the curved walls have
  // analytic radial normals, while the lips, groove floor and ends stay sharp.
  function builder() {
    const positions = [], normals = [];
    function triangle(a, b, c, na, nb = na, nc = na) {
      positions.push(...a, ...b, ...c);
      normals.push(...na, ...nb, ...nc);
    }
    function sweptEdge(p, q, a0, a1, steps) {
      const dx = q[0] - p[0], dr = q[1] - p[1], len = Math.hypot(dx, dr);
      const normal = angle => [dr / len, -dx * Math.cos(angle) / len,
        -dx * Math.sin(angle) / len];
      for (let j = 0; j < steps; j++) {
        const a = a0 + (a1 - a0) * j / steps;
        const b = a0 + (a1 - a0) * (j + 1) / steps;
        const p0 = radial(...p, a), q0 = radial(...q, a);
        const p1 = radial(...p, b), q1 = radial(...q, b);
        triangle(p0, q0, q1, normal(a), normal(a), normal(b));
        triangle(p0, q1, p1, normal(a), normal(b), normal(b));
      }
    }
    function profileCap(profile, angle, positive) {
      const face = T.ShapeUtils.triangulateShape(
        profile.map(([x, r]) => new T.Vector2(x, r)), []);
      const s = positive ? 1 : -1;
      const normal = [0, -s * Math.sin(angle), s * Math.cos(angle)];
      for (const ids of face) {
        const [a, b, c] = positive ? ids : [ids[0], ids[2], ids[1]];
        triangle(radial(...profile[a], angle), radial(...profile[b], angle),
          radial(...profile[c], angle), normal);
      }
    }
    function finish(name) {
      const geometry = new T.BufferGeometry();
      geometry.name = name;
      geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      return geometry;
    }
    return { sweptEdge, profileCap, finish };
  }

  const intervals = [];
  for (let k = 0; k < count; k++) {
    const centre = k * period;
    intervals.push({ a: centre - halfAngle, b: centre + halfAngle,
      steps: copperSteps, rib: false });
    intervals.push({ a: centre + halfAngle, b: centre + period - halfAngle,
      steps: grooveSteps, rib: true });
  }

  // One closed moulded solid. Ribs are part of its outer boundary: hidden root
  // faces are omitted, rather than leaving overlapping closed cylinders/boxes.
  const core = builder();
  for (const { a, b, steps, rib } of intervals) {
    core.sweptEdge([46.5, 3.01], [54.8, 3.01], a, b, steps); // Through bore.
    core.sweptEdge([48, 4.3], [46.5, 4.3], a, b, steps);
    core.sweptEdge([54.8, 4.3], [53.2, 4.3], a, b, steps);
    core.sweptEdge([46.5, 4.3], [46.5, 3.01], a, b, steps);
    core.sweptEdge([54.8, 3.01], [54.8, 4.3], a, b, steps);
    core.sweptEdge([53.2, rib ? 4.8 : 4.3], [48, rib ? 4.8 : 4.3], a, b, steps);
    if (rib) {
      core.sweptEdge([48, 4.8], [48, 4.3], a, b, steps);
      core.sweptEdge([53.2, 4.3], [53.2, 4.8], a, b, steps);
      const side = [[48, 4.3], [53.2, 4.3], [53.2, 4.8], [48, 4.8]];
      core.profileCap(side, a, false);
      core.profileCap(side, b, true);
    }
  }
  components.push({
    ref: 'D05-P14f-a', name: '換向器模製絕緣芯', material: 'insulator', instance: 1,
    surfaces: [['貫通軸孔、連續絕緣芯及十二個片間隔肋', core.finish('D05-P14f-a')]],
    interfaces: { shaftAxis: [1, 0, 0], shaftBore: 6.02, shaftDiameter: 6,
      nominalRadialShaftClearance: 0.01, axialX: span([46.5, 54.8]), outerRadius: 4.3,
      ribCount: 12, ribAxialX: span([48, 53.2]), ribTopRadius: 4.8,
      ribAngularWidth: grooveAngle, ribCentreOffset: period / 2 },
    explode: [-14, 0, 0]
  });

  // A single CCW section in (X,R). The re-entrant U-profile makes an actual
  // 0.8 mm wide channel, open radially; the two ears and contact barrel share
  // one continuous copper volume. It is not a colour applied to a full tube.
  const copperProfile = [[48, 4.3], [54.8, 4.3], [54.8, 6.3],
    [54.4, 6.3], [54.4, 5.55], [53.6, 5.55], [53.6, 6.3],
    [53.2, 6.3], [53.2, 5.2], [48, 5.2]];
  for (let k = 0; k < count; k++) {
    const angle = k * period, a = angle - halfAngle, b = angle + halfAngle;
    const copper = builder();
    for (let j = 0; j < copperProfile.length; j++) {
      copper.sweptEdge(copperProfile[j], copperProfile[(j + 1) % copperProfile.length],
        a, b, copperSteps);
    }
    copper.profileCap(copperProfile, a, false);
    copper.profileCap(copperProfile, b, true);
    const wireSeats = [-1, 1].map((side, index) => {
      const seatAngle = angle + side * 0.09;
      return { index, position: radial(54, 5.75, seatAngle),
        tangent: [0, -side * Math.sin(seatAngle), side * Math.cos(seatAngle)],
        wireOuterDiameter: 0.36, radialFloorClearance: 0.02,
        side, angle: seatAngle };
    });
    const terminal = { ref: 'D05-P14f-b', instance: k + 1, index: k,
      angle, coordinateSpace: 'motor-shaft-local', wireSeats };
    terminals.push(terminal);
    components.push({
      ref: 'D05-P14f-b', instance: k + 1,
      name: '換向器銅片 ' + String(k + 1).padStart(2, '0'), material: 'copper',
      surfaces: [['一體接觸弧、雙壁凸耳與開口導線槽',
        copper.finish('D05-P14f-b-' + (k + 1))]],
      interfaces: { shaftAxis: [1, 0, 0], segmentIndex: k, centreAngle: angle,
        angularLimits: [a, b], contactAxialX: span([48, 53.2]), contactInnerRadius: 4.3,
        contactOuterRadius: 5.2, lugAxialX: span([53.2, 54.8]), lugMaximumRadius: 6.3,
        wireGrooveAxialX: span([53.6, 54.4]), wireGrooveFloorRadius: 5.55,
        wireGrooveTopRadius: 6.3, wireSeats },
      explode: [0, 14 * Math.cos(angle), 14 * Math.sin(angle)]
    });
  }

  return { components, terminals, interfaces: {
    units: 'mm', axis: [1, 0, 0], localOrigin: [0, 0, 0],
    coordinateSpace: 'motor-shaft-local', authority: 'AUTHOR_DESIGN',
    segmentCount: count, angularIndex: 'theta=k*2*pi/12; Y=R*cos(theta); Z=R*sin(theta)',
    shaftDiameter: 6, shaftBore: 6.02, axialX: span([46.5, 54.8]),
    contactAxialX: span([48, 53.2]), outerContactRadius: 5.2,
    slotWidthAtContactRadius: 2 * 5.2 * Math.sin(grooveAngle / 2),
    interSegmentGrooveAngle: grooveAngle, insulatorRibTopRadius: 4.8,
    windingSeatCount: 24, windingWireOuterDiameter: 0.36,
    laminationStartX: 58, axialClearanceToLamination: 58 - X(54.8),
    windingCrownStartX: 49.5, axialClearanceToWindingCrown: 49.5 - X(54.8),
    copperProfileXR: copperProfile.map(([x, r]) => [X(x), r])
  } };
}
