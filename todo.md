# The Nexus Scholar - Project TODO

## Phase 1: Core Infrastructure ✅
- [x] Create notes table with title, content, metadata
- [x] Create links table for bidirectional relationships
- [x] Create TV-Object types table for TVAS framework
- [x] Add indexes for performance
- [x] Implement notes CRUD operations (create, read, update, delete)
- [x] Implement link creation with automatic bidirectional linking
- [x] Implement link deletion with cleanup
- [x] Implement graph data retrieval (nodes and edges)
- [x] Add wiki-link parsing to extract [[links]] from note content
- [x] Create note list/sidebar component
- [x] Create markdown editor with preview
- [x] Implement wiki-style linking with [[note]] syntax
- [x] Add note creation/editing UI
- [x] Add note deletion with confirmation
- [x] Set up D3.js for graph rendering
- [x] Implement force-directed layout
- [x] Add node click navigation to notes
- [x] Add zoom and pan controls
- [x] Style nodes and edges
- [x] Design color scheme and typography
- [x] Create responsive layout
- [x] Add loading states
- [x] Add error handling and user feedback

## Phase 1.5: TVAS Framework Enhancements ✅
- [x] Create seed data script with French Revolution TV-Objects
- [x] Add sample actors (Louis XVI, Robespierre, Third Estate)
- [x] Add sample events (Storming of Bastille, Tennis Court Oath)
- [x] Add sample conditions (National Debt, Social Inequality)
- [x] Add sample ideologies (Enlightenment Principles)
- [x] Create links between related notes
- [x] Add TV-Object type selector dropdown in note editor
- [x] Create structured attribute forms for each TV-Object type
- [x] Display TV-Object attributes in note view
- [x] Update graph to show TV-Object type badges
- [x] Add manual link creation UI with relationship type selector
- [x] Display relationship types in link list
- [x] Show relationship type labels on graph edges
- [x] Add predefined relationship types (IS_SUPPORTED_BY, CRITIQUES, etc.)

## Bug Fixes ✅
- [x] Fix note creation errors in the UI
- [x] Debug and resolve any console errors

## Phase 2: Advanced Graph Visualization 🚧

### Multiple Layout Algorithms
- [x] Add hierarchical/tree layout for temporal or causal structures
- [x] Add circular layout for showing relationships
- [x] Add grid layout for organized viewing
- [x] Add radial layout centered on selected node
- [x] Create layout selector UI in graph toolbar
- [x] Smooth transitions between layout changes

### Graph Filtering & Search
- [x] Add filter panel for TV-Object types (show/hide by type)
- [ ] Add filter for relationship types
- [x] Add search bar to find and highlight nodes
- [x] Implement node highlighting on search
- [ ] Add "focus mode" to show only connected nodes
- [ ] Add time-based filtering (if temporal data exists)

### Graph Analytics
- [x] Calculate and display degree centrality
- [x] Calculate betweenness centrality
- [x] Calculate closeness centrality
- [x] Implement community detection (clustering)
- [x] Add shortest path finder between two nodes
- [x] Display path on graph with highlighting
- [x] Show analytics results in side panel

### Graph Export & Statistics
- [x] Export graph as SVG image
- [ ] Export graph data as JSON
- [ ] Export adjacency matrix as CSV
- [x] Add statistics panel (node count, edge count, density, avg degree)
- [ ] Show distribution charts for TV-Object types
- [ ] Add graph metrics dashboard

### UX Enhancements
- [ ] Add minimap for navigation
- [ ] Add node labels toggle
- [ ] Add edge labels toggle
- [ ] Improve node tooltips with full attributes
- [ ] Add double-click to expand/collapse connected nodes
- [ ] Add right-click context menu on nodes

## Phase 3: Data Import & Integration (Future)
- [ ] CSV import with column mapping
- [ ] JSON import with schema validation
- [ ] Zotero integration for bibliography
- [ ] PDF annotation linking
- [ ] Bulk operations interface

## Phase 4: MCP Server & Docker (Future)
- [ ] Design MCP server API
- [ ] Implement graph database (Neo4j/ArangoDB)
- [ ] Create Docker Compose setup
- [ ] MCP operations for all CRUD
- [ ] Graph query operations via MCP


## Phase 3: Data Import & Timeline Visualization 🚧

### CSV/JSON Import
- [x] Create Import page with file upload component
- [x] Parse CSV files and display preview
- [x] Parse JSON files and validate structure
- [x] Build column mapping interface
- [x] Map columns to TV-Object types and attributes
- [ ] Handle relationship creation from reference columns
- [x] Implement bulk note creation API
- [x] Add progress indicator for import
- [x] Show import summary with created notes count

### Timeline Visualization
- [ ] Create Timeline page component
- [ ] Filter Event-type notes with dates
- [ ] Build horizontal timeline with D3.js
- [ ] Display events chronologically
- [ ] Add zoom and pan for timeline navigation
- [ ] Show event details on hover/click
- [ ] Add temporal range filter
- [ ] Connect timeline events to graph view
- [ ] Support multiple timeline scales (year, month, day)
- [ ] Add "jump to date" feature
