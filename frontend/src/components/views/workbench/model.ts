// SPDX-License-Identifier: Apache-2.0
// Native membership, identity, and focus conventions adapted from Hyper-Knowledge.
import type { Node, Hyperedge as ApiHyperedge } from "@/types/api";
import type { SelectedItem } from "@/hooks/useVisualization";

// Local renderer input: consume the existing response without changing the public types.
export interface WorkbenchData {
  nodes: Array<Node<Record<string, unknown>>>;
  hyperedges: Array<ApiHyperedge<Record<string, unknown>>>;
  edges?: unknown[];
}

export interface Entity {
  id: string;
  label: string;
  highlighted: boolean;
  degree: number;
}

export interface Hyperedge {
  id: string;
  label: string;
  members: string[];
  highlighted: boolean;
  color: string;
  roles: Map<string, string[]>;
}

export interface HypergraphModel {
  nodes: Entity[];
  hyperedges: Hyperedge[];
  byNode: Map<string, Entity>;
  byEdge: Map<string, Hyperedge>;
  incident: Map<string, Set<string>>;
  unresolved: number;
  memberships: number;
}

export const compareId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const palette = ["#287d72", "#ad790d", "#bd5939", "#ad4d85", "#5479bd", "#7a60b6"];

export function edgeColor(id: string): string {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return palette[(hash >>> 0) % palette.length];
}

function suppliedRoles(raw: Record<string, unknown>, members: Set<string>): Map<string, string[]> {
  const roles = new Map<string, string[]>();
  // Optional, explicit metadata. Never infer roles from member order or labels.
  if (!Array.isArray(raw?.membership_records)) return roles;
  for (const record of raw.membership_records) {
    if (!record || typeof record.node_id !== "string" || typeof record.role !== "string") continue;
    if (!members.has(record.node_id) || !record.role.trim()) continue;
    const values = roles.get(record.node_id) || [];
    if (!values.includes(record.role)) values.push(record.role);
    roles.set(record.node_id, values);
  }
  return roles;
}

export function normalizeHypergraph(data: WorkbenchData): HypergraphModel {
  const nodes: Entity[] = data.nodes
    .map((n) => ({
      id: n.id,
      label: n.data?.label || n.id,
      highlighted: !!n.highlighted,
      degree: 0,
    }))
    .sort((a, b) => compareId(a.id, b.id));
  const byNode = new Map(nodes.map((n) => [n.id, n]));
  const incident = new Map(nodes.map((n) => [n.id, new Set<string>()]));
  let unresolved = 0;
  const hyperedges: Hyperedge[] = data.hyperedges
    .map((e) => {
      const members = [...new Set(e.linked_nodes)].sort(compareId);
      for (const id of members) {
        if (byNode.has(id)) incident.get(id)!.add(e.id);
        else unresolved++;
      }
      return {
        id: e.id,
        label: e.data?.label || e.id,
        members: members.filter((id) => byNode.has(id)),
        highlighted: !!e.highlighted,
        color: edgeColor(e.id),
        roles: suppliedRoles(e.data?.raw, new Set(members)),
      };
    })
    .sort((a, b) => compareId(a.id, b.id));
  for (const node of nodes) node.degree = incident.get(node.id)!.size;
  // data.edges are auxiliary G6 layout links, never native pairwise facts.
  return {
    nodes,
    hyperedges,
    byNode,
    byEdge: new Map(hyperedges.map((e) => [e.id, e])),
    incident,
    unresolved,
    memberships: hyperedges.reduce((n, e) => n + e.members.length, 0),
  };
}

export interface Focus {
  nodes: Set<string>;
  edges: Set<string>;
}

export function linkedFocus(model: HypergraphModel, item?: SelectedItem | null): Focus | null {
  if (!item) return null;
  const edges =
    item.type === "hyperedge"
      ? new Set(model.byEdge.has(item.id) ? [item.id] : [])
      : new Set(model.incident.get(item.id) || []);
  if (!edges.size && !model.byNode.has(item.id)) return null;
  const nodes = new Set<string>();
  if (item.type === "node") nodes.add(item.id);
  for (const id of edges) for (const member of model.byEdge.get(id)!.members) nodes.add(member);
  return { nodes, edges };
}

export function wrapLabel(text: string, width = 10, maxLines = 3): string[] {
  const lines: string[] = [];
  let line = "",
    units = 0;
  for (const char of text) {
    const size = /[\u2e80-\uffff]/.test(char) ? 1.8 : 1;
    if (line && units + size > width) {
      lines.push(line.trim());
      line = "";
      units = 0;
      if (lines.length === maxLines) {
        lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + "…";
        return lines;
      }
    }
    line += char;
    units += size;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}
