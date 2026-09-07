// SPDX-License-Identifier: Apache-2.0
// Radial capsule overview and single-edge ring adapted from Hyper-Knowledge
// (hanxiangmin/Hyper-Knowledge, 913ee64), rewritten as pure TypeScript functions.
import { compareId, type HypergraphModel } from "./model";

export interface Point {
  x: number;
  y: number;
}
export interface NodeMark extends Point {
  id: string;
  radius: number;
}
export interface EdgeMark extends Point {
  id: string;
  code: string;
  width: number;
}
export interface Scene {
  width: number;
  height: number;
  nodes: NodeMark[];
  edges: EdgeMark[];
  links: { nodeId: string; edgeId: string }[];
}

export function overviewLayout(model: HypergraphModel): Scene {
  const nodes = [...model.nodes].sort((a, b) => b.degree - a.degree || compareId(a.id, b.id));
  const edges = [...model.hyperedges].sort(
    (a, b) => b.members.length - a.members.length || compareId(a.id, b.id)
  );
  const hubId = nodes.find((n) => n.degree > 0)?.id;
  const scale = Math.max(1, edges.length / 14, nodes.length / 42);
  const width = 1400 * scale,
    height = 850 * scale,
    cx = width / 2,
    cy = height / 2;
  const rx = width * 0.43,
    ry = height * 0.38;
  const maxDegree = Math.max(1, ...nodes.map((n) => n.degree));
  const point = (angle: number, factor = 1): Point => ({
    x: cx + rx * factor * Math.cos(angle),
    y: cy + ry * factor * Math.sin(angle),
  });
  const radius = (id: string) =>
    28 + Math.sqrt((model.byNode.get(id)?.degree || 0) / maxDegree) * 14;
  const scene: Scene = { width, height, nodes: [], edges: [], links: [] };
  const leaves = new Map(
    edges.map((e) => [
      e.id,
      e.members.filter((id) => id !== hubId && model.byNode.get(id)!.degree === 1),
    ])
  );
  const weights = edges.map((e) => Math.max(2, leaves.get(e.id)!.length * 1.35 + 1));
  const total = weights.reduce((sum, n) => sum + n, 0) || 1;
  const angles = new Map<string, number>();
  let cursor = -Math.PI / 2 - ((weights[0] || 0) / total) * Math.PI;
  edges.forEach((edge, index) => {
    const span = (weights[index] / total) * Math.PI * 2,
      angle = cursor + span / 2;
    angles.set(edge.id, angle);
    scene.edges.push({ id: edge.id, ...point(angle, 0.65), code: `E${index + 1}`, width: 150 });
    leaves.get(edge.id)!.forEach((id, i, group) => {
      const theta =
        angle + (group.length === 1 ? 0 : ((i + 0.5) / group.length - 0.5) * span * 0.94);
      scene.nodes.push({ id, ...point(theta), radius: radius(id) });
    });
    for (const id of edge.members) scene.links.push({ nodeId: id, edgeId: edge.id });
    cursor += span;
  });
  if (hubId) scene.nodes.push({ id: hubId, x: cx, y: cy, radius: radius(hubId) });
  const shared = nodes
    .filter((n) => n.id !== hubId && n.degree > 1)
    .map((node) => {
      const related = [...model.incident.get(node.id)!].map((id) => angles.get(id)!);
      return {
        id: node.id,
        angle: Math.atan2(
          related.reduce((s, a) => s + Math.sin(a), 0),
          related.reduce((s, a) => s + Math.cos(a), 0)
        ),
      };
    })
    .sort((a, b) => a.angle - b.angle || compareId(a.id, b.id));
  shared.forEach((node, index) =>
    scene.nodes.push({
      id: node.id,
      ...point(-Math.PI / 2 + (index * Math.PI * 2) / shared.length, 0.27),
      radius: radius(node.id),
    })
  );
  const isolated = nodes.filter((n) => n.degree === 0),
    columns = Math.max(1, Math.floor((width - 120) / 100));
  isolated.forEach((node, index) =>
    scene.nodes.push({
      id: node.id,
      x: 60 + (index % columns) * 100,
      y: height - 48 + Math.floor(index / columns) * 100,
      radius: 28,
    })
  );
  scene.height += Math.max(0, Math.ceil(isolated.length / columns) - 1) * 100;
  separateOverviewMarks(scene, hubId);
  return scene;
}

