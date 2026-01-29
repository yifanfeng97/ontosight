# API Contracts

**Status**: ✅ Phase 1 Complete | **Coverage**: 13 types + 4 endpoints

---

## Overview

OntoSight defines formal contracts between backend and frontend through:
1. **Pydantic Models** (Python backend) - Backend validation + serialization
2. **TypeScript Interfaces** (Frontend) - Type-safe client code
3. **JSON Schemas** - Runtime metadata export
4. **Contract Tests** - Validation that contracts are upheld

This directory contains the official contract specifications.

---

## Files

### `api.openapi.yaml`

**OpenAPI 3.0 Specification** for the REST API

**Endpoints Defined**:
- `HEAD /api/health` - Service health check
- `GET /api/meta` - JSON Schema export
- `GET /api/data` - Visualization data retrieval
- `POST /api/search` - Text search interface
- `POST /api/chat` - Chat query interface

**Schemas**:
- Core types: `Node[T]`, `Edge[T]`, `TreeNode[T]`, `HyperEdge[T]`
- API types: `Meta`, `VisualizationData`, `SearchRequest/Response`, `ChatRequest/Response`
- Error type: `ErrorResponse`

**Usage**:
- OpenAPI tooling: Generate client SDKs, documentation
- API documentation: View in Swagger UI or ReDoc
- Contract validation: Validate responses against spec

### `types.ts`

**TypeScript Type Definitions** for all API types

**Types Exported** (13 interfaces):
- `Node<T>`, `Edge<T>`, `TreeNode<T>`, `HyperEdge<T>` (core models)
- `Meta`, `SearchRequest`, `SearchResponse` (API models)
- `ChatRequest`, `ChatResponse` (Chat models)
- `VisualizationData` (payload model)
- `ErrorResponse` (error handling)

**Utilities**:
- Type aliases: `GraphData`, `TreeData`, `TableData`, `HypergraphData`
- Type guards: `isNode()`, `isEdge()`, `isTreeNode()`, `isHyperEdge()`
- API client interface: `IApiClient`

**Usage**:
- Import in React components for type safety
- Reference documentation for type structure
- Use type guards for runtime validation

---

## Contract Guarantees

### Type Mapping

| Pydantic (Python) | TypeScript | JSON | Notes |
|---|---|---|---|
| `Node[T]` | `Node<T>` | `{id, data, label}` | Generic over data |
| `Edge[T]` | `Edge<T>` | `{source, target, data, label}` | Generic over data |
| `TreeNode[T]` | `TreeNode<T>` | `{id, data, label, children}` | Recursive structure |
| `HyperEdge[T]` | `HyperEdge<T>` | `{nodes[], data, label}` | Min 2 nodes |
| `BaseModel` | `Record<string, any>` | JSON object | Serializable |
| `Optional[T]` | `T \| null` | `null` | Optional field |
| `List[T]` | `T[]` | Array | Homogeneous collection |

### Serialization Contract

```
Python Model → model_dump_json() → JSON String → JSON.parse() → TypeScript Object
```

**Guarantees**:
- ✓ No data loss (round-trip fidelity)
- ✓ Type preservation (numbers stay numbers, not strings)
- ✓ Recursive structures preserved (TreeNode children)
- ✓ Optional fields serialize to `null`
- ✓ Complex objects flatten to JSON-serializable dicts

**Validation**: [test_api_contracts.py](../tests/contract/test_api_contracts.py) (22 tests)

### Optional Field Handling

**Rule**: Optional fields serialize to explicit `null`

```typescript
// Request with optional field
const req: SearchRequest = {
  query: "test",
  context: null  // Not omitted, explicitly null
};

// Response with optional field
const resp: ChatResponse = {
  response: "answer",
  sources: ["node_1"]  // Can be present or null
};
```

### Error Handling

**Contract**: 
- All errors return `ErrorResponse` with `status`, `error`, `detail`
- HTTP status codes match error type (404 for not found, 400 for bad request)
- Error `detail` field provides context-specific information

```typescript
interface ErrorResponse {
  error: string;      // Short error type ("Not Found")
  detail?: string;    // Context-specific message
  status: number;     // HTTP status code
}
```

---

## Endpoint Contracts

### `HEAD /api/health`

