import React, { useEffect, useRef, useState } from 'react';
import { GENRES, Genre } from '../data/genres';
import * as d3 from 'd3';
import { apiService, type GraphData } from '../lib/api';
import { GraphControls } from './GraphControls';

interface GraphNode {
  id: string;
  name: string;
  popularity: number;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  strength?: number;
}

interface GraphPanelProps {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export const GraphPanel: React.FC<GraphPanelProps> = ({ selectedId, onSelect = () => {} }: GraphPanelProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, any> | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);

  // Fetch graph data from backend
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const graphData = await apiService.getGraph();
        
        const width = containerRef.current?.clientWidth || 1000;
        const height = containerRef.current?.clientHeight || 700;

        // Transform API nodes to include position
        const graphNodes: GraphNode[] = graphData.nodes.map(node => ({
          ...node,
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.8 + height * 0.1,
        }));

        // Connect only to nearest neighbor
        const nearestLinks: GraphLink[] = graphNodes.map(node => {
          let closestNode = graphNodes[0];
          let closestDistance = Infinity;
          
          graphNodes.forEach(otherNode => {
            if (node.id !== otherNode.id) {
              const distance = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) + 
                Math.pow(node.y - otherNode.y, 2)
              );
              if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = otherNode;
              }
            }
          });
          
          return { source: node.id, target: closestNode.id };
        });

        setNodes(graphNodes);
        setLinks(nearestLinks);
      } catch (error) {
        console.error('Failed to fetch graph data, using defaults:', error);
        
        // Fallback to default genres
        const width = containerRef.current?.clientWidth || 1000;
        const height = containerRef.current?.clientHeight || 700;

        const graphNodes: GraphNode[] = GENRES.map(genre => ({
          id: genre.id,
          name: genre.name,
          popularity: genre.popularity,
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.8 + height * 0.1,
        }));
        
        // Connect only to nearest neighbor
        const nearestLinks: GraphLink[] = graphNodes.map(node => {
          let closestNode = graphNodes[0];
          let closestDistance = Infinity;
          
          graphNodes.forEach(otherNode => {
            if (node.id !== otherNode.id) {
              const distance = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) + 
                Math.pow(node.y - otherNode.y, 2)
              );
              if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = otherNode;
              }
            }
          });
          
          return { source: node.id, target: closestNode.id };
        });
        
        setNodes(graphNodes);
        setLinks(nearestLinks);
      }
    };
    
    fetchGraphData();
  }, []);

  // D3 Force Simulation and Rendering
  useEffect(() => {
    if (nodes.length === 0 || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Create simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, any>(links as any)
        .id((d: any) => d.id)
        .distance(200)  // Increased spacing between nodes
        .strength(0.05)  // Lighter link force
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength(-800))  // Much stronger repulsion to separate nodes
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.02))
      .force('collision', d3.forceCollide<GraphNode>().radius(100).strength(1.0))  // Larger collision radius
      .alphaDecay(0.003)  // Slower decay for stability
      .alphaMin(0.0001)    // Let it settle properly
      .velocityDecay(0.85) // Higher friction to reduce flickering on drag
      .on('tick', ticked);

    simulationRef.current = simulation;

    // Drag behavior - with click detection
    let dragMoved = false;
    
    const drag = d3
      .drag<SVGRectElement, GraphNode>()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded);

    function dragStarted(event: d3.D3DragEvent<SVGRectElement, GraphNode, GraphNode>, d: GraphNode) {
      dragMoved = false; // Reset drag flag
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGRectElement, GraphNode, GraphNode>, d: GraphNode) {
      dragMoved = true; // Mark that drag actually moved
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGRectElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = undefined;
      d.fy = undefined;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create zoom behavior - ONLY allow scroll/pinch zoom, not click zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // Min and max zoom levels
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
      });

    // Apply zoom but disable double-click zoom (which interferes with click selecting)
    svg.call(zoom).on('dblclick.zoom', null);

    const g = svg.append('g');

    // Draw links (connection lines)
    const linkElements = g
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#000000')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.35)
      .attr('class', 'pointer-events-none');

    // Node groups
    const nodeGroups = g
      .selectAll<SVGGElement, GraphNode>('g.node')
      .data(nodes, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'grab');

    // Node rectangles (clickable area)
    const nodeRects = nodeGroups
      .append('rect')
      .attr('width', 110)
      .attr('height', 44)
      .attr('x', -55)
      .attr('y', -22)
      .attr('rx', 2)
      .attr('fill', (d: any) => selectedId === d.id ? '#FF00FF' : '#FFFFFF')
      .attr('stroke', '#000000')
      .attr('stroke-width', 4)
      .style('filter', (d: any) => selectedId === d.id ? 'drop-shadow(8px 8px 0px rgba(0,0,0,1))' : 'drop-shadow(4px 4px 0px rgba(0,0,0,1))')
      .style('cursor', 'pointer')
      .style('transition', 'all 0.15s ease-out')
      .on('click', (event: Event, d: any) => {
        // Only trigger select if this wasn't a drag
        if (!dragMoved) {
          event.stopPropagation();
          onSelect?.(d.id);
        }
      })
      .on('mouseenter', function (this: SVGRectElement) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('fill', '#CCFF00');
      })
      .on('mouseleave', function (this: SVGRectElement, d: any) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('fill', selectedId === d.id ? '#FF00FF' : '#FFFFFF');
      })
      .call(drag);

    // Node text labels
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#000000')
      .attr('font-size', '10px')
      .attr('font-weight', 700)
      .attr('font-family', '"Space Grotesk", sans-serif')
      .attr('pointer-events', 'none')
      .attr('user-select', 'none')
      .text((d: any) => d.name);

    // Update selected state styling
    nodeRects
      .attr('fill', (d: any) => selectedId === d.id ? '#FF00FF' : '#FFFFFF')
      .style('filter', (d: any) => selectedId === d.id ? 'drop-shadow(8px 8px 0px rgba(0,0,0,1))' : 'drop-shadow(4px 4px 0px rgba(0,0,0,1))');

    function ticked() {
      linkElements
        .attr('x1', (d: any) => (d.source as GraphNode).x)
        .attr('y1', (d: any) => (d.source as GraphNode).y)
        .attr('x2', (d: any) => (d.target as GraphNode).x)
        .attr('y2', (d: any) => (d.target as GraphNode).y);

      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    }

    // Bound nodes loosely (only prevent extreme outliers)
    simulation.on('tick', () => {
      nodes.forEach((d: GraphNode) => {
        // Loose bounds - let nodes breathe
        if (d.x && d.y) {
          d.x = Math.max(-width * 0.2, Math.min(width * 1.2, d.x));
          d.y = Math.max(-height * 0.2, Math.min(height * 1.2, d.y));
        }
      });
      ticked();
    });

    // Initial tick
    ticked();

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedId, onSelect]);

  return (
    <div className="h-full w-full flex flex-col bg-brutal-gray overflow-hidden">
      <div className="p-6 bg-brutal-black text-brutal-white">
        <h2 className="text-4xl leading-none">GRAPHIC MAP</h2>
        <div className="flex items-center gap-2 mt-2 font-mono text-xs opacity-70">
          <span>🖱️ DRAG</span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-brutal-gray overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: '#E5E5E5', cursor: 'grab' }}
        />
        <GraphControls />
      </div>

      <div className="p-4 border-t-4 border-brutal-black bg-brutal-pink text-brutal-white font-mono text-[10px] font-bold">
        NODES: {nodes.length} | LINKS: {links.length} | SELECTED: {selectedId ? `#${selectedId}` : 'NONE'} | INTERACTIVE: ON
      </div>
    </div>
  );
};