/** Resolve crowded capsule sectors without changing membership or source coordinates. */
function separateOverviewMarks(scene: Scene, hubId?: string): void {
  const marks = [
    ...scene.edges.map(mark => ({ mark, halfWidth: mark.width / 2, halfHeight: 36, offsetY: -10, fixed: false })),
    ...scene.nodes.map(mark => ({ mark, halfWidth: mark.radius + 7, halfHeight: mark.radius + 7, offsetY: 0, fixed: mark.id === hubId })),
  ];
  const gap = 14;
  for (let pass = 0; pass < 100; pass++) {
    let largest = 0;
    for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) {
      const a = marks[i], b = marks[j];
      const dx = b.mark.x - a.mark.x, dy = b.mark.y + b.offsetY - a.mark.y - a.offsetY;
      const overlapX = a.halfWidth + b.halfWidth + gap - Math.abs(dx);
      const overlapY = a.halfHeight + b.halfHeight + gap - Math.abs(dy);
      if (overlapX <= 0 || overlapY <= 0) continue;
      const horizontal = overlapX < overlapY;
      const amount = (horizontal ? overlapX : overlapY) + .01;
      largest = Math.max(largest, amount);
      const direction = (horizontal ? dx : dy) >= 0 ? 1 : -1;
      const aShare = a.fixed ? 0 : b.fixed ? 1 : .5;
      const bShare = b.fixed ? 0 : a.fixed ? 1 : .5;
      if (horizontal) { a.mark.x -= amount * direction * aShare; b.mark.x += amount * direction * bShare; }
      else { a.mark.y -= amount * direction * aShare; b.mark.y += amount * direction * bShare; }
    }
    if (largest < .1) break;
  }
  // Keep labels visible even if separation expands a dense component beyond the initial ellipse.
  const left = Math.min(0, ...marks.map(m => m.mark.x - m.halfWidth - 20));
  const top = Math.min(0, ...marks.map(m => m.mark.y + m.offsetY - m.halfHeight - 20));
  for (const {mark} of marks) { mark.x -= left; mark.y -= top; }
  scene.width = Math.max(scene.width - left, ...marks.map(m => m.mark.x + m.halfWidth + 20));
  scene.height = Math.max(scene.height - top, ...marks.map(m => m.mark.y + m.offsetY + m.halfHeight + 20));
}

export function enclosureLayout(
  model: HypergraphModel,
  edgeId: string,
  rotation = -Math.PI / 2
): Scene & { center: Point; radius: number } {
  const edge = model.byEdge.get(edgeId);
  const members = [...(edge?.members || [])].sort(compareId);
  const radius = Math.max(190, members.length > 2 ? 55 / Math.sin(Math.PI / members.length) : 0);
  const width = Math.max(900, radius * 2 + 220),
    height = Math.max(620, radius * 2 + 200);
  const center = { x: width / 2, y: height / 2 };
  return {
    width,
    height,
    center,
    radius,
    nodes: members.map((id, index) => ({
      id,
      radius: 32,
      x: center.x + radius * Math.cos(rotation + (index * 2 * Math.PI) / members.length),
      y: center.y + radius * Math.sin(rotation + (index * 2 * Math.PI) / members.length),
    })),
    edges: edge ? [{ id: edgeId, ...center, width: 180, code: "" }] : [],
    links: [],
  };
}

export function incidencePath(node: NodeMark, edge: EdgeMark): string {
  const dx = node.x - edge.x,
    dy = node.y - edge.y;
  const length = Math.hypot(dx, dy) || 1;
  const edgeScale = Math.min(
    edge.width / 2 / Math.max(Math.abs(dx), 0.001),
    22 / Math.max(Math.abs(dy), 0.001)
  );
  return `M ${edge.x + dx * Math.min(0.45, edgeScale)} ${edge.y + dy * Math.min(0.45, edgeScale)} L ${node.x - (dx / length) * (node.radius + 2)} ${node.y - (dy / length) * (node.radius + 2)}`;
}