**Purpose**: Determine if service is available

**Request**: None

**Response**:
- `200` - Service healthy
- `503` - Service unavailable

**Timeout**: 5 seconds

---

### `GET /api/meta`

**Purpose**: Export JSON Schemas for dynamic UI generation

**Request**: None

**Response**:
```typescript
{
  node_schema: JsonSchema,     // Pydantic schema for nodes
  edge_schema: JsonSchema,     // Pydantic schema for edges
  item_schema: JsonSchema,     // Pydantic schema for tree items
  hyperedge_schema: JsonSchema // Pydantic schema for hyperedges
}
```

**Errors**:
- `404` - No visualization loaded
- `500` - Server error

**Usage**: Frontend calls on app startup to configure property panels

---

### `GET /api/data`

**Purpose**: Retrieve complete visualization data

**Request**: None

**Response**:
```typescript
{
  nodes: Node[],
  edges: Edge[],
  items: TreeNode[],
  hyperedges: HyperEdge[]
}
```

**Errors**:
- `404` - No visualization loaded
- `500` - Server error

**Usage**: Frontend calls to render visualization

---

### `POST /api/search`

**Purpose**: Full-text search interface

**Request**:
```typescript
{
  query: string,
  context?: {[key: string]: any}
}
```

**Response**:
```typescript
{
  results: string[]  // Array of matching node IDs
}
```

**Errors**:
- `400` - Invalid query format
- `500` - Server error

**Usage**: Search panel for finding nodes by text

---

### `POST /api/chat`

**Purpose**: Chat interface for querying visualization

**Request**:
```typescript
{
  query: string,
  context?: {[key: string]: any}
}
```

**Response**:
```typescript
{
  response: string,
  sources?: string[]  // Optional: node IDs referenced
}
```

**Errors**:
- `400` - Invalid request format
- `500` - Server error

**Usage**: Chat panel for conversational querying

---

## Type Safety Guarantees

### Compile-Time Safety

All TypeScript types have:
- ✓ Required fields enforced at compile time
- ✓ Generic parameters enable flexible typing
- ✓ Optional fields marked with `| null`
- ✓ Discriminated unions for type narrowing

### Runtime Validation

All API responses include:
- ✓ Type guards for runtime verification
- ✓ Error handling for malformed responses
- ✓ Timeout protection (30 seconds)
- ✓ Retry logic for transient failures

### Contract Validation

Test coverage includes:
- ✓ Pydantic → JSON round-trip (22 tests)
- ✓ Type preservation (strings, numbers, booleans)
- ✓ Recursive structure fidelity (TreeNode)
- ✓ Optional field handling (null)
- ✓ Error scenarios (invalid JSON, missing fields)

---

## Integration Checklist

- [x] Pydantic models defined + documented
- [x] TypeScript interfaces defined + documented
- [x] OpenAPI specification defined
- [x] Contract tests written (22 tests)
- [x] All tests passing (100%)
- [x] Error handling documented
- [x] Type guards implemented
- [x] API client type-safe (in api.ts)

---

## Contract Evolution

### Versioning

Contracts use **semantic versioning**:
- Major: Breaking changes (new required field, type change)
- Minor: Non-breaking additions (new optional field)
- Patch: Documentation/tooling updates

### Backward Compatibility

- ✓ Adding optional fields is safe
- ✗ Removing/renaming required fields breaks contract
- ✗ Changing field types breaks contract
- ✓ Adding new endpoints is safe

### Migration Path

If contract changes are needed:
1. Increment API version in spec
2. Support both old and new endpoints
3. Update TypeScript types
4. Update contract tests
5. Communicate deprecation to users

---

## References

- **OpenAPI Spec**: `api.openapi.yaml`
- **Type Definitions**: `types.ts`
- **Contract Tests**: `../tests/contract/test_api_contracts.py`
- **API Client**: `../frontend/src/services/api.ts`
- **Pydantic Models**: `../ontosight/models.py`, `../ontosight/server/models/api.py`

---

## Support

- **Questions**: See inline documentation in `types.ts` and `api.openapi.yaml`
- **Issues**: Check contract tests in `test_api_contracts.py`
- **Examples**: See JSDoc examples in `types.ts`

---

*OntoSight API Contracts | Phase 1 | Formal Specification*
