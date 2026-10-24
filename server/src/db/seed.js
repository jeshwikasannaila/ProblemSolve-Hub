const db = require('./database');
const bcrypt = require('bcryptjs');

function seed() {
  console.log('Seeding initial data...');

  const passwordHash = bcrypt.hashSync('Password123!', 10);

  // Check if users already seeded
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Database already contains data. Skipping seed.');
    return;
  }

  // Insert Admin
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, bio, company_name, skills, wallet_balance, avatar, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminResult = insertUser.run(
    'Platform Admin',
    'admin@problemsolve.com',
    passwordHash,
    'ADMIN',
    'ProblemSolve Hub platform administrator and governance lead.',
    'ProblemSolve Hub Inc.',
    JSON.stringify(['Governance', 'Moderation', 'Security']),
    5000.0,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    1
  );

  // Insert Customers (Companies)
  const cust1 = insertUser.run(
    'Elena Rostova',
    'elena@novatech.io',
    passwordHash,
    'CUSTOMER',
    'VP of Engineering at NovaTech AI. Passionate about machine learning and real-time distributed systems.',
    'NovaTech AI',
    JSON.stringify(['AI/ML', 'System Architecture', 'Python']),
    3500.0,
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    1
  );

  const cust2 = insertUser.run(
    'Marcus Vance',
    'marcus@cloudscale.net',
    passwordHash,
    'CUSTOMER',
    'Head of Product at CloudScale. Building scalable cloud-native architectures.',
    'CloudScale Systems',
    JSON.stringify(['Cloud', 'Kubernetes', 'DevOps']),
    2800.0,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    1
  );

  // Insert Developers
  const dev1 = insertUser.run(
    'Aarav Sharma',
    'aarav@devmail.com',
    passwordHash,
    'DEVELOPER',
    'Full-stack developer & open-source enthusiast. Specializing in React, Node.js, and high-performance algorithms.',
    '',
    JSON.stringify(['React', 'Node.js', 'Python', 'TailwindCSS', 'SQLite', 'FastAPI']),
    1250.0,
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
    1
  );

  const dev2 = insertUser.run(
    'Sophia Chen',
    'sophia@devmail.com',
    passwordHash,
    'DEVELOPER',
    'Computer Science senior and competitive programmer. Top 1% LeetCode and AI bounty hunter.',
    '',
    JSON.stringify(['PyTorch', 'TensorFlow', 'Data Science', 'TypeScript', 'Next.js']),
    850.0,
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
    1
  );

  const dev3 = insertUser.run(
    'Liam O\'Connor',
    'liam@devmail.com',
    passwordHash,
    'DEVELOPER',
    'Mobile and UI/UX specialist. Passionate about building seamless cross-platform user experiences.',
    '',
    JSON.stringify(['Flutter', 'React Native', 'UI/UX Design', 'TailwindCSS', 'GraphQL']),
    400.0,
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    0
  );

  // Insert Problems
  const insertProblem = db.prepare(`
    INSERT INTO problems (title, slug, description, category, difficulty, requirements, tags, reward_amount, deadline, status, customer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const p1 = insertProblem.run(
    'AI-Powered Invoice OCR & Automatic Line-Item Extraction',
    'ai-powered-invoice-ocr-extraction',
    'We receive thousands of PDF and scanned image invoices weekly. We need an accurate extraction pipeline that extracts Vendor, Invoice Date, Total Due, Tax, and an array of individual line items with quantity and price into structured JSON format.',
    'AI & Data',
    'Advanced',
    '1. High accuracy (>95%) on rotated, noisy, and non-standard layouts.\n2. Output strictly validated JSON schema.\n3. Containerized microservice or clean Python/Node backend with REST endpoint.\n4. Detailed README and test dataset validation report.',
    JSON.stringify(['OCR', 'Computer Vision', 'Python', 'JSON Extraction', 'LLM Parser']),
    750.0,
    new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    'ACTIVE',
    cust1.lastInsertRowid
  );

  const p2 = insertProblem.run(
    'High-Throughput WebSocket Rate-Limiting & Deduplication Engine',
    'high-throughput-websocket-rate-limiting',
    'Our real-time market data feed occasionally spikes to 50,000 messages/sec. We need an ultra-efficient in-memory rate limiter with sliding window log and message deduplication based on cryptographic payload hashing.',
    'Backend & Cloud',
    'Advanced',
    '1. Sub-millisecond latency overhead.\n2. Clean handling of concurrent connections.\n3. Unit tests demonstrating 50k msgs/sec throughput.\n4. Graceful backpressure signaling.',
    JSON.stringify(['WebSockets', 'Rate Limiting', 'Node.js', 'Redis', 'Algorithms']),
    500.0,
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    'ACTIVE',
    cust2.lastInsertRowid
  );

  const p3 = insertProblem.run(
    'Accessible Dark-Mode Component Library with Keyboard Trapping',
    'accessible-dark-mode-component-library',
    'Build a set of 5 enterprise UI components: Modal with focus trap, Autocomplete Combobox with ARIA live region, Multi-level Dropdown, Responsive Data Table, and Toast notifications complying with WCAG 2.1 AAA accessibility standards.',
    'Frontend & UI',
    'Intermediate',
    '1. 100% keyboard navigable with visible focus rings.\n2. Screen reader tested.\n3. Zero layout shifts in light and dark mode.\n4. Live interactive Storybook or demo sandbox.',
    JSON.stringify(['React', 'TailwindCSS', 'Accessibility', 'WCAG', 'Keyboard Nav']),
    350.0,
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    'ACTIVE',
    cust1.lastInsertRowid
  );

  const p4 = insertProblem.run(
    'Offline-First Progressive Web App for Field Data Collection',
    'offline-first-pwa-field-data-collection',
    'A PWA for rural agricultural field inspectors to record crop health metrics, GPS coordinates, and photos without internet connectivity. Must automatically synchronize with conflict resolution once online.',
    'Mobile & PWA',
    'Intermediate',
    '1. IndexedDB offline storage with background sync.\n2. Photo compression before local caching.\n3. Visual sync status indicator.\n4. Conflict-free replicated data approach for concurrent edits.',
    JSON.stringify(['PWA', 'IndexedDB', 'Service Worker', 'React', 'Offline Sync']),
    450.0,
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    'ACTIVE',
    cust2.lastInsertRowid
  );

  // Insert Completed Problem with Winner, Certificate, and Review
  const p5 = insertProblem.run(
    'Automated Kubernetes Cost Allocation & Idle Resource Reclaimer',
    'automated-k8s-cost-allocation-reclaimer',
    'Develop an automated controller that scans dev/staging Kubernetes namespaces for idle pods and over-provisioned memory requests, generating cost savings reports and applying auto-downscaling policies.',
    'DevOps & Cloud',
    'Advanced',
    '1. Generates Prometheus metrics and cost breakdown.\n2. Non-disruptive dry-run mode.\n3. Automatic Slack webhook alerts for savings.',
    JSON.stringify(['Kubernetes', 'DevOps', 'Go', 'Python', 'Cloud Cost']),
    600.0,
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    'COMPLETED',
    cust2.lastInsertRowid
  );

  // Insert Submissions for Completed Problem
  const insertSub = db.prepare(`
    INSERT INTO submissions (problem_id, developer_id, title, description, repo_url, demo_url, status, is_winner, reviewer_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const s1 = insertSub.run(
    p5.lastInsertRowid,
    dev1.lastInsertRowid,
    'KubeTrim: Automated Metrics-Driven Resource Optimizer',
    'Implemented a lightweight daemon controller that monitors 14-day CPU/Memory percentiles and applies scheduled scaling schedules with dry-run verification and Grafana dashboards.',
    'https://github.com/aaravsharma/kubetrim-optimizer',
    'https://kubetrim-demo.up.railway.app',
    'WINNER',
    1,
    'Outstanding documentation, robust dry-run safety mechanisms, and saved our test cluster 34% in cloud spend during benchmark testing!'
  );

  // Update Problem winner
  db.prepare('UPDATE problems SET winner_submission_id = ? WHERE id = ?').run(s1.lastInsertRowid, p5.lastInsertRowid);

  // Insert Certificate
  const certCode = 'PSH-2026-KT8891';
  db.prepare(`
    INSERT INTO certificates (certificate_code, problem_id, submission_id, developer_id, customer_id, award_title, issue_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    certCode,
    p5.lastInsertRowid,
    s1.lastInsertRowid,
    dev1.lastInsertRowid,
    cust2.lastInsertRowid,
    '1st Place Winner & Best Solution',
    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  );

  // Insert Review
  db.prepare(`
    INSERT INTO reviews (problem_id, submission_id, developer_id, customer_id, rating, feedback)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    p5.lastInsertRowid,
    s1.lastInsertRowid,
    dev1.lastInsertRowid,
    cust2.lastInsertRowid,
    5,
    'Aarav delivered exceptional code quality well ahead of our deadline. His Kubernetes controller is now actively saving our team cloud compute costs. Highly recommended!'
  );

  // Insert Transactions
  const insertTx = db.prepare(`
    INSERT INTO transactions (from_user_id, to_user_id, problem_id, amount, type, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertTx.run(
    cust2.lastInsertRowid,
    null,
    p5.lastInsertRowid,
    600.0,
    'ESCROW_LOCK',
    'Escrow reward locked for challenge: Automated Kubernetes Cost Allocation'
  );

  insertTx.run(
    null,
    dev1.lastInsertRowid,
    p5.lastInsertRowid,
    600.0,
    'REWARD_PAYOUT',
    'Reward disbursed to winner Aarav Sharma for winning challenge'
  );

  console.log('Seeding completed successfully!');
}

seed();
