import { describe, expect, it } from "vitest";
import type { WorkbenchData } from "./model";
import { normalizeHypergraph, linkedFocus, wrapLabel } from "./model";
import { enclosureLayout, overviewLayout, incidencePath } from "./layout";

const fixture = (): WorkbenchData => ({
  nodes: ["a", "b", "c", "isolated"].map((id) => ({ id, data: { label: id, raw: {} } })),
  edges: [{ id: "layout-only", source: "a", target: "b" }],
  hyperedges: [
    {
      id: "h1",
      linked_nodes: ["a", "a", "b"],
      data: {
        label: "Shared label",
        raw: {
          membership_records: [
            { node_id: "a", role: "author" },
            { node_id: "a", role: "editor" },
          ],
        },
      },
    },
    {
      id: "h2",
      linked_nodes: ["a", "b"],
      highlighted: true,
      data: { label: "Shared label", raw: {} },
    },
    { id: "h3", linked_nodes: ["c"], data: { label: "Disconnected", raw: {} } },
  ],
});

describe("native hypergraph presentation", () => {
  it("separates crowded capsules while preserving every membership", () => {
    const nodes = ["hub", ...Array.from({length:18}, (_,i) => `n${i}`)].map(id => ({id, data:{label:id,raw:{}}}));
    const hyperedges = nodes.slice(1).map((n,i) => ({id:`h${i}`,linked_nodes:["hub",n.id],data:{label:`Long relation ${i}`,raw:{}}}));
    const scene = overviewLayout(normalizeHypergraph({nodes,hyperedges}));
    expect(scene.links).toHaveLength(36);
    for (let i=0;i<scene.edges.length;i++) for(let j=i+1;j<scene.edges.length;j++) {
      const a=scene.edges[i],b=scene.edges[j];
      expect(Math.abs(a.x-b.x) >= (a.width+b.width)/2 || Math.abs(a.y-b.y) >= 48).toBe(true);
    }
  });
  it("keeps distinct IDs and supplied roles without counting repeated members twice", () => {
    const input = fixture(),
      original = structuredClone(input),
      model = normalizeHypergraph(input);
    expect(model.hyperedges).toHaveLength(3);
    expect(model.memberships).toBe(5);
    expect(model.byNode.get("a")?.degree).toBe(2);
    expect(model.byEdge.get("h1")?.roles.get("a")).toEqual(["author", "editor"]);
    expect(model.byEdge.get("h2")?.highlighted).toBe(true);
    expect(input).toEqual(original);
    expect(overviewLayout(model).links).toHaveLength(5);
  });
  it("keeps all members of incident hyperedges while isolating unrelated links", () => {
    const model = normalizeHypergraph(fixture());
    expect(linkedFocus(model, { id: "a", type: "node" })).toEqual({
      nodes: new Set(["a", "b"]),
      edges: new Set(["h1", "h2"]),
    });
    expect(linkedFocus(model, { id: "h1", type: "hyperedge" })?.edges).toEqual(new Set(["h1"]));
    expect(linkedFocus(model, { id: "isolated", type: "node" })?.nodes).toEqual(
      new Set(["isolated"])
    );
    expect(linkedFocus(model, { id: "missing", type: "hyperedge" })).toBeNull();
  });
  it("preserves disconnected and isolated nodes with order-independent finite geometry", () => {
    const input = fixture(),
      reverse = structuredClone(input);
    reverse.nodes.reverse();
    reverse.hyperedges.reverse();
    reverse.hyperedges.forEach((e) => e.linked_nodes.reverse());
    const scene = overviewLayout(normalizeHypergraph(input));
    expect(overviewLayout(normalizeHypergraph(reverse))).toEqual(scene);
    expect(new Set(scene.nodes.map((n) => n.id))).toEqual(new Set(input.nodes.map((n) => n.id)));
    expect(scene.links.filter((l) => l.edgeId === "h3")).toEqual([{ edgeId: "h3", nodeId: "c" }]);
    expect(scene.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y))).toBe(true);
    for (const link of scene.links)
      expect(
        incidencePath(
          scene.nodes.find((n) => n.id === link.nodeId)!,
          scene.edges.find((e) => e.id === link.edgeId)!
        )
      ).not.toMatch(/NaN|Infinity/);
  });
  it("keeps two-member hyperedges on opposite points of one enclosure", () => {
    const model = normalizeHypergraph(fixture()),
      scene = enclosureLayout(model, "h1");
    expect(scene.nodes).toHaveLength(2);
    expect(scene.edges).toHaveLength(1);
    for (const node of scene.nodes)
      expect(Math.hypot(node.x - scene.center.x, node.y - scene.center.y)).toBeCloseTo(
        scene.radius
      );
    const rotated = enclosureLayout(model, "h1", 1.25);
    expect(rotated.nodes.map((n) => n.id)).toEqual(scene.nodes.map((n) => n.id));
    expect(rotated.radius).toBe(scene.radius);
  });
  it("reports unresolved references and handles empty and isolated-only inputs", () => {
    const input = fixture();
    input.hyperedges[0].linked_nodes.push("unknown");
    expect(normalizeHypergraph(input).unresolved).toBe(1);
    expect(
      overviewLayout(normalizeHypergraph({ nodes: [], hyperedges: [], edges: [] })).nodes
    ).toEqual([]);
    expect(overviewLayout(normalizeHypergraph({ ...input, hyperedges: [] })).nodes).toHaveLength(4);
  });
  it("wraps long Chinese labels and preserves complete source values", () => {
    const text = "联合研究工作坊中的长期合作关系与数据共享计划";
    expect(wrapLabel(text, 9, 3)).toHaveLength(3);
    expect(wrapLabel(text, 9, 3)[2]).toMatch(/…$/);
  });
});
