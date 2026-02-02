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

    def get_sample(self, center_ids: Optional[List[str]] = None, hops: int = 2) -> Dict[str, Any]:
        """Get sample around given nodes."""
        raise NotImplementedError

    def get_sample_from_data(self, *args, **kwargs) -> Dict[str, Any]:
        """Get sample based on raw data objects (ItemSchema/NodeSchema/EdgeSchema).
        
        For list visualization: get_sample_from_data(item_list)
        For graph visualization: get_sample_from_data(node_list, edge_list)
        For hypergraph visualization: get_sample_from_data(node_list, hyperedge_list)
        
        Args:
            *args: Raw data objects to extract IDs from
            **kwargs: Additional keyword arguments
            
        Returns:
            Sample data around the provided elements
        """
        raise NotImplementedError
