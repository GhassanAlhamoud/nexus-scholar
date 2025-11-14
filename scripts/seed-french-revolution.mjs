import { drizzle } from "drizzle-orm/mysql2";
import { notes, links } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// French Revolution seed data
const seedData = {
  actors: [
    {
      title: "Louis XVI",
      content: `King of France from 1774 to 1792. His inability to address the fiscal crisis and resistance to reform contributed to the outbreak of the French Revolution.

## Key Attributes
- **Role**: King of France
- **Birth**: August 23, 1754
- **Death**: January 21, 1793 (executed)
- **Reign**: 1774-1792

## Significance
Louis XVI's weak leadership and indecisiveness during the fiscal crisis exacerbated tensions between the monarchy and the people. His attempted flight to Varennes in 1791 destroyed remaining public trust.`,
      tvObjectType: "Actor",
      tvObjectAttributes: JSON.stringify({
        role: "King of France",
        birth_year: 1754,
        death_year: 1793,
        affiliation: "Monarchy",
        active_period: "1774-1792"
      })
    },
    {
      title: "Maximilien Robespierre",
      content: `French lawyer and politician who became one of the most influential figures of the French Revolution. Leader of the Jacobins and architect of the Reign of Terror.

## Key Attributes
- **Role**: Revolutionary Leader, Jacobin
- **Birth**: May 6, 1758
- **Death**: July 28, 1794 (executed)
- **Political Affiliation**: Jacobins

## Significance
Robespierre championed the rights of the poor and advocated for universal male suffrage. His radical policies during the Reign of Terror led to thousands of executions before his own downfall.`,
      tvObjectType: "Actor",
      tvObjectAttributes: JSON.stringify({
        role: "Revolutionary Leader",
        birth_year: 1758,
        death_year: 1794,
        affiliation: "Jacobins",
        active_period: "1789-1794"
      })
    },
    {
      title: "Third Estate",
      content: `The common people of France, comprising approximately 98% of the population. Included peasants, urban workers, and the bourgeoisie.

## Key Attributes
- **Type**: Social Class/Group
- **Composition**: Peasants, workers, bourgeoisie
- **Population**: ~98% of France

## Significance
The Third Estate bore the heaviest tax burden while having the least political power. Their grievances and demands for representation were central to the outbreak of the Revolution.`,
      tvObjectType: "Actor",
      tvObjectAttributes: JSON.stringify({
        role: "Social Class",
        composition: "Peasants, workers, bourgeoisie",
        population_percentage: 98,
        affiliation: "Commoners"
      })
    }
  ],
  events: [
    {
      title: "Storming of the Bastille",
      content: `On July 14, 1789, Parisian revolutionaries stormed the Bastille fortress, a symbol of royal tyranny. This event marked the beginning of the French Revolution.

## Key Attributes
- **Date**: July 14, 1789
- **Location**: Paris, France
- **Participants**: Parisian mob, French Guards
- **Casualties**: ~100 attackers killed

## Significance
The fall of the Bastille symbolized the end of absolute monarchy and the birth of popular sovereignty. July 14 is now celebrated as Bastille Day, France's national holiday.

Related to: [[Louis XVI]], [[Third Estate]], [[Fiscal Crisis of the 1780s]]`,
      tvObjectType: "Event",
      tvObjectAttributes: JSON.stringify({
        date: "1789-07-14",
        location: "Paris, France",
        participants: ["Parisian revolutionaries", "French Guards"],
        duration: "1 day",
        significance: "Symbol of revolution, end of royal tyranny"
      })
    },
    {
      title: "Tennis Court Oath",
      content: `On June 20, 1789, members of the Third Estate took an oath not to disband until a new constitution was established for France.

## Key Attributes
- **Date**: June 20, 1789
- **Location**: Versailles, France
- **Participants**: Members of the Third Estate

## Significance
This oath marked the first assertion of political power by the Third Estate and the beginning of the National Assembly. It demonstrated the determination of the revolutionaries to fundamentally transform French government.

Related to: [[Third Estate]], [[Louis XVI]]`,
      tvObjectType: "Event",
      tvObjectAttributes: JSON.stringify({
        date: "1789-06-20",
        location: "Versailles, France",
        participants: ["Third Estate representatives"],
        duration: "1 day",
        significance: "First assertion of popular sovereignty"
      })
    },
    {
      title: "Reign of Terror",
      content: `Period from September 1793 to July 1794 during which the Revolutionary government executed thousands of perceived enemies of the Revolution.

## Key Attributes
- **Date**: September 1793 - July 1794
- **Location**: France (primarily Paris)
- **Deaths**: ~17,000 official executions, ~25,000 total

## Significance
Led by [[Maximilien Robespierre]] and the Committee of Public Safety, the Terror aimed to purge France of counter-revolutionaries but ultimately consumed its own leaders.

Related to: [[Maximilien Robespierre]]`,
      tvObjectType: "Event",
      tvObjectAttributes: JSON.stringify({
        date: "1793-09-05",
        end_date: "1794-07-28",
        location: "France",
        participants: ["Committee of Public Safety", "Revolutionary Tribunal"],
        duration: "10 months",
        significance: "Radical phase of Revolution, mass executions"
      })
    }
  ],
  conditions: [
    {
      title: "Fiscal Crisis of the 1780s",
      content: `France faced severe financial difficulties in the 1780s due to costly wars, including support for the American Revolution, and an inefficient tax system.

## Key Attributes
- **Period**: 1780s
- **Severity**: Critical
- **Affected Groups**: Entire nation, especially Third Estate

## Causes
- War debts from Seven Years' War and American Revolution
- Inefficient tax collection system
- Tax exemptions for nobility and clergy
- Extravagant royal spending

## Impact
The fiscal crisis forced [[Louis XVI]] to call the Estates-General in 1789, setting in motion the events that led to revolution.

Related to: [[Louis XVI]], [[Third Estate]], [[Storming of the Bastille]]`,
      tvObjectType: "Condition",
      tvObjectAttributes: JSON.stringify({
        start_date: "1780",
        end_date: "1789",
        severity: "Critical",
        affected_groups: ["Third Estate", "French State"]
      })
    },
    {
      title: "Social Inequality",
      content: `French society was divided into three estates with vastly unequal rights, privileges, and tax burdens.

## Key Attributes
- **Period**: Pre-1789
- **Severity**: Extreme
- **Type**: Structural inequality

## Structure
- **First Estate**: Clergy (~1% of population, tax exempt)
- **Second Estate**: Nobility (~2% of population, tax exempt)
- **Third Estate**: Commoners (~97% of population, bore tax burden)

## Impact
This rigid social hierarchy and inequality of taxation was a fundamental cause of revolutionary sentiment.

Related to: [[Third Estate]], [[Enlightenment Principles]]`,
      tvObjectType: "Condition",
      tvObjectAttributes: JSON.stringify({
        start_date: "1600",
        end_date: "1789",
        severity: "Extreme",
        affected_groups: ["Third Estate"]
      })
    }
  ],
  ideologies: [
    {
      title: "Enlightenment Principles",
      content: `Philosophical movement emphasizing reason, individual rights, and popular sovereignty that profoundly influenced revolutionary thought.

## Core Tenets
- **Popular Sovereignty**: Government derives legitimacy from the people
- **Natural Rights**: All humans possess inherent rights (life, liberty, property)
- **Social Contract**: Government is a contract between rulers and ruled
- **Reason over Tradition**: Rational thought should guide society

## Key Thinkers
- Jean-Jacques Rousseau: Social contract theory
- Voltaire: Religious tolerance, freedom of speech
- Montesquieu: Separation of powers

## Impact
Enlightenment ideas provided the intellectual foundation for revolutionary demands and the Declaration of the Rights of Man and of the Citizen.

Related to: [[Third Estate]], [[Social Inequality]]`,
      tvObjectType: "Ideology",
      tvObjectAttributes: JSON.stringify({
        core_tenets: ["Popular sovereignty", "Natural rights", "Social contract", "Reason"],
        proponents: ["Rousseau", "Voltaire", "Montesquieu"],
        historical_context: "18th century philosophical movement"
      })
    }
  ],
  sources: [
    {
      title: "Declaration of the Rights of Man and of the Citizen",
      content: `Fundamental document of the French Revolution adopted on August 26, 1789, defining individual and collective rights.

## Key Attributes
- **Date**: August 26, 1789
- **Type**: Constitutional document
- **Authors**: National Assembly

## Key Principles
1. Men are born and remain free and equal in rights
2. The aim of all political association is the preservation of natural rights
3. The principle of all sovereignty resides in the nation
4. Liberty consists in the freedom to do everything which injures no one else

## Significance
This document embodied [[Enlightenment Principles]] and became a foundational text for human rights globally.`,
      tvObjectType: "Source",
      tvObjectAttributes: JSON.stringify({
        author: "National Assembly",
        publication_date: "1789-08-26",
        document_type: "Constitutional declaration",
        credibility: "Primary source"
      })
    }
  ],
  claims: [
    {
      title: "Fiscal Crisis Caused Revolutionary Outbreak",
      content: `The claim that France's fiscal crisis in the 1780s was the primary catalyst for the French Revolution.

## Supporting Evidence
- War debts forced Louis XVI to call Estates-General
- Tax burden on Third Estate created widespread discontent
- Inability to reform tax system due to noble resistance

## Counter-Arguments
- Social and ideological factors were equally important
- Revolution required confluence of multiple causes
- Fiscal crisis alone doesn't explain revolutionary violence

## Analysis
While the [[Fiscal Crisis of the 1780s]] was certainly a trigger, it interacted with [[Social Inequality]] and [[Enlightenment Principles]] to create revolutionary conditions.

Related to: [[Fiscal Crisis of the 1780s]], [[Louis XVI]], [[Storming of the Bastille]]`,
      tvObjectType: "Claim",
      tvObjectAttributes: JSON.stringify({
        claimant: "Economic historians",
        confidence_level: "High",
        evidence_links: ["Fiscal Crisis", "Estates-General召集"]
      })
    }
  ]
};

