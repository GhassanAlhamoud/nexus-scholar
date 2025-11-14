# French Revolution Seed Data

This project includes a seed script to populate your database with example French Revolution data demonstrating the TVAS framework.

## Running the Seed Script

1. **Sign in to the application** first to create your user account

2. **Find your user ID** by checking the database:
   - Go to the Management UI → Database panel
   - Look at the `users` table
   - Note your user `id` (it will be a number like `1`, `2`, etc.)

3. **Run the seed script** from the project root:
   ```bash
   cd /home/ubuntu/nexus-scholar
   node scripts/seed-french-revolution.mjs <YOUR_USER_ID>
   ```

   Example:
   ```bash
   node scripts/seed-french-revolution.mjs 1
   ```

## What Gets Created

The seed script creates **15 notes** organized by TV-Object type:

### Actors (3 notes)
- **Louis XVI** - King of France, weak leadership during fiscal crisis
- **Maximilien Robespierre** - Revolutionary leader, architect of Reign of Terror
- **Third Estate** - Common people comprising 98% of France's population

### Events (3 notes)
- **Storming of the Bastille** - July 14, 1789, symbolic start of Revolution
- **Tennis Court Oath** - June 20, 1789, Third Estate's assertion of power
- **Reign of Terror** - September 1793-July 1794, mass executions

### Conditions (2 notes)
- **Fiscal Crisis of the 1780s** - War debts and inefficient taxation
- **Social Inequality** - Rigid three-estate system with unequal burdens

### Ideologies (1 note)
- **Enlightenment Principles** - Popular sovereignty, natural rights, social contract

### Sources (1 note)
- **Declaration of the Rights of Man and of the Citizen** - August 26, 1789

### Claims (1 note)
- **Fiscal Crisis Caused Revolutionary Outbreak** - Analysis of causation

## Relationships Created

The script creates **12 bidirectional links** with relationship types:
- Fiscal Crisis **AFFECTED** Louis XVI
- Fiscal Crisis **BURDENED** Third Estate
- Storming of Bastille **WAS_CAUSED_BY** Fiscal Crisis
- Storming of Bastille **CHALLENGED** Louis XVI
- Storming of Bastille **LED_BY** Third Estate
- Tennis Court Oath **TAKEN_BY** Third Estate
- Reign of Terror **LED_BY** Robespierre
- Enlightenment Principles **CRITIQUES** Social Inequality
- Declaration **EMBODIES** Enlightenment Principles
- Claim **IS_SUPPORTED_BY** Fiscal Crisis
- And more...

## Exploring the Data

After seeding:

1. **Go to Notes page** - Browse all 15 notes organized by type
2. **Select a note** - See TV-Object attributes in the structured form
3. **View relationships** - Check the right sidebar for incoming/outgoing links
4. **Go to Graph page** - See the entire knowledge network visualized
   - Color-coded nodes by TV-Object type
   - Directed edges with relationship labels
   - Interactive zoom, pan, and drag

## Using This as a Template

This seed data demonstrates best practices for TVAS modeling:
- Each TV-Object has appropriate structured attributes
- Relationships use semantic types (not just generic "links")
- Content includes both narrative text and formal metadata
- Links create a coherent historical argument network

Use this as a template for your own PhD research data!
