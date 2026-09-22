// GT01 authored sliding brush caps, mm, motor shaft +X, local Y=Z=0.
// The partition uses only exact design planes; it is not a sampled voxel grid.
export function makeGT01BrushRetainers(T) {
  const regions = [
    { name: 'roof', min: [46.4, 5.35, -2.9], max: [46.8, 14.25, 2.9] },
    { name: 'positiveSideWall', min: [45.15, 5.35, 2.65], max: [46.4, 13.95, 2.9] },
    { name: 'negativeSideWall', min: [45.15, 5.35, -2.9], max: [46.4, 13.95, -2.65] },
    { name: 'positiveHookLip', min: [45.15, 5.35, 2.2], max: [45.25, 13.95, 2.65] },
    { name: 'negativeHookLip', min: [45.15, 5.35, -2.65], max: [45.25, 13.95, -2.2] },
    // Full-width stop joins both side walls over finite end-face areas.
    { name: 'outerStop', min: [45.9, 13.95, -2.9], max: [46.4, 14.25, 2.9] }
  ];
  const planes = [0, 1, 2].map(axis => [...new Set(regions.flatMap(r =>
    [r.min[axis], r.max[axis]]))].sort((a, b) => a - b));
  const cellKey = (i, j, k) => `${i},${j},${k}`;
  const occupied = new Set(), cells = [];
  for (let i = 0; i < planes[0].length - 1; i++)
    for (let j = 0; j < planes[1].length - 1; j++)
      for (let k = 0; k < planes[2].length - 1; k++) {
        const index = [i, j, k];
        const min = index.map((v, axis) => planes[axis][v]);
        const max = index.map((v, axis) => planes[axis][v + 1]);
        const mid = min.map((v, axis) => (v + max[axis]) / 2);
        if (!regions.some(r => mid.every((v, axis) => v > r.min[axis] && v < r.max[axis]))) continue;
        occupied.add(cellKey(...index)); cells.push({ index, min, max });
      }
  const positions = [], normals = [];
  function face(points, normal) {
    const cross = new T.Vector3(...points[1]).sub(new T.Vector3(...points[0]))
      .cross(new T.Vector3(...points[2]).sub(new T.Vector3(...points[0])));
    if (cross.dot(new T.Vector3(...normal)) < 0) points = [points[0], points[3], points[2], points[1]];
    for (const i of [0, 1, 2, 0, 2, 3]) {
      positions.push(...points[i]); normals.push(...normal);
    }
  }
  let boundaryQuads = 0, nominalVolume = 0;
  for (const cell of cells) {
    nominalVolume += cell.min.reduce((v, p, axis) => v * (cell.max[axis] - p), 1);
    for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
      const neighbour = [...cell.index]; neighbour[axis] += sign;
      if (occupied.has(cellKey(...neighbour))) continue; // No internal union face.
      const other = [0, 1, 2].filter(a => a !== axis), points = [];
      for (const pair of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
        const p = [...cell.min]; p[axis] = sign < 0 ? cell.min[axis] : cell.max[axis];
        for (let t = 0; t < 2; t++) p[other[t]] = pair[t] ? cell.max[other[t]] : cell.min[other[t]];
        points.push(p);
      }
      const normal = [0, 0, 0]; normal[axis] = sign; face(points, normal); boundaryQuads++;
    }
  }
  const base = new T.BufferGeometry();
  base.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  base.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  base.userData = { construction: 'exact-coordinate-plane-union-boundary',
    sourceRegions: regions, coordinatePlanes: planes, occupiedCells: cells.length,
    boundaryQuads, nominalVolume };
  const components = [];
  for (let k = 0; k < 2; k++) {
    const sign = k ? -1 : 1, geometry = base.clone();
    if (k) geometry.rotateX(Math.PI);
    geometry.name = 'D05-P14i-b-' + (k + 1);
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    components.push({ ref: 'D05-P14i-b', instance: k + 1,
      name: (k ? '負 Y 側' : '正 Y 側') + '碳刷滑入扣蓋', material: 'phenolic',
      surfaces: [['聯集屋頂、側壁、內勾唇與外端止擋', geometry]],
      interfaces: { coordinateSpace: 'motor-shaft-local', rotationAboutX: k * Math.PI,
        shaftAxis: [1, 0, 0], radialAxis: [0, sign, 0],
        insertionDirection: [0, -sign, 0], insertionEntry: k ? '-Y outer end' : '+Y outer end',
        innerEndY: sign * 5.35, stopInnerFaceY: sign * 13.95, outerEndY: sign * 14.25,
        outerStop: { axialX: [45.9, 46.4], radialY: [13.95, 14.25].map(v => sign * v),
          z: [-2.9, 2.9], joinsSideWallsOverFiniteFaces: true },
        hostRail: { axialX: [45.3, 45.8], absZ: [2.15, 2.55],
          radialY: [5, 13.9].map(v => sign * v) },
        lipFacingX: 45.25, sideWallInnerAbsZ: 2.65,
        nominalSlideClearance: { lipToRailX: 0.05, sideWallToRailZ: 0.10,
          outerStopToHostY: 0.05 },
        hostOuterDatumY: sign * 13.9,
        envelope: { min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() },
        status: 'SLIDE_GEOMETRY_ONLY', antiWithdrawalLatch: false, housingAttachment: false,
        missing: ['anti-withdrawal latch', 'housing attachment'] },
      explode: [0, sign * 12, 0] });
  }
  base.dispose();
  return { components, interfaces: { units: 'mm', coordinateSpace: 'motor-shaft-local',
    authority: 'AUTHOR_DESIGN', componentCount: 2, shaftAxis: [1, 0, 0],
    positiveSideRegions: regions, nominalVolumePerCap: nominalVolume,
    coordinatePlanes: planes, occupiedCells: cells.length, boundaryQuadsPerCap: boundaryQuads,
    status: 'SLIDE_GEOMETRY_ONLY', antiWithdrawalLatch: false, housingAttachment: false,
    missing: ['anti-withdrawal latch', 'housing attachment'] } };
}
