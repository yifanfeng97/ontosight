import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@/services/api", () => ({ apiClient: { getData: vi.fn(), getDetails: vi.fn() } }));
import { apiClient } from "@/services/api";
import { useVisualization } from "./useVisualization";

beforeEach(() => {
  useVisualization.setState(useVisualization.getInitialState(), true);
  vi.clearAllMocks();
});

it("defaults to classic and switches style without refetching or losing selection/history", () => {
  expect(useVisualization.getState().hypergraphStyle).toBe("classic");
  const data = { nodes: [{ id: "a" }], hyperedges: [] };
  useVisualization.getState().setData(data);
  useVisualization.getState().selectItem("a", "node");
  const before = useVisualization.getState();
  useVisualization.getState().setHypergraphStyle("workbench");
  useVisualization.getState().setWorkbenchView("enclosure");
  useVisualization.getState().setHypergraphStyle("classic");
  const after = useVisualization.getState();
  expect(after.data).toBe(before.data);
  expect(after.selectedItems).toBe(before.selectedItems);
  expect(after.viewedHistory).toBe(before.viewedHistory);
  expect(after.resetTrigger).toBe(before.resetTrigger);
  expect(after.viewMode).toBe(before.viewMode);
  expect(apiClient.getData).not.toHaveBeenCalled();
});
