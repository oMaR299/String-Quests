/**
 * Prerequisite Graph & ZPD Frontier
 *
 * Builds a DAG (Directed Acyclic Graph) from the existing KC prerequisite data
 * in sampleTextbook.ts. Each KC already has prerequisiteKcIds[], so we just
 * need to formalize it as a graph and provide ZPD frontier computation.
 *
 * ZPD (Zone of Proximal Development) - Vygotsky, 1978:
 * A skill is in the student's ZPD if:
 * 1. All prerequisite KCs are mastered
 * 2. The skill itself is NOT mastered
 * 3. The difficulty is within reach
 */

import type { KCGraph, KCNode, PrerequisiteEdge, KCState, BKTFamily } from '../models/types';
import type { BloomLevel } from './skillTaxonomy';
import { KC_MAP } from './sampleTextbook';
import { getEffectiveMastery } from '../models/fsrs';
import { getBKTFamily } from '../models/bkt';

// ─── Build Graph from KC_MAP ─────────────────────────────────────────────────

/**
 * Build the prerequisite graph from all KCs in KC_MAP.
 * Called once at app initialization and cached.
 */
export function buildPrerequisiteGraph(): KCGraph {
  const nodes: KCNode[] = [];
  const edges: PrerequisiteEdge[] = [];

  for (const kc of Object.values(KC_MAP)) {
    // Create node
    const node: KCNode = {
      id: kc.id,
      nameAr: kc.nameAr,
      nameEn: kc.nameEn,
      domain: kc.tags[0] ?? 'general',
      unit: kc.standardCode?.split('.')[1] ?? 'unknown',
      bloomLevels: [kc.bloomLevel],
      bktFamily: getBKTFamily(kc.bloomLevel) as BKTFamily,
    };
    nodes.push(node);

    // Create edges from prerequisiteKcIds
    for (const prereqId of kc.prerequisiteKcIds) {
      edges.push({
        from: prereqId,
        to: kc.id,
        strength: 'hard', // All explicit prerequisites are hard requirements
      });
    }
  }

  return { nodes, edges };
}

// Cached graph instance
let _cachedGraph: KCGraph | null = null;

/** Get the prerequisite graph (cached after first build) */
export function getPrerequisiteGraph(): KCGraph {
  if (!_cachedGraph) {
    _cachedGraph = buildPrerequisiteGraph();
  }
  return _cachedGraph;
}

/** Clear the cached graph (for testing or after data changes) */
export function clearGraphCache(): void {
  _cachedGraph = null;
}

// ─── ZPD Frontier Computation ────────────────────────────────────────────────

/**
 * Compute the ZPD frontier: unmastered KCs whose prerequisites are all mastered.
 *
 * This is the set of things the student is "ready to learn next."
 *
 * @param studentKCs - The student's current KC states
 * @param now - Current time (for forgetting curve)
 * @param masteryThreshold - Effective mastery threshold to consider "mastered"
 * @returns Array of KC IDs in the student's ZPD
 */
export function getZPDFrontier(
  studentKCs: Record<string, KCState>,
  now: Date,
  masteryThreshold = 0.85,
): string[] {
  const graph = getPrerequisiteGraph();
  const frontier: string[] = [];

  // Build a set of mastered KC IDs for fast lookup
  const masteredSet = new Set<string>();
  for (const [kcId, state] of Object.entries(studentKCs)) {
    if (getEffectiveMastery(state, now) >= masteryThreshold) {
      masteredSet.add(kcId);
    }
  }

  for (const node of graph.nodes) {
    // Skip already mastered
    if (masteredSet.has(node.id)) continue;

    // Get all hard prerequisites for this node
    const hardPrereqs = graph.edges
      .filter(e => e.to === node.id && e.strength === 'hard')
      .map(e => e.from);

    // If no prerequisites, it's always in ZPD (entry point)
    if (hardPrereqs.length === 0) {
      // But only if not already attempted and struggling
      const state = studentKCs[node.id];
      if (!state || state.successCount === 0) {
        frontier.push(node.id);
      } else if (getEffectiveMastery(state, now) < masteryThreshold) {
        frontier.push(node.id);
      }
      continue;
    }

    // Check if all hard prerequisites are mastered
    const allPrereqsMet = hardPrereqs.every(prereqId => masteredSet.has(prereqId));

    if (allPrereqsMet) {
      frontier.push(node.id);
    }
  }

  return frontier;
}

/**
 * Get KCs that are root nodes (no prerequisites) - these are entry points.
 */
export function getRootKCs(): string[] {
  const graph = getPrerequisiteGraph();
  const hasPrereq = new Set(graph.edges.map(e => e.to));
  return graph.nodes.filter(n => !hasPrereq.has(n.id)).map(n => n.id);
}

/**
 * Get all KCs that depend on a given KC (direct dependents only).
 */
export function getDirectDependents(kcId: string): string[] {
  const graph = getPrerequisiteGraph();
  return graph.edges.filter(e => e.from === kcId).map(e => e.to);
}

/**
 * Get all KCs that are prerequisites of a given KC (direct only).
 */
export function getDirectPrerequisites(kcId: string): string[] {
  const graph = getPrerequisiteGraph();
  return graph.edges.filter(e => e.to === kcId).map(e => e.from);
}

/**
 * Topological sort of all KCs - valid learning order.
 * Uses Kahn's algorithm.
 */
export function topologicalSort(): string[] {
  const graph = getPrerequisiteGraph();

  // Build in-degree map
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of graph.edges) {
    if (edge.strength === 'hard') {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
      adjacency.get(edge.from)?.push(edge.to);
    }
  }

  // Start with nodes that have no prerequisites
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    for (const dependent of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(dependent) ?? 1) - 1;
      inDegree.set(dependent, newDeg);
      if (newDeg === 0) {
        queue.push(dependent);
      }
    }
  }

  return result;
}
