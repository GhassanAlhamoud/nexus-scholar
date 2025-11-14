# The Nexus Scholar - Project TODO

## Phase 1: Core Infrastructure & Foundation

### Database Schema
- [x] Create notes table with title, content, metadata
- [x] Create links table for bidirectional relationships
- [x] Create TV-Object types table for TVAS framework
- [x] Add indexes for performance

### Backend API (tRPC)
- [x] Implement notes CRUD operations (create, read, update, delete)
- [x] Implement link creation with automatic bidirectional linking
- [x] Implement link deletion with cleanup
- [x] Implement graph data retrieval (nodes and edges)
- [x] Add wiki-link parsing to extract [[links]] from note content

### Frontend - Note Editor
- [x] Create note list/sidebar component
- [x] Create markdown editor with preview
- [x] Implement wiki-style linking with [[note]] syntax
- [ ] Add autocomplete for note links (future enhancement)
- [x] Add note creation/editing UI
- [x] Add note deletion with confirmation

### Frontend - Graph Visualization
- [x] Set up D3.js for graph rendering
- [x] Implement force-directed layout
- [x] Add node click navigation to notes
- [x] Add zoom and pan controls
- [x] Style nodes and edges

### UI/UX
- [x] Design color scheme and typography
- [x] Create responsive layout
- [x] Add loading states
- [x] Add error handling and user feedback

## Phase 2: Graph Visualization & TVAS Object Modeling (Future)
- [ ] Multiple layout algorithms (hierarchical, timeline, circular)
- [ ] Interactive filtering by type, tags, date
- [ ] Visual encoding (size by connections, color by type)
- [ ] Local graph view for contextual connections
- [ ] TV-Object type system with schemas
- [ ] Research-specific relationship types

## Phase 3: Analytical Engine & Data Integration (Future)
- [ ] Graph algorithms (centrality, community detection, pathfinding)
- [ ] Argument mapping visualization
- [ ] CSV/JSON import with mapping interface
- [ ] Zotero/Mendeley integration
- [ ] PDF annotation and linking
- [ ] Web clipper browser extension

## Phase 4: Advanced TVAS & Publishing Tools (Future)
- [ ] TV-Axiom validation and enforcement
- [ ] Command palette for operations
- [ ] Custom TV-Operation support
- [ ] Long-form writing mode
- [ ] Cite-as-you-write functionality
- [ ] Multi-format export (Word, PDF, Markdown)
- [ ] Graph visualization export


## Phase 1.5: TVAS Framework Enhancements

### French Revolution Example Data
- [x] Create seed data script with French Revolution TV-Objects
- [x] Add sample actors (Louis XVI, Robespierre, Third Estate)
- [x] Add sample events (Storming of Bastille, Tennis Court Oath)
- [x] Add sample conditions (National Debt, Social Inequality)
- [x] Add sample ideologies (Enlightenment Principles)
- [x] Create links between related notes

### TV-Object Type System
- [x] Add TV-Object type selector dropdown in note editor
- [x] Create structured attribute forms for each TV-Object type
- [x] Display TV-Object attributes in note view
- [x] Update graph to show TV-Object type badges

### Relationship Type Editor
- [x] Add manual link creation UI with relationship type selector
- [x] Display relationship types in link list
- [x] Show relationship type labels on graph edges
- [x] Add predefined relationship types (IS_SUPPORTED_BY, CRITIQUES, etc.)


## Bug Fixes
- [x] Fix note creation errors in the UI
- [x] Debug and resolve any console errors

## Phase 2: Data Import & Graph Analytics

### CSV/JSON Import
- [ ] Create import page with file upload
- [ ] Build column mapping interface for CSV
- [ ] Add JSON structure validation
- [ ] Map imported data to TV-Object types
- [ ] Bulk create notes from imported data
- [ ] Create links based on reference columns

### Graph Algorithms
- [ ] Implement centrality analysis (degree, betweenness, closeness)
- [ ] Add community detection algorithm
- [ ] Implement shortest path finding between notes
- [ ] Add graph statistics panel (node count, edge count, density)
- [ ] Create algorithm results visualization
- [ ] Export algorithm results to CSV

### GitHub Integration
- [ ] Push code to GitHub repository
- [ ] Add comprehensive README.md
- [ ] Document installation and setup
