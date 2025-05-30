import { firestore, collections } from '../config/db.js';

// Get ecosystem metrics
export const getEcosystemMetrics = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Get all agents for this user
    const agentsRef = firestore.collection(collections.AGENTS);
    const agentsSnapshot = await agentsRef.where('userId', '==', userId).get();
    
    const agents = [];
    agentsSnapshot.forEach(doc => {
      agents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get all relationships for this user
    const relationshipsRef = firestore.collection(collections.RELATIONSHIPS);
    const relationshipsSnapshot = await relationshipsRef.where('userId', '==', userId).get();
    
    const relationships = [];
    relationshipsSnapshot.forEach(doc => {
      relationships.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Calculate industry distribution
    const industryDistribution = {};
    agents.forEach(agent => {
      if (!industryDistribution[agent.industry]) {
        industryDistribution[agent.industry] = 0;
      }
      industryDistribution[agent.industry]++;
    });
    
    // Calculate hierarchy depth
    const calculateHierarchyDepth = () => {
      // Build parent-child map
      const parentChildMap = {};
      
      relationships
        .filter(r => r.type === 'reports_to')
        .forEach(r => {
          if (!parentChildMap[r.targetAgentId]) {
            parentChildMap[r.targetAgentId] = [];
          }
          parentChildMap[r.targetAgentId].push(r.sourceAgentId);
        });
      
      // Find root agents (no parents)
      const rootAgents = agents.filter(agent => !agent.parentAgentId);
      
      // Calculate depth for each root
      const calculateDepth = (agentId, depth) => {
        const children = parentChildMap[agentId] || [];
        
        if (children.length === 0) {
          return depth;
        }
        
        return Math.max(...children.map(childId => calculateDepth(childId, depth + 1)));
      };
      
      if (rootAgents.length === 0) {
        return 0;
      }
      
      return Math.max(...rootAgents.map(agent => calculateDepth(agent.id, 1)));
    };
    
    const hierarchyDepth = calculateHierarchyDepth();
    
    // In a real implementation, agent interactions would be tracked in a separate collection
    // For demo, we'll use relationship count * 10 as a proxy
    const agentInteractions = relationships.length * 10;
    
    const metrics = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.active).length,
      deployedAgents: agents.filter(a => a.deployed).length,
      industryDistribution,
      hierarchyDepth,
      agentInteractions
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agent performance metrics
export const getAgentMetrics = async (req, res) => {
  try {
    const userId = req.user.sub;
    const agentId = req.params.agentId;
    
    // Check if agent exists and belongs to user
    const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
    const doc = await agentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Agent not found');
    }
    
    const agent = doc.data();
    
    if (agent.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to access this agent');
    }
    
    // In a real implementation, this would fetch from a metrics database
    // For demo, we'll return mock metrics
    
    const metrics = {
      agentId,
      responseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      successRate: Math.floor(Math.random() * 15) + 85, // 85-100%
      usageCount: Math.floor(Math.random() * 1000) + 100, // 100-1100
      lastActive: new Date().toISOString(),
      averageFeedbackScore: (Math.random() * 2) + 3, // 3.0-5.0
      performanceByDay: [
        // Last 7 days of performance data
        ...Array(7).fill(0).map((_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usageCount: Math.floor(Math.random() * 100) + 50,
          successRate: Math.floor(Math.random() * 10) + 90,
          responseTime: Math.floor(Math.random() * 300) + 100
        }))
      ],
      topQueries: [
        { query: 'Property market analysis', count: 145 },
        { query: 'Listing optimization', count: 89 },
        { query: 'Pricing recommendation', count: 76 },
        { query: 'Client communication', count: 54 },
        { query: 'Competitive analysis', count: 42 }
      ]
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get industry metrics
export const getIndustryMetrics = async (req, res) => {
  try {
    const userId = req.user.sub;
    const industryId = req.params.industryId;
    
    // Get all agents for this user in this industry
    const agentsRef = firestore.collection(collections.AGENTS);
    const agentsSnapshot = await agentsRef
      .where('userId', '==', userId)
      .where('industry', '==', industryId)
      .get();
    
    const agents = [];
    agentsSnapshot.forEach(doc => {
      agents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // In a real implementation, this would calculate actual metrics
    // For demo, we'll return mock metrics
    
    const agentCount = agents.length;
    
    // Calculate role distribution
    const roleDistribution = {};
    agents.forEach(agent => {
      if (!agent.role) return;
      
      if (!roleDistribution[agent.role]) {
        roleDistribution[agent.role] = 0;
      }
      roleDistribution[agent.role]++;
    });
    
    // Generate mock deployment statistics
    const deploymentStats = {
      deployed: agents.filter(a => a.deployed).length,
      notDeployed: agents.filter(a => !a.deployed).length,
      active: agents.filter(a => a.active).length,
      inactive: agents.filter(a => !a.active).length
    };
    
    // Generate mock performance metrics
    const performanceMetrics = {
      averageResponseTime: Math.floor(Math.random() * 300) + 100,
      averageSuccessRate: Math.floor(Math.random() * 10) + 90,
      totalInteractions: Math.floor(Math.random() * 5000) + 1000,
      lastInteraction: new Date().toISOString()
    };
    
    const metrics = {
      industryId,
      agentCount,
      roleDistribution,
      deploymentStats,
      performanceMetrics,
      topCapabilities: [
        { capability: 'market-analysis', count: Math.floor(Math.random() * 50) + 10 },
        { capability: 'content-generation', count: Math.floor(Math.random() * 50) + 10 },
        { capability: 'client-communication', count: Math.floor(Math.random() * 50) + 10 },
        { capability: 'data-processing', count: Math.floor(Math.random() * 50) + 10 }
      ]
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get relationship metrics
export const getRelationshipMetrics = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Get all relationships for this user
    const relationshipsRef = firestore.collection(collections.RELATIONSHIPS);
    const relationshipsSnapshot = await relationshipsRef.where('userId', '==', userId).get();
    
    const relationships = [];
    relationshipsSnapshot.forEach(doc => {
      relationships.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Calculate relationship type distribution
    const typeDistribution = {};
    relationships.forEach(relationship => {
      if (!typeDistribution[relationship.type]) {
        typeDistribution[relationship.type] = 0;
      }
      typeDistribution[relationship.type]++;
    });
    
    // In a real implementation, this would calculate actual metrics
    // For demo, we'll return mock metrics
    
    const metrics = {
      totalRelationships: relationships.length,
      typeDistribution,
      mostConnectedAgents: [
        { agentId: 'agent1', name: 'Executive Director', connections: 5 },
        { agentId: 'agent2', name: 'Department Manager', connections: 4 },
        { agentId: 'agent3', name: 'Team Lead', connections: 3 }
      ],
      averageConnectionsPerAgent: (relationships.length / 2).toFixed(1), // Rough estimate
      hierarchyDepth: 3,
      networkDensity: 0.75
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};