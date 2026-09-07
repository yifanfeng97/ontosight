// SPDX-License-Identifier: Apache-2.0
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useVisualization, type SelectedItem } from "@/hooks/useVisualization";
import type { WorkbenchData } from "./model";
import { enclosureLayout, incidencePath, overviewLayout, type Point } from "./layout";
import { linkedFocus, normalizeHypergraph, wrapLabel } from "./model";
import "./workbench.css";

interface Props {
  data: WorkbenchData;
  meta: { stats?: Record<string, unknown> };
}

export default function WorkbenchHypergraphView({ data, meta }: Props) {
  const {
    selectedItems,
    selectItem,
    clearSelection,
    workbenchView,
    setWorkbenchView,
    resetTrigger,
  } = useVisualization();
  const model = useMemo(() => normalizeHypergraph(data), [data]);
  const overview = useMemo(() => overviewLayout(model), [model]);
  const selected: SelectedItem | undefined = selectedItems.values().next().value;
  const [hovered, setHovered] = useState<SelectedItem | null>(null);
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [rotation, setRotation] = useState(-Math.PI / 2);
  const [zoom, setZoom] = useState(1);
  const [readerId, setReaderId] = useState<string | null>(null);
  const [filterNodeId, setFilterNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; start: Point; origin: Point; moved: boolean } | null>(null);
  const suppressClick = useRef<string | null>(null);

  useEffect(() => {
    setPositions({});
    setRotation(-Math.PI / 2);
    setZoom(1);
    setHovered(null);
  }, [model, resetTrigger]);

  useEffect(() => {
    if (selected?.type === "node")
      setFilterNodeId(model.byNode.has(selected.id) ? selected.id : null);
    else if (selected?.type === "hyperedge" && model.byEdge.has(selected.id)) {
      setReaderId(selected.id);
      setFilterNodeId((previous) =>
        previous && model.incident.get(previous)?.has(selected.id) ? previous : null
      );
    } else {
      setFilterNodeId(null);
    }
  }, [selected?.id, selected?.type, model]);

  const readerEdges = model.hyperedges.filter(
    (e) => !filterNodeId || e.members.includes(filterNodeId)
  );
  const readerEdge = readerEdges.find((e) => e.id === readerId) || readerEdges[0];
  const enclosure = useMemo(
    () => enclosureLayout(model, readerEdge?.id || "", rotation),
    [model, readerEdge?.id, rotation]
  );
  const scene = workbenchView === "overview" ? overview : enclosure;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = () => {
      canvas.scrollLeft = (canvas.scrollWidth - canvas.clientWidth) / 2;
      canvas.scrollTop = (canvas.scrollHeight - canvas.clientHeight) / 2;
    };
    const observer = new ResizeObserver(center);
    observer.observe(canvas);
    if (svgRef.current) observer.observe(svgRef.current);
    center();
    return () => observer.disconnect();
  }, [model, workbenchView, zoom]);
  const focused = linkedFocus(model, hovered) || linkedFocus(model, selected);
  const nodePositions = new Map(
    scene.nodes.map((n) => [n.id, workbenchView === "overview" ? { ...n, ...positions[n.id] } : n])
  );
  const edgePositions = new Map(scene.edges.map((e) => [e.id, e]));
  const totalNodes = Number(meta.stats?.Nodes ?? meta.stats?.total_nodes);
  const totalEdges = Number(meta.stats?.Hyperedges ?? meta.stats?.total_hyperedges);
  const shown = (n: number, total: number) =>
    Number.isFinite(total) ? `${n} / ${total}` : String(n);
  const opacity = (kind: "nodes" | "edges", id: string) =>
    !focused || focused[kind].has(id) ? 1 : 0.16;
  const resetLayout = () => {
    setPositions({});
    setRotation(-Math.PI / 2);
    setZoom(1);
    setHovered(null);
  };
  const pick = (id: string, type: SelectedItem["type"]) => {
    if (suppressClick.current === id) {
      suppressClick.current = null;
      return;
    }
    selectItem(id, type);
  };
  const readerChoose = (id: string) => {
    setReaderId(id);
    selectItem(id, "hyperedge");
    setRotation(-Math.PI / 2);
  };
  const moveReader = (step: number) => {
    if (!readerEdges.length) return;
    const index = readerEdges.findIndex((e) => e.id === readerEdge?.id);
    readerChoose(readerEdges[(index + step + readerEdges.length) % readerEdges.length].id);
  };
  const pointer = (event: PointerEvent<SVGGElement>): Point | null => {
    const svg = svgRef.current,
      matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    return p.matrixTransform(matrix.inverse());
  };
  const beginDrag = (event: PointerEvent<SVGGElement>, id: string) => {
    if (event.button !== 0) return;
    const p = pointer(event),
      origin = nodePositions.get(id);
    if (!p || !origin) return;
    suppressClick.current = null;
    drag.current = { id, start: p, origin, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: PointerEvent<SVGGElement>) => {
    const d = drag.current,
      p = pointer(event);
    if (!d || !p) return;
    const dx = p.x - d.start.x,
      dy = p.y - d.start.y;
    if (Math.hypot(dx, dy) < 4 && !d.moved) return;
    d.moved = true;
    if (workbenchView === "enclosure") {
      const index = enclosure.nodes.findIndex((n) => n.id === d.id);
      setRotation(
        Math.atan2(p.y - enclosure.center.y, p.x - enclosure.center.x) -
          (index * 2 * Math.PI) / enclosure.nodes.length
      );
    } else
      setPositions((previous) => ({
        ...previous,
        [d.id]: {
          x: Math.max(50, Math.min(scene.width - 50, d.origin.x + dx)),
          y: Math.max(50, Math.min(scene.height - 50, d.origin.y + dy)),
        },
      }));
  };
  const finishDrag = (event: PointerEvent<SVGGElement>) => {
    if (drag.current?.moved) suppressClick.current = drag.current.id;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section className="onto-workbench" aria-label="Hypergraph workbench">
      <header className="ow-header">
        <div>
          <div className="ow-eyebrow">ONTOSIGHT / WORKBENCH</div>
          <h2>Read the relationships</h2>
        </div>
        <div className="ow-segments" role="group" aria-label="Workbench view">
          <button
            aria-pressed={workbenchView === "overview"}
            onClick={() => {
              setWorkbenchView("overview");
              setHovered(null);
            }}
          >
            Overview
          </button>
          <button
            aria-pressed={workbenchView === "enclosure"}
            onClick={() => {
              setWorkbenchView("enclosure");
              setHovered(null);
            }}
          >
            Enclosure
          </button>
        </div>
      </header>
      <div className="ow-summary" aria-label="Displayed data counts">
        <span>
          Showing <strong>{shown(model.nodes.length, totalNodes)}</strong> nodes
        </span>
        <span>
          <strong>{shown(model.hyperedges.length, totalEdges)}</strong> hyperedges
        </span>
        <span>
          <strong>{model.memberships}</strong> displayed memberships
        </span>
      </div>
      {model.unresolved > 0 && (
        <p className="ow-warning" role="status">
          {model.unresolved} member references are missing from this sample.
        </p>
      )}
      {selected && !linkedFocus(model, selected) && (
        <p className="ow-warning" role="status">
          The selected item is outside this sample. Its details remain in history.
        </p>
      )}
      <div className="ow-controls">
        <span>
          {workbenchView === "overview"
            ? "Hover to trace · select for details · drag to arrange"
            : "One native hyperedge · drag a member to rotate"}
        </span>
        <div>
          <button
            onClick={() => {
              clearSelection();
              setFilterNodeId(null);
              setHovered(null);
            }}
          >
            Clear selection
          </button>
          <button
            aria-label="Zoom out workbench"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            −
          </button>
          <button
            aria-label="Zoom in workbench"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            +
          </button>
          <button
            onClick={resetLayout}
            title="Restore this layout without requesting another sample"
          >
            Reset layout
          </button>
        </div>
      </div>
      {workbenchView === "enclosure" && (
        <div className="ow-reader">
          <button
            aria-label="Previous hyperedge"
            disabled={!readerEdges.length}
            onClick={() => moveReader(-1)}
          >
            ←
          </button>
          <select
            aria-label="Hyperedge to read"
            value={readerEdge?.id || ""}
            onChange={(event) => readerChoose(event.target.value)}
          >
            {!readerEdges.length && <option value="">No incident hyperedges in this sample</option>}
            {readerEdges.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label} · {e.members.length} members
              </option>
            ))}
          </select>
          <button
            aria-label="Next hyperedge"
            disabled={!readerEdges.length}
            onClick={() => moveReader(1)}
          >
            →
          </button>
          {filterNodeId && (
            <button
              onClick={() => {
                clearSelection();
                setFilterNodeId(null);
              }}
            >
              All displayed hyperedges
            </button>
          )}
        </div>
      )}
      <div ref={canvasRef} className="ow-canvas" tabIndex={0} aria-label="Scrollable hypergraph canvas">
        {!model.nodes.length && !model.hyperedges.length ? (
          <p className="ow-empty">No nodes or hyperedges in this sample.</p>
        ) : workbenchView === "enclosure" && !readerEdge ? (
          <p className="ow-empty">No incident hyperedges. Use Overview to see isolated nodes.</p>
        ) : (
          <svg
            ref={svgRef}
            className="ow-svg"
            role="group"
            aria-label={
              workbenchView === "overview"
                ? "Capsule hypergraph overview"
                : "Single hyperedge enclosure"
            }
            viewBox={`0 0 ${scene.width} ${scene.height}`}
            style={{
              width: `${zoom * 100}%`,
              minWidth: `${900 * zoom}px`,
              minHeight: `${450 * zoom}px`,
            }}
            onPointerLeave={() => {
              if (!drag.current) setHovered(null);
            }}
          >
            <title>
              Native hypergraph memberships. Lines connect entities to their hyperedges.
            </title>
            {workbenchView === "overview" &&
              scene.links.map((link) => {
                const n = nodePositions.get(link.nodeId)!,
                  e = edgePositions.get(link.edgeId)!;
                const edge = model.byEdge.get(link.edgeId)!;
                const active = !focused || focused.edges.has(link.edgeId);
                return (
                  <path
                    key={JSON.stringify([link.edgeId, link.nodeId])}
                    d={incidencePath(n, e)}
                    stroke={edge.color}
                    className="ow-incidence"
                    opacity={active ? 0.7 : 0.06}
                    data-edge-id={edge.id}
                    data-node-id={n.id}
                  />
                );
              })}
            {workbenchView === "enclosure" && readerEdge && (
              <g
                className="ow-enclosure"
                style={{ "--edge-color": readerEdge.color } as CSSProperties}
              >
                <circle
                  cx={enclosure.center.x}
                  cy={enclosure.center.y}
                  r={enclosure.radius}
                  className="ow-boundary"
                  tabIndex={0}
                  role="button"
                  aria-label={`Select hyperedge ${readerEdge.label}`}
                  aria-pressed={selected?.id === readerEdge.id && selected.type === "hyperedge"}
                  onClick={() => pick(readerEdge.id, "hyperedge")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      pick(readerEdge.id, "hyperedge");
                    }
                  }}
                />
              </g>
            )}
            {scene.edges.map((mark) => {
              const edge = model.byEdge.get(mark.id)!;
              const lines = wrapLabel(edge.label, 20, 2);
              return (
                <g
                  key={edge.id}
                  transform={`translate(${mark.x} ${mark.y})`}
                  className={`ow-hyperedge${edge.highlighted ? " is-hit" : ""}${selected?.id === edge.id && selected.type === "hyperedge" ? " is-selected" : ""}`}
                  style={{ "--edge-color": edge.color } as CSSProperties}
                  opacity={workbenchView === "overview" ? opacity("edges", edge.id) : 1}
                  data-hyperedge-id={edge.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Hyperedge ${edge.label}, ${edge.members.length} members`}
                  aria-pressed={selected?.id === edge.id && selected.type === "hyperedge"}
                  onClick={() => pick(edge.id, "hyperedge")}
                  onMouseEnter={() => setHovered({ id: edge.id, type: "hyperedge" })}
                  onMouseLeave={() => setHovered(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      pick(edge.id, "hyperedge");
                    }
                  }}
                >
                  <title>
                    {edge.label}\n{edge.members.length} distinct members\n{edge.id}
                  </title>
                  <rect x={-mark.width / 2} y={-24} width={mark.width} height={48} rx={24} />
                  <text textAnchor="middle" className="ow-edge-label">
                    {lines.map((line, i) => (
                      <tspan x={0} y={(i - (lines.length - 1) / 2) * 15 + 5} key={i}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                  {mark.code && (
                    <text x={0} y={-33} textAnchor="middle" className="ow-edge-code">
                      {mark.code}
                    </text>
                  )}
                </g>
              );
            })}
            {[...nodePositions.values()].map((mark) => {
              const node = model.byNode.get(mark.id)!;
              const lines = wrapLabel(node.label, 9, 3);
              const roles =
                workbenchView === "enclosure" ? readerEdge?.roles.get(node.id) : undefined;
              return (
                <g
                  key={node.id}
                  transform={`translate(${mark.x} ${mark.y})`}
                  data-entity-id={node.id}
                  className={`ow-entity${node.highlighted ? " is-hit" : ""}${selected?.id === node.id && selected.type === "node" ? " is-selected" : ""}`}
                  opacity={workbenchView === "overview" ? opacity("nodes", node.id) : 1}
                  tabIndex={0}
                  role="button"
                  aria-label={`Node ${node.label}, ${node.degree} incident hyperedges in this sample`}
                  aria-pressed={selected?.id === node.id && selected.type === "node"}
                  onClick={() => pick(node.id, "node")}
                  onMouseEnter={() => setHovered({ id: node.id, type: "node" })}
                  onMouseLeave={() => {
                    if (!drag.current) setHovered(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      suppressClick.current = null;
                      pick(node.id, "node");
                    }
                  }}
                  onPointerDown={(event) => beginDrag(event, node.id)}
                  onPointerMove={moveDrag}
                  onPointerUp={finishDrag}
                  onPointerCancel={finishDrag}
                >
                  <title>
                    {node.label}\n{node.id}
                    {roles ? `\n${roles.join(" / ")}` : ""}
                  </title>
                  {node.degree > 1 && <circle r={mark.radius + 7} className="ow-shared" />}
                  <circle r={mark.radius} className="ow-node-circle" />
                  <text textAnchor="middle" className="ow-node-label">
                    {lines.map((line, i) => (
                      <tspan x={0} y={(i - (lines.length - 1) / 2) * 14 + 4.5} key={i}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                  {roles && (
                    <text textAnchor="middle" y={mark.radius + 24} className="ow-role-label">
                      {wrapLabel(roles.join(" / "), 22, 1)[0]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <footer className="ow-legend">
        <span>
          <i className="ow-dot" /> Entity
        </span>
        <span>
          <i className="ow-pill" /> Native hyperedge
        </span>
        <span>Dashed ring: shared entity</span>
        <span>Connectivity is measured within this sample.</span>
      </footer>
    </section>
  );
}