async function seed(userId) {
  console.log("Seeding French Revolution data...");
  
  const createdNotes = {};
  
  // Insert all notes
  for (const [category, items] of Object.entries(seedData)) {
    console.log(`\nCreating ${category}...`);
    for (const item of items) {
      const result = await db.insert(notes).values({
        userId,
        title: item.title,
        content: item.content,
        tvObjectType: item.tvObjectType,
        tvObjectAttributes: item.tvObjectAttributes
      });
      const noteId = Number(result[0].insertId);
      createdNotes[item.title] = noteId;
      console.log(`  ✓ Created: ${item.title} (ID: ${noteId})`);
    }
  }
  
  // Create links based on [[wiki-style]] references in content
  console.log("\nCreating links...");
  
  const linkDefinitions = [
    // Fiscal Crisis relationships
    { source: "Fiscal Crisis of the 1780s", target: "Louis XVI", type: "AFFECTED" },
    { source: "Fiscal Crisis of the 1780s", target: "Third Estate", type: "BURDENED" },
    { source: "Storming of the Bastille", target: "Fiscal Crisis of the 1780s", type: "WAS_CAUSED_BY" },
    
    // Event relationships
    { source: "Storming of the Bastille", target: "Louis XVI", type: "CHALLENGED" },
    { source: "Storming of the Bastille", target: "Third Estate", type: "LED_BY" },
    { source: "Tennis Court Oath", target: "Third Estate", type: "TAKEN_BY" },
    { source: "Reign of Terror", target: "Maximilien Robespierre", type: "LED_BY" },
    
    // Ideological relationships
    { source: "Enlightenment Principles", target: "Social Inequality", type: "CRITIQUES" },
    { source: "Declaration of the Rights of Man and of the Citizen", target: "Enlightenment Principles", type: "EMBODIES" },
    
    // Claim relationships
    { source: "Fiscal Crisis Caused Revolutionary Outbreak", target: "Fiscal Crisis of the 1780s", type: "IS_SUPPORTED_BY" },
    { source: "Fiscal Crisis Caused Revolutionary Outbreak", target: "Storming of the Bastille", type: "IS_SUPPORTED_BY" },
  ];
  
  for (const linkDef of linkDefinitions) {
    const sourceId = createdNotes[linkDef.source];
    const targetId = createdNotes[linkDef.target];
    
    if (sourceId && targetId) {
      await db.insert(links).values({
        userId,
        sourceNoteId: sourceId,
        targetNoteId: targetId,
        relationshipType: linkDef.type,
        evidence: null
      });
      console.log(`  ✓ Linked: ${linkDef.source} --[${linkDef.type}]--> ${linkDef.target}`);
    }
  }
  
  console.log("\n✅ French Revolution data seeded successfully!");
  console.log(`Created ${Object.keys(createdNotes).length} notes and ${linkDefinitions.length} links`);
}

// Get user ID from command line argument
const userId = parseInt(process.argv[2]);

if (!userId) {
  console.error("Usage: node seed-french-revolution.mjs <userId>");
  console.error("\nTo find your user ID:");
  console.error("1. Sign in to the application");
  console.error("2. Check the database users table");
  process.exit(1);
}

seed(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding data:", error);
    process.exit(1);
  });
