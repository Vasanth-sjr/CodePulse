export const developers = [
  { id: 1, name: 'Alex Chen', initials: 'AC', color: '#3B82F6', score: 9.1, commits: 52, files: 130, badge: 'HIGH IMPACT', sparkline: [8,12,6,9,7,5,5] },
  { id: 2, name: 'Sarah Kim', initials: 'SK', color: '#8B5CF6', score: 8.0, commits: 41, files: 98, badge: 'HIGH IMPACT', sparkline: [6,9,5,8,4,5,4] },
  { id: 3, name: 'Marcus Reid', initials: 'MR', color: '#10B981', score: 7.4, commits: 38, files: 76, badge: 'MEDIUM', sparkline: [5,7,6,4,6,5,5] },
  { id: 4, name: 'Priya Patel', initials: 'PP', color: '#F59E0B', score: 6.8, commits: 29, files: 61, badge: 'MEDIUM', sparkline: [4,5,3,6,4,3,4] },
  { id: 5, name: 'Jordan Lee', initials: 'JL', color: '#EF4444', score: 5.2, commits: 18, files: 34, badge: 'MEDIUM', sparkline: [3,2,4,2,3,2,2] },
  { id: 6, name: 'Taylor Smith', initials: 'TS', color: '#EC4899', score: 3.9, commits: 11, files: 19, badge: 'LOW', sparkline: [1,2,1,2,2,1,2] },
];

export const recentActivity = [
  { id: 1, dev: developers[0], message: 'Refactored payment processing pipeline', time: '2 hours ago', filesChanged: 12 },
  { id: 2, dev: developers[1], message: 'Added unit tests for auth module', time: '4 hours ago', filesChanged: 8 },
  { id: 3, dev: developers[2], message: 'Updated product catalog API endpoints', time: '6 hours ago', filesChanged: 5 },
  { id: 4, dev: developers[3], message: 'Fixed user profile validation bug', time: '9 hours ago', filesChanged: 3 },
  { id: 5, dev: developers[4], message: 'Implemented search indexing service', time: '12 hours ago', filesChanged: 7 },
  { id: 6, dev: developers[5], message: 'Updated email template rendering', time: '1 day ago', filesChanged: 2 },
];

export const weeklyCommits = [
  { day: 'Mon', commits: 18 },
  { day: 'Tue', commits: 25 },
  { day: 'Wed', commits: 32 },
  { day: 'Thu', commits: 22 },
  { day: 'Fri', commits: 38 },
  { day: 'Sat', commits: 12 },
  { day: 'Sun', commits: 8 },
];

export const requirements = [
  {
    id: 1, title: 'Add login authentication', matchedCount: 3, confidence: 94,
    commits: [
      { hash: '#a3f9c2', message: 'Added OAuth2 middleware integration', dev: 'Alex Chen', date: '2 days ago', similarity: 96 },
      { hash: '#b71de4', message: 'Implemented JWT login controller', dev: 'Sarah Kim', date: '3 days ago', similarity: 93 },
      { hash: '#c22f81', message: 'Updated authentication service layer', dev: 'Alex Chen', date: '4 days ago', similarity: 91 },
    ],
  },
  {
    id: 2, title: 'Implement payment gateway', matchedCount: 5, confidence: 89,
    commits: [
      { hash: '#d44a12', message: 'Integrated Stripe payment SDK', dev: 'Alex Chen', date: '1 day ago', similarity: 92 },
      { hash: '#e55b23', message: 'Added payment validation middleware', dev: 'Marcus Reid', date: '2 days ago', similarity: 89 },
      { hash: '#f66c34', message: 'Created payment webhook handler', dev: 'Alex Chen', date: '3 days ago', similarity: 87 },
      { hash: '#g77d45', message: 'Updated payment error handling', dev: 'Sarah Kim', date: '4 days ago', similarity: 85 },
      { hash: '#h88e56', message: 'Added payment receipt generation', dev: 'Priya Patel', date: '5 days ago', similarity: 83 },
    ],
  },
  {
    id: 3, title: 'Build product search feature', matchedCount: 4, confidence: 91,
    commits: [
      { hash: '#i99f67', message: 'Implemented Elasticsearch integration', dev: 'Jordan Lee', date: '1 day ago', similarity: 94 },
      { hash: '#j00g78', message: 'Added search filters and facets', dev: 'Jordan Lee', date: '2 days ago', similarity: 91 },
      { hash: '#k11h89', message: 'Created search results pagination', dev: 'Sarah Kim', date: '3 days ago', similarity: 88 },
      { hash: '#l22i90', message: 'Optimized search query performance', dev: 'Marcus Reid', date: '4 days ago', similarity: 86 },
    ],
  },
  {
    id: 4, title: 'Add user profile management', matchedCount: 2, confidence: 87,
    commits: [
      { hash: '#m33j01', message: 'Created user profile CRUD endpoints', dev: 'Priya Patel', date: '2 days ago', similarity: 90 },
      { hash: '#n44k12', message: 'Added profile avatar upload handler', dev: 'Priya Patel', date: '3 days ago', similarity: 84 },
    ],
  },
  {
    id: 5, title: 'Create order tracking system', matchedCount: 3, confidence: 92,
    commits: [
      { hash: '#o55l23', message: 'Implemented order status state machine', dev: 'Marcus Reid', date: '1 day ago', similarity: 95 },
      { hash: '#p66m34', message: 'Added real-time order tracking WebSocket', dev: 'Alex Chen', date: '2 days ago', similarity: 91 },
      { hash: '#q77n45', message: 'Created order history view controller', dev: 'Sarah Kim', date: '4 days ago', similarity: 88 },
    ],
  },
];

