import { useVisualization } from "@/hooks/useVisualization";

export default function HypergraphStyleSwitcher() {
  const { hypergraphStyle, setHypergraphStyle } = useVisualization();
  return (
    <div className="onto-style-picker" role="group" aria-label="Hypergraph style">
      <button
        aria-pressed={hypergraphStyle === "classic"}
        onClick={() => setHypergraphStyle("classic")}
      >
        Classic
      </button>
      <button
        aria-pressed={hypergraphStyle === "workbench"}
        onClick={() => setHypergraphStyle("workbench")}
      >
        Workbench
      </button>
    </div>
  );
}
