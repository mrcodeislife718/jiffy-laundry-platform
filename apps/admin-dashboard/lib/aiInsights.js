/**
 * AI-powered insights for business metrics
 * Intelligent heuristics based on data patterns
 */

export function generateOrderInsights(orders) {
  const insights = [];
  
  const delivered = orders.filter(o => o.status.toLowerCase() === 'delivered').length;
  const inProgress = orders.filter(o => ['washing', 'out_for_delivery'].includes(o.status.toLowerCase())).length;
  const pending = orders.filter(o => ['pending_dispatch', 'picked_up'].includes(o.status.toLowerCase())).length;
  
  const avgOrderValue = orders.reduce((sum, o) => sum + o.total, 0) / orders.length;
  
  // Completion rate
  const completionRate = ((delivered / orders.length) * 100).toFixed(1);
  insights.push({
    type: 'completion',
    title: 'Completion Rate',
    value: `${completionRate}%`,
    message: completionRate >= 80 
      ? '🎯 Excellent completion rate! Keep up the momentum.' 
      : '📈 Opportunities to improve delivery time.',
    trend: completionRate >= 80 ? 'positive' : 'neutral'
  });
  
  // Active workload
  if (inProgress > 0) {
    insights.push({
      type: 'workload',
      title: 'Active Orders',
      value: `${inProgress}`,
      message: `${inProgress} orders in progress. Good workflow activity!`,
      trend: 'positive'
    });
  }
  
  // Revenue performance
  insights.push({
    type: 'revenue',
    title: 'Avg Order Value',
    value: `$${avgOrderValue.toFixed(2)}`,
    message: avgOrderValue > 50 
      ? '💎 Strong average order value. Premium service positioning effective.' 
      : '💼 Growing customer base with standard service preferences.',
    trend: 'neutral'
  });
  
  // Pending risk
  if (pending > 0) {
    insights.push({
      type: 'risk',
      title: 'Pending Fulfillment',
      value: `${pending}`,
      message: `⚠️ ${pending} order(s) awaiting dispatch. Prioritize for on-time delivery.`,
      trend: 'warning'
    });
  }
  
  return insights;
}

export function generateFinanceInsights(data, orders) {
  const insights = [];
  
  const paidAmount = orders.filter(o => o.paymentStatus.toLowerCase() === 'paid').reduce((sum, o) => sum + o.total, 0);
  const unpaidAmount = orders.filter(o => o.paymentStatus.toLowerCase() !== 'paid').reduce((sum, o) => sum + o.total, 0);
  const total = paidAmount + unpaidAmount;
  const collectionRate = total > 0 ? ((paidAmount / total) * 100).toFixed(1) : 100;
  
  // Payment collection
  insights.push({
    type: 'collection',
    title: 'Collection Rate',
    value: `${collectionRate}%`,
    message: collectionRate >= 90 
      ? '💳 Excellent payment collection! Healthy cash flow.' 
      : `💸 Focus on unpaid invoices: $${unpaidAmount.toFixed(2)}`,
    trend: collectionRate >= 90 ? 'positive' : 'warning'
  });
  
  // Revenue trend
  insights.push({
    type: 'trend',
    title: 'Total Revenue',
    value: `$${data.totalRevenue.toFixed(2)}`,
    message: data.totalRevenue > 10000 
      ? '📈 Strong revenue performance. Business is scaling well.' 
      : '📊 Build revenue momentum with targeted growth initiatives.',
    trend: 'neutral'
  });
  
  // Average order value optimization
  const avgOrder = data.averageOrderValue;
  if (avgOrder < 100) {
    insights.push({
      type: 'optimization',
      title: 'Upsell Opportunity',
      value: `Current AVG: $${avgOrder.toFixed(2)}`,
      message: '🎁 Bundle premium services to increase average order value by 20-30%.',
      trend: 'opportunity'
    });
  }
  
  return insights;
}

export function getActionableRecommendations(orders) {
  const recommendations = [];
  
  const pendingCount = orders.filter(o => ['pending_dispatch', 'picked_up'].includes(o.status.toLowerCase())).length;
  if (pendingCount > 0) {
    recommendations.push({
      priority: 'high',
      action: '🚀 Accelerate Pending Orders',
      description: `${pendingCount} orders need dispatch attention to maintain SLA compliance.`
    });
  }
  
  const unpaidTotal = orders.filter(o => o.paymentStatus.toLowerCase() !== 'paid').reduce((sum, o) => sum + o.total, 0);
  if (unpaidTotal > 0) {
    recommendations.push({
      priority: 'medium',
      action: '💰 Follow Up on Outstanding Payments',
      description: `$${unpaidTotal.toFixed(2)} in unpaid invoices. Send reminders to customers.`
    });
  }
  
  const deliveredCount = orders.filter(o => o.status.toLowerCase() === 'delivered').length;
  if (deliveredCount >= orders.length * 0.7) {
    recommendations.push({
      priority: 'low',
      action: '⭐ Request Customer Reviews',
      description: 'High delivery rate is perfect for gathering positive testimonials.'
    });
  }
  
  return recommendations;
}
