# The Nexus Scholar

> A PhD research assistant built on the TVAS framework with advanced knowledge graph visualization and analytics

![The Nexus Scholar](https://img.shields.io/badge/TVAS-Framework-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![D3.js](https://img.shields.io/badge/D3.js-7-orange)

The Nexus Scholar transforms your notes, data, and literature into a dynamic, queryable knowledge graph. Built specifically for academics engaged in literature reviews, data analysis, and long-form scholarly writing.

## ✨ Features

### 📝 Note-Taking with Bidirectional Linking
- **Wiki-style linking** with `[[note title]]` syntax
- Automatic bidirectional link creation
- Markdown editor with live preview
- Rich text support with GitHub-flavored markdown

### 🎯 TVAS Framework Integration
- **7 TV-Object types**: Actor, Event, Condition, Ideology, Source, Claim, Method
- Structured attribute forms for each type
- **16 semantic relationship types**: IS_SUPPORTED_BY, CRITIQUES, IS_CAUSED_BY, etc.
- Manual relationship editor with type specification

### 📊 Advanced Graph Visualization
- **5 layout algorithms**:
  - Force-directed (physics-based)
  - Hierarchical (tree structure)
  - Circular (relationship ring)
  - Grid (organized matrix)
  - Radial (centered on selected node)
- Real-time search and node highlighting
- Type-based filtering
- Interactive zoom, pan, and drag

### 🔬 Graph Analytics Engine
- **Centrality analysis**:
  - Degree centrality (most connected nodes)
  - Betweenness centrality (bridge nodes)
  - Closeness centrality (central nodes)
- **Community detection** (clustering algorithm)
- **Shortest path finder** with visualization
- Graph statistics (density, average degree, etc.)

### 📈 Research Tools
- French Revolution example dataset (15 interconnected notes)
- SVG graph export
- Statistics dashboard
- Color-coded nodes by TV-Object type

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- MySQL/TiDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GhassanAlhamoud/nexus-scholar.git
   cd nexus-scholar
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The project uses Manus platform environment variables. If running locally, create a `.env` file:
   ```env
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_jwt_secret
   # ... other environment variables
   ```

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Loading Example Data

1. Sign in to the application
2. Find your user ID in the database (Management UI → Database → users table)
3. Run the seed script:
   ```bash
   node scripts/seed-french-revolution.mjs <YOUR_USER_ID>
   ```

This creates 15 example notes about the French Revolution demonstrating the TVAS framework.

## 📖 Usage Guide

### Creating Notes

1. Click **"New Note"** in the Notes page
2. Enter a title and content in Markdown
3. Select a **TV-Object type** (optional)
4. Fill in structured attributes for the selected type
5. Use `[[Note Title]]` syntax to link to other notes
6. Click **"Save"**

### Managing Relationships

1. Open a note in the editor
2. Use the **right sidebar** to view existing relationships
3. Click **"Add Relationship"** to create manual links
4. Select target note and relationship type
5. Links appear in both notes (bidirectional)

### Exploring the Graph

1. Navigate to the **Graph** page
2. Choose a layout algorithm from the dropdown
3. Use the **search bar** to find specific nodes
4. Click **"Filters"** to show/hide TV-Object types
5. Click **"Analytics"** to run graph analysis
6. Click **"Stats"** to view graph statistics

### Running Analytics

1. Open the **Analytics panel**
2. Select an analysis type:
   - **Degree Centrality**: Find most connected notes
   - **Betweenness**: Identify bridge concepts
   - **Closeness**: Discover central ideas
   - **Communities**: Detect topic clusters
   - **Shortest Path**: Find connections between concepts
3. Click **"Run Analysis"**
4. View results and highlighted nodes

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- D3.js for graph visualization
- TailwindCSS 4 + shadcn/ui components
- tRPC for type-safe API calls
- Wouter for routing

**Backend:**
- Express 4 server
- tRPC 11 for API layer
- Drizzle ORM for database
- MySQL/TiDB database
- Manus OAuth authentication

**Key Files:**
- `drizzle/schema.ts` - Database schema
- `server/routers.ts` - tRPC API endpoints
- `server/db.ts` - Database query helpers
- `client/src/pages/Notes.tsx` - Note editor
- `client/src/pages/Graph.tsx` - Graph visualization
- `client/src/lib/graphAnalytics.ts` - Analytics algorithms
- `shared/tvobjects.ts` - TVAS framework definitions

## 📚 TVAS Framework

The **Textual Visual Algebraic System (TVAS)** is a formal framework for knowledge modeling in humanities research. It defines:

### TV-Objects (7 types)

1. **Actor** - Individuals, groups, or entities that perform actions
2. **Event** - Discrete occurrences with temporal bounds
3. **Condition** - States or circumstances that enable/constrain events
4. **Ideology** - Systems of ideas, beliefs, or values
5. **Source** - Primary or secondary documents
6. **Claim** - Assertions or arguments made by researchers
7. **Method** - Research methodologies or analytical approaches

### TV-Operations (16 relationship types)

- IS_SUPPORTED_BY
- CRITIQUES
- IS_CAUSED_BY
- CAUSES
- ENABLES
- CONSTRAINS
- EMBODIES
- CHALLENGES
- PARTICIPATES_IN
- PRECEDED_BY
- FOLLOWED_BY
- CONTEMPORARY_WITH
- INFLUENCED_BY
- INFLUENCES
- REFERS_TO
- ANALYZES

### TV-Axioms

Logical rules ensuring consistency (e.g., temporal ordering, causality constraints).

## 🗺️ Roadmap

### Phase 3: Data Import & Integration
- [ ] CSV import with column mapping
- [ ] JSON import with validation
- [ ] Zotero integration
- [ ] PDF annotation linking
- [ ] Bulk operations

### Phase 4: MCP Server & Docker
- [ ] Model Context Protocol server
- [ ] Graph database (Neo4j/ArangoDB)
- [ ] Docker Compose setup
- [ ] Advanced graph queries

### Phase 5: Advanced Features
- [ ] Collaborative editing
- [ ] Version control for notes
- [ ] Export to academic formats
- [ ] Citation management
- [ ] Timeline visualization

## 🤝 Contributing

This is a research project. Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of academic research. Please contact the author for licensing information.

## 🙏 Acknowledgments

- Built on the TVAS framework for formal knowledge modeling
- Inspired by Obsidian, Roam Research, and academic research tools
- French Revolution example data for demonstration purposes
- D3.js community for graph visualization techniques

## 📧 Contact

**Ghassan Alhamoud**
- GitHub: [@GhassanAlhamoud](https://github.com/GhassanAlhamoud)

---

**The Nexus Scholar** - Transform qualitative research into computationally tractable models without sacrificing interpretive depth.
