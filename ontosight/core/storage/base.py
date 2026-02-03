"""Base storage class for all storage engines."""

from typing import Any, Dict, List, Optional


class BaseStorage:
    """Abstract base class for storage engines."""

    def get_element(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get a single element by ID."""
        raise NotImplementedError

    def get_details(self, element_id: str) -> Optional[Dict[str, Any]]:
        """Get full details of an element."""
        raise NotImplementedError

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the storage."""
        raise NotImplementedError

    def get_sample(self, center_ids: Optional[List[str]] = None, hops: int = 2, highlight_center: bool = False) -> Dict[str, Any]:
        """Get sample around given nodes.
        
        Args:
            center_ids: List of center node/element IDs
            hops: Number of hops to expand (graph/hypergraph specific)
            highlight_center: If True, mark center elements with highlighted=True
        """
        raise NotImplementedError

    def get_sample_from_data(self, *args, highlight_center: bool = False, **kwargs) -> Dict[str, Any]:
        """Get sample based on raw data objects (ItemSchema/NodeSchema/EdgeSchema).
        
        For list visualization: get_sample_from_data(item_list, highlight_center=False)
        For graph visualization: get_sample_from_data(node_list, edge_list, highlight_center=False)
        For hypergraph visualization: get_sample_from_data(node_list, hyperedge_list, highlight_center=False)
        
        Args:
            *args: Raw data objects to extract IDs from
            highlight_center: If True, mark matching elements with highlighted=True
            **kwargs: Additional keyword arguments
            
        Returns:
            Sample data around the provided elements
        """
        raise NotImplementedError
