import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useAgent } from '../../context/AgentContext';
import Card from '../common/Card';
import { Network as NetworkCircle, Network as NetworkSquare, LayoutGrid, LayoutDashboard, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import { Agent, AgentRelationship } from '../../types/agent';
import { getIndustryColor } from '../../data/industries';

interface AgentNetworkGraphProps {
  width?: number;
  height?: number;
  industryFilter?: string;
}

type Node = {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  agent: Agent;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
};

type Edge = {
  source: string;
  target: string;
  type: string;
  color: string;
};

const AgentNetworkGraph: React.FC<AgentNetworkGraphProps> = ({
  width = 800,
  height = 600,
  industryFilter,
}) => {
  const { agents, relationships, getAgentById } = useAgent();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [layout, setLayout] = useState<'force' | 'hierarchical' | 'grid'>('force');
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [selectedAgentDetails, setSelectedAgentDetails] = useState<Agent | null>(null);

  const requestRef = useRef<number>();
  const draggedNode = useRef<Node | null>(null);
  const lastRenderTime = useRef<number>(0);

  // Memoize filtered agents for better performance
  const filteredAgents = useMemo(() => 
    industryFilter 
      ? agents.filter(agent => agent.industry === industryFilter) 
      : agents,
  [agents, industryFilter]);

  // Memoize node color calculation
  const getNodeColor = useCallback((agent: Agent): string => {
    // Use industry color or role color
    if (agent.industry) {
      const industryColor = getIndustryColor(agent.industry).replace('bg-', '');
      
      switch (industryColor) {
        case 'blue-600': return '#2563eb'; 
        case 'green-600': return '#16a34a';
        case 'red-600': return '#dc2626';
        case 'purple-600': return '#9333ea';
        case 'orange-600': return '#ea580c';
        case 'gray-600': return '#4b5563';
        default: return '#2563eb';
      }
    } else {
      // Fallback to role-based color
      switch (agent.role) {
        case 'executive': return '#9333ea'; // purple
        case 'management': return '#2563eb'; // blue
        case 'operational': return '#16a34a'; // green
        case 'specialized': return '#ea580c'; // orange
        default: return '#4b5563'; // gray
      }
    }
  }, []);
  
  // Memoize edge color calculation
  const getEdgeColor = useCallback((type: string): string => {
    switch (type) {
      case 'reports_to': return '#9CA3AF'; // gray-400
      case 'supervises': return '#6366F1'; // indigo-500
      case 'collaborates_with': return '#10B981'; // emerald-500
      case 'delegates_to': return '#F59E0B'; // amber-500
      default: return '#9CA3AF'; // gray-400
    }
  }, []);

  const initializeGraph = useCallback(() => {
    // Initialize nodes and edges whenever agents or relationships change
    const newNodes: Node[] = filteredAgents.map(agent => {
      // Position nodes randomly within canvas bounds
      return {
        id: agent.id,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: agent.role === 'executive' ? 18 : agent.role === 'management' ? 15 : 12,
        color: getNodeColor(agent),
        agent,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null
      };
    });

    const newEdges: Edge[] = relationships
      .filter(rel => {
        // Only include edges where both source and target are in filtered agents
        const sourceAgent = filteredAgents.find(a => a.id === rel.sourceAgentId);
        const targetAgent = filteredAgents.find(a => a.id === rel.targetAgentId);
        return sourceAgent && targetAgent;
      })
      .map(rel => {
        return {
          source: rel.sourceAgentId,
          target: rel.targetAgentId,
          type: rel.type,
          color: getEdgeColor(rel.type)
        };
      });

    setNodes(newNodes);
    setEdges(newEdges);
    
    // Apply initial layout
    applyLayout(newNodes, newEdges, layout);
    
    // Start simulation
    if (simulationRunning) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [filteredAgents, relationships, width, height, getNodeColor, getEdgeColor, layout, simulationRunning]);

  useEffect(() => {
    initializeGraph();
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [initializeGraph]);
  
  const applyLayout = useCallback((graphNodes: Node[], graphEdges: Edge[], layoutType: 'force' | 'hierarchical' | 'grid') => {
    // Reset node positions based on layout
    let updatedNodes = [...graphNodes];
    
    if (layoutType === 'hierarchical') {
      // Find root nodes (nodes with no incoming reports_to edges)
      const childNodes = new Set(graphEdges
        .filter(edge => edge.type === 'reports_to')
        .map(edge => edge.source));
        
      const rootNodes = updatedNodes.filter(node => !childNodes.has(node.id));
      
      // Position root nodes at the top
      const rootCount = rootNodes.length;
      rootNodes.forEach((node, index) => {
        const xPos = (width / (rootCount + 1)) * (index + 1);
        node.y = 50; // Top of the canvas
        node.x = xPos;
        node.fx = xPos;
        node.fy = 50;
      });
      
      // Position child nodes in layers based on depth
      const positionChildNodes = (parentIds: string[], depth: number) => {
        const childIds = graphEdges
          .filter(edge => edge.type === 'reports_to' && parentIds.includes(edge.target))
          .map(edge => edge.source);
          
        if (childIds.length === 0) return;
        
        const childNodesForThisDepth = updatedNodes.filter(node => childIds.includes(node.id));
        const childCount = childNodesForThisDepth.length;
        
        childNodesForThisDepth.forEach((node, index) => {
          const xPos = (width / (childCount + 1)) * (index + 1);
          node.y = 50 + (depth * 120); // Layer based on depth
          node.x = xPos;
        });
        
        positionChildNodes(childIds, depth + 1);
      };
      
      positionChildNodes(rootNodes.map(n => n.id), 1);
      
    } else if (layoutType === 'grid') {
      // Arrange nodes in a grid pattern
      const gridSize = Math.ceil(Math.sqrt(updatedNodes.length));
      const cellWidth = width / gridSize;
      const cellHeight = height / gridSize;
      
      updatedNodes.forEach((node, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        
        node.x = cellWidth * (col + 0.5);
        node.y = cellHeight * (row + 0.5);
      });
    } else {
      // Force-directed layout - just reset fixed positions
      updatedNodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
    }
    
    setNodes(updatedNodes);
    setLayout(layoutType);
  }, [width, height]);
  
  const animate = (timestamp: number) => {
    if (!simulationRunning) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Throttle renders to max 60fps
    const elapsed = timestamp - (lastRenderTime.current || 0);
    if (elapsed < 16) { // ~60fps
      requestRef.current = requestAnimationFrame(animate);
      return;
    }
    lastRenderTime.current = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(zoom, zoom);
    
    // Apply forces (simple force-directed layout)
    if (layout === 'force') {
      // Apply forces only if force layout is active
      const updatedNodes = [...nodes];
      
      // Repulsion between nodes - optimize with spatial partitioning
      for (let i = 0; i < updatedNodes.length; i++) {
        for (let j = i + 1; j < updatedNodes.length; j++) {
          const nodeA = updatedNodes[i];
          const nodeB = updatedNodes[j];
          
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (nodeA.radius + nodeB.radius) * 3;
          
          if (distance < minDistance) {
            const force = (minDistance - distance) / distance * 0.1;
            const forceX = dx * force;
            const forceY = dy * force;
            
            if (!nodeA.fx) nodeA.vx -= forceX;
            if (!nodeA.fy) nodeA.vy -= forceY;
            if (!nodeB.fx) nodeB.vx += forceX;
            if (!nodeB.fy) nodeB.vy += forceY;
          }
        }
      }
      
      // Attraction along edges - optimize with an adjacency map
      const adjacencyMap = new Map<string, string[]>();
      edges.forEach(edge => {
        if (!adjacencyMap.has(edge.source)) {
          adjacencyMap.set(edge.source, []);
        }
        if (!adjacencyMap.has(edge.target)) {
          adjacencyMap.set(edge.target, []);
        }
        adjacencyMap.get(edge.source)!.push(edge.target);
        adjacencyMap.get(edge.target)!.push(edge.source);
      });
      
      for (let i = 0; i < updatedNodes.length; i++) {
        const sourceNode = updatedNodes[i];
        const connectedNodes = adjacencyMap.get(sourceNode.id) || [];
        
        for (const targetId of connectedNodes) {
          const targetNode = updatedNodes.find(node => node.id === targetId);
          if (!targetNode) continue;
          
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = distance * 0.001;
          
          const forceX = dx * force;
          const forceY = dy * force;
          
          if (!sourceNode.fx) sourceNode.vx += forceX;
          if (!sourceNode.fy) sourceNode.vy += forceY;
          if (!targetNode.fx) targetNode.vx -= forceX;
          if (!targetNode.fy) targetNode.vy -= forceY;
        }
      }
      
      // Center attraction
      updatedNodes.forEach(node => {
        if (!node.fx && !node.fy) {
          const dx = width / 2 / zoom - node.x;
          const dy = height / 2 / zoom - node.y;
          
          node.vx += dx * 0.0005;
          node.vy += dy * 0.0005;
        }
      });
      
      // Update positions
      updatedNodes.forEach(node => {
        if (!node.fx && !node.fy) {
          node.vx *= 0.9; // Damping
          node.vy *= 0.9; // Damping
          
          node.x += node.vx;
          node.y += node.vy;
          
          // Boundary constraints
          if (node.x < node.radius) {
            node.x = node.radius;
            node.vx = -node.vx * 0.5;
          }
          if (node.x > width / zoom - node.radius) {
            node.x = width / zoom - node.radius;
            node.vx = -node.vx * 0.5;
          }
          if (node.y < node.radius) {
            node.y = node.radius;
            node.vy = -node.vy * 0.5;
          }
          if (node.y > height / zoom - node.radius) {
            node.y = height / zoom - node.radius;
            node.vy = -node.vy * 0.5;
          }
        }
      });
      
      setNodes(updatedNodes);
    }
    
    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      ctx.strokeStyle = edge.color;
      
      // Different line styles based on relationship type
      if (edge.type === 'reports_to') {
        ctx.setLineDash([5, 3]); // Dashed line
      } else if (edge.type === 'supervises') {
        ctx.lineWidth = 2; // Thicker line
      } else {
        ctx.setLineDash([]); // Solid line
      }
      
      ctx.stroke();
      ctx.setLineDash([]); // Reset line style
      ctx.lineWidth = 1; // Reset line width
      
      // Draw arrow
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const angle = Math.atan2(dy, dx);
      
      // Position arrow near the target node
      const arrowX = targetNode.x - (targetNode.radius + 5) * Math.cos(angle);
      const arrowY = targetNode.y - (targetNode.radius + 5) * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle - Math.PI / 6),
        arrowY - 10 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle + Math.PI / 6),
        arrowY - 10 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = edge.color;
      ctx.fill();
      
      // Add relationship label for selected or hovered node
      if ((selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target)) ||
          (hoveredNode && (hoveredNode.id === edge.source || hoveredNode.id === edge.target))) {
        const labelX = sourceNode.x + dx / 2;
        const labelY = sourceNode.y + dy / 2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(labelX - 40, labelY - 10, 80, 20);
        ctx.fillStyle = '#4B5563'; // gray-600
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let relationshipText = '';
        switch(edge.type) {
          case 'reports_to': 
            relationshipText = 'Reports To';
            break;
          case 'supervises': 
            relationshipText = 'Supervises';
            break;
          case 'collaborates_with': 
            relationshipText = 'Collaborates';
            break;
          case 'delegates_to': 
            relationshipText = 'Delegates';
            break;
          default: 
            relationshipText = edge.type;
        }
        
        ctx.fillText(relationshipText, labelX, labelY);
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Draw white border for selected node
      if (selectedNode && selectedNode.id === node.id) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      
      // Draw light border for hovered node
      if (hoveredNode && hoveredNode.id === node.id && !selectedNode) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      
      // Draw node label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.agent.name.charAt(0), node.x, node.y);
      
      // Draw node name for hovered or selected node
      if ((hoveredNode && hoveredNode.id === node.id) || (selectedNode && selectedNode.id === node.id)) {
        const label = node.agent.name;
        const labelWidth = ctx.measureText(label).width + 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(node.x - labelWidth / 2, node.y - node.radius - 25, labelWidth, 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.fillText(label, node.x, node.y - node.radius - 15);
      }
    });
    
    ctx.restore();
    
    // Continue animation
    requestRef.current = requestAnimationFrame(animate);
  };
  
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;
    
    // Check for hover
    let hovered: Node | null = null;
    for (const node of nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < node.radius) {
        hovered = node;
        break;
      }
    }
    
    setHoveredNode(hovered);
    
    // Handle drag if there's a dragged node
    if (draggedNode.current) {
      draggedNode.current.fx = x;
      draggedNode.current.fy = y;
      
      setNodes(nodes.map(node => 
        node.id === draggedNode.current!.id 
          ? { ...node, x, y, fx: x, fy: y } 
          : node
      ));
    }
  }, [nodes, zoom]);
  
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;
    
    // Check for node click
    for (const node of nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < node.radius) {
        // Start dragging this node
        draggedNode.current = node;
        
        // Also select this node
        setSelectedNode(node);
        setSelectedAgentDetails(node.agent);
        return;
      }
    }
    
    // Clicked on empty space, deselect
    setSelectedNode(null);
    setSelectedAgentDetails(null);
  }, [nodes, zoom]);
  
  const handleCanvasMouseUp = useCallback(() => {
    // End dragging
    draggedNode.current = null;
  }, []);
  
  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredNode(null);
    draggedNode.current = null;
  }, []);
  
  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 3));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.5));
  }, []);
  
  const handleResetLayout = useCallback(() => {
    initializeGraph();
  }, [initializeGraph]);
  
  return (
    <Card className="overflow-hidden">
      <Card.Header className="flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">Agent Network</h3>
        </div>
        <div className="flex space-x-2">
          <div className="border border-gray-300 rounded-md flex divide-x divide-gray-300">
            <button 
              className={`px-2 py-1 ${layout === 'force' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => applyLayout(nodes, edges, 'force')}
              title="Force-directed layout"
            >
              <NetworkCircle className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              className={`px-2 py-1 ${layout === 'hierarchical' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => applyLayout(nodes, edges, 'hierarchical')}
              title="Hierarchical layout"
            >
              <LayoutDashboard className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              className={`px-2 py-1 ${layout === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => applyLayout(nodes, edges, 'grid')}
              title="Grid layout"
            >
              <LayoutGrid className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="border border-gray-300 rounded-md flex divide-x divide-gray-300">
            <button 
              className="px-2 py-1 hover:bg-gray-50"
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <ZoomIn className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              className="px-2 py-1 hover:bg-gray-50"
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <ZoomOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <button 
            className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={handleResetLayout}
            title="Reset layout"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            className="bg-gray-900"
          />
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md text-xs">
            <div className="font-medium mb-1">Relationship Types:</div>
            <div className="flex items-center mb-1">
              <div className="w-6 h-0.5 bg-gray-400 mr-1" style={{ borderStyle: 'dashed' }}></div>
              <span>Reports To</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-6 h-1 bg-indigo-500 mr-1"></div>
              <span>Supervises</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-6 h-0.5 bg-emerald-500 mr-1"></div>
              <span>Collaborates</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-amber-500 mr-1"></div>
              <span>Delegates</span>
            </div>
          </div>
          
          {/* Agent Details Panel */}
          {selectedAgentDetails && (
            <div className="absolute top-4 right-4 bg-white p-4 rounded-md shadow-md w-64">
              <h4 className="font-medium text-gray-900 mb-2">{selectedAgentDetails.name}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Role:</span> 
                  <span className="ml-1 capitalize">{selectedAgentDetails.role || 'No role'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Industry:</span> 
                  <span className="ml-1 capitalize">{selectedAgentDetails.industry}</span>
                </div>
                <div>
                  <span className="text-gray-500">Template:</span> 
                  <span className="ml-1">{selectedAgentDetails.template}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span> 
                  <span className={`ml-1 ${selectedAgentDetails.active ? 'text-green-500' : 'text-gray-500'}`}>
                    {selectedAgentDetails.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {selectedAgentDetails.capabilities && selectedAgentDetails.capabilities.length > 0 && (
                  <div>
                    <span className="text-gray-500">Capabilities:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedAgentDetails.capabilities.map(cap => (
                        <span key={cap} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {cap.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card.Body>
      <Card.Footer>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {nodes.length} agents, {edges.length} relationships
          </div>
          <div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSimulationRunning(!simulationRunning)}
            >
              {simulationRunning ? 'Pause Simulation' : 'Resume Simulation'}
            </Button>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default React.memo(AgentNetworkGraph);