export const modules = [
  { id: 1, name: 'Payment Module', risk: 'HIGH', owner: 'Alex Chen', ownerColor: '#3B82F6', ownership: 82 },
  { id: 2, name: 'Auth Service', risk: 'HIGH', owner: 'Alex Chen', ownerColor: '#3B82F6', ownership: 78 },
  { id: 3, name: 'Product Catalog', risk: 'MEDIUM', owner: 'Sarah Kim', ownerColor: '#8B5CF6', ownership: 65 },
  { id: 4, name: 'Order Management', risk: 'MEDIUM', owner: 'Marcus Reid', ownerColor: '#10B981', ownership: 61 },
  { id: 5, name: 'User Profiles', risk: 'MEDIUM', owner: 'Priya Patel', ownerColor: '#F59E0B', ownership: 58 },
  { id: 6, name: 'Search Engine', risk: 'LOW', owner: 'Jordan Lee', ownerColor: '#EF4444', ownership: 45 },
  { id: 7, name: 'Email Service', risk: 'LOW', owner: 'Taylor Smith', ownerColor: '#EC4899', ownership: 42 },
  { id: 8, name: 'Analytics Module', risk: 'LOW', owner: 'Marcus Reid', ownerColor: '#10B981', ownership: 38 },
];

export const ownershipMatrix = [
  { module: 'Payment', dev: 'Alex Chen', value: 82, color: '#3B82F6' },
  { module: 'Payment', dev: 'Sarah Kim', value: 10, color: '#8B5CF6' },
  { module: 'Payment', dev: 'Marcus Reid', value: 8, color: '#10B981' },
  { module: 'Auth', dev: 'Alex Chen', value: 78, color: '#3B82F6' },
  { module: 'Auth', dev: 'Sarah Kim', value: 15, color: '#8B5CF6' },
  { module: 'Auth', dev: 'Priya Patel', value: 7, color: '#F59E0B' },
  { module: 'Product', dev: 'Sarah Kim', value: 65, color: '#8B5CF6' },
  { module: 'Product', dev: 'Marcus Reid', value: 20, color: '#10B981' },
  { module: 'Product', dev: 'Jordan Lee', value: 15, color: '#EF4444' },
  { module: 'Order', dev: 'Marcus Reid', value: 61, color: '#10B981' },
  { module: 'Order', dev: 'Alex Chen', value: 25, color: '#3B82F6' },
  { module: 'Order', dev: 'Sarah Kim', value: 14, color: '#8B5CF6' },
  { module: 'User', dev: 'Priya Patel', value: 58, color: '#F59E0B' },
  { module: 'User', dev: 'Taylor Smith', value: 22, color: '#EC4899' },
  { module: 'User', dev: 'Jordan Lee', value: 20, color: '#EF4444' },
  { module: 'Search', dev: 'Jordan Lee', value: 45, color: '#EF4444' },
  { module: 'Search', dev: 'Sarah Kim', value: 30, color: '#8B5CF6' },
  { module: 'Search', dev: 'Marcus Reid', value: 25, color: '#10B981' },
  { module: 'Email', dev: 'Taylor Smith', value: 42, color: '#EC4899' },
  { module: 'Email', dev: 'Priya Patel', value: 35, color: '#F59E0B' },
  { module: 'Email', dev: 'Jordan Lee', value: 23, color: '#EF4444' },
  { module: 'Analytics', dev: 'Marcus Reid', value: 38, color: '#10B981' },
  { module: 'Analytics', dev: 'Alex Chen', value: 32, color: '#3B82F6' },
  { module: 'Analytics', dev: 'Sarah Kim', value: 30, color: '#8B5CF6' },
];
