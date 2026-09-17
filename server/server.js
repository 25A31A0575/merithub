const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./database/db');

// Ensure database tables exist and initial data is present
require('./database/seed');

const app = express();
const PORT = process.env.PORT || 5000;

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}`;
}

const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'pragati-university-achievement-portal-secret-2026';

// Cryptographic Password Verification (PBKDF2 with salt)
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
  try {
    const testHash = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch (e) {
    return false;
  }
}

// Lightweight, tamper-proof session token generation with HMAC-SHA256 signature
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    batch_or_designation: user.batch_or_designation,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifyToken(tokenStr) {
  if (!tokenStr) return null;
  const parts = tokenStr.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware: Verifies Bearer Token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in to continue.'
    });
  }
  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.'
    });
  }
  const user = db.prepare('SELECT id, name, email, role, department, batch_or_designation FROM users WHERE id = ?').get(payload.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User account no longer exists in system database.'
    });
  }
  req.user = user;
  next();
}

// Role Guard Middleware: Checks role permissions
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access restricted. Your current role (${req.user.role.toUpperCase()}) is not authorized. Required permission: ${allowedRoles.join(' or ')}.`
      });
    }
    next();
  };
}

// Ensure server/uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// ENTERPRISE SECURITY HARDENING (Step 8)
// ==========================================

// 1. HTTP Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 2. Input Sanitization: Strips dangerous HTML & script tags to prevent Stored & Reflected XSS
function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

// 3. In-Memory Brute-Force Rate Limiter for Login Attempts
const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxAttempts = 30; // Max 30 attempts per minute per IP

  const record = loginAttempts.get(ip);
  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      error: 'Security alert: Too many login attempts from this network. Please wait 60 seconds.'
    });
  }

  record.count++;
  next();
}

// Enable CORS so the browser frontend can communicate with this backend
app.use(cors());

// Enable JSON parsing for incoming requests
app.use(express.json());

// Serve uploaded certificate files statically so they can be viewed/previewed
app.use('/uploads', express.static(uploadDir));

// Configure Multer Storage for Certificate Uploads (with Path-Traversal Sanitization)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize original name to prevent directory traversal
    const safeBaseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '');
    const ext = path.extname(safeBaseName).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `cert_${uniqueSuffix}${ext}`);
  }
});

// File validation filter: allow only PDF, PNG, JPG, JPEG
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/pjpeg'
  ];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only official PDF, PNG, and JPG/JPEG documents are accepted.'
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum file size limit
  },
  fileFilter: fileFilter
});

// Helper: Build dynamic SQL WHERE filter clause for analytics & reports
function buildFilterClause(reqQuery) {
  const { year, department, category, role, status } = reqQuery;
  const whereClauses = [];
  const params = [];

  if (year && year !== 'All') {
    whereClauses.push("strftime('%Y', a.event_date) = ?");
    params.push(year);
  }
  if (department && department !== 'All') {
    whereClauses.push('u.department = ?');
    params.push(department);
  }
  if (category && category !== 'All') {
    whereClauses.push('a.category = ?');
    params.push(category);
  }
  if (role && role !== 'All') {
    if (role === 'student') {
      whereClauses.push("u.role = 'student'");
    } else if (role === 'faculty') {
      whereClauses.push("u.role IN ('faculty', 'verifier')");
    }
  }
  if (status && status !== 'All') {
    whereClauses.push('a.status = ?');
    params.push(status);
  }

  const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';
  return { whereSql, params };
}

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MeritHub Backend API is running!',
    database: 'connected (SQLite)',
    timestamp: new Date().toISOString()
  });
});

// 2. Public Statistics endpoint
app.get('/api/stats', (req, res) => {
  try {
    const totalAchievements = db.prepare('SELECT COUNT(*) AS count FROM achievements').get().count;
    const verifiedAchievements = db.prepare("SELECT COUNT(*) AS count FROM achievements WHERE status = 'approved'").get().count;
    const pendingAchievements = db.prepare("SELECT COUNT(*) AS count FROM achievements WHERE status = 'pending'").get().count;
    const rejectedAchievements = db.prepare("SELECT COUNT(*) AS count FROM achievements WHERE status = 'rejected'").get().count;
    const studentCount = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'student'").get().count;
    const facultyCount = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role IN ('faculty', 'verifier')").get().count;

    res.json({
      success: true,
      stats: {
        totalAchievements,
        verifiedAchievements,
        pendingAchievements,
        rejectedAchievements,
        studentCount,
        facultyCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// AUTHENTICATION & DEMO ACCESS ENDPOINTS
// ==========================================

// Institutional Login Endpoint (Protected by Rate Limiting)
app.post('/api/auth/login', rateLimitLogin, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Institutional email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Map any legacy/alternate emails to standard demo accounts
    const emailAliases = {
      'aarav.cs23@pragati.edu': 'student@pragati.edu',
      'sunita.rao@pragati.edu': 'faculty@pragati.edu',
      'vikram.mehta@pragati.edu': 'verifier@pragati.edu',
      'anita.desai@pragati.edu': 'admin@pragati.edu'
    };
    const targetEmail = emailAliases[cleanEmail] || cleanEmail;

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(targetEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid institutional email or password. Please verify your credentials.'
      });
    }

    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid institutional email or password. Please verify your credentials.'
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      batch_or_designation: user.batch_or_designation
    };

    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: `Welcome, ${safeUser.name}! Authenticated as ${safeUser.role.toUpperCase()}.`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server authentication error: ' + err.message });
  }
});

// Current User Profile Endpoint
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Judge Demo Role Switcher Endpoint (Quick switch for hackathon evaluation)
app.post('/api/auth/demo-switch', (req, res) => {
  try {
    const { role } = req.body;
    const roleEmailMap = {
      student: 'student@pragati.edu',
      faculty: 'faculty@pragati.edu',
      verifier: 'verifier@pragati.edu',
      admin: 'admin@pragati.edu'
    };

    const email = roleEmailMap[role];
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Invalid demo role. Allowed values: student, faculty, verifier, admin'
      });
    }

    const user = db.prepare('SELECT id, name, email, role, department, batch_or_designation FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Demo account for role "${role}" not found in database.`
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Switched demo identity to ${user.name} (${user.role.toUpperCase()})`,
      token,
      user
    });
  } catch (err) {
    console.error('Demo switch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ANALYTICS & REPORTS (Protected: Admin / Verifier)
// ==========================================

// 3. Analytics Engine Endpoint (for Admin / HOD Dashboard Charts & Summary)
app.get('/api/analytics', authenticate, requireRole(['admin', 'verifier']), (req, res) => {
  try {
    const { whereSql, params } = buildFilterClause(req.query);

    // 1. Summary Metrics
    const total = db.prepare(`SELECT COUNT(*) as count FROM achievements a JOIN users u ON a.user_id = u.id ${whereSql}`).get(...params).count;
    const approved = db.prepare(`SELECT COUNT(*) as count FROM achievements a JOIN users u ON a.user_id = u.id ${whereSql ? whereSql + " AND a.status = 'approved'" : " WHERE a.status = 'approved'"}`).get(...params).count;
    const pending = db.prepare(`SELECT COUNT(*) as count FROM achievements a JOIN users u ON a.user_id = u.id ${whereSql ? whereSql + " AND a.status = 'pending'" : " WHERE a.status = 'pending'"}`).get(...params).count;
    const rejected = db.prepare(`SELECT COUNT(*) as count FROM achievements a JOIN users u ON a.user_id = u.id ${whereSql ? whereSql + " AND a.status = 'rejected'" : " WHERE a.status = 'rejected'"}`).get(...params).count;
    const studentAchievements = db.prepare(`SELECT COUNT(*) as count FROM achievements a JOIN users u ON a.user_id = u.id ${whereSql ? whereSql + " AND u.role = 'student'" : " WHERE u.role = 'student'"}`).get(...params).count;
    const facultyAchievements = db.prepare(`SELECT COUNT(*) as count FROM achievements a JOIN users u ON a.user_id = u.id ${whereSql ? whereSql + " AND u.role IN ('faculty', 'verifier')" : " WHERE u.role IN ('faculty', 'verifier')"}`).get(...params).count;

    // 2. Category Breakdown
    const byCategory = db.prepare(`
      SELECT a.category, COUNT(*) as count 
      FROM achievements a 
      JOIN users u ON a.user_id = u.id 
      ${whereSql}
      GROUP BY a.category 
      ORDER BY count DESC
    `).all(...params);

    // 3. Department Breakdown
    const byDepartment = db.prepare(`
      SELECT u.department, COUNT(*) as count 
      FROM achievements a 
      JOIN users u ON a.user_id = u.id 
      ${whereSql}
      GROUP BY u.department 
      ORDER BY count DESC
    `).all(...params);

    // 4. Academic / Event Year Trend
    const byYear = db.prepare(`
      SELECT strftime('%Y', a.event_date) as year, COUNT(*) as count 
      FROM achievements a 
      JOIN users u ON a.user_id = u.id 
      ${whereSql}
      GROUP BY year 
      ORDER BY year ASC
    `).all(...params);

    // 5. Individual Records for the Institutional Table Preview
    const records = db.prepare(`
      SELECT 
        a.id, a.title, a.category, a.event_name, a.event_date, a.position_rank, a.status, a.verified_at,
        u.name as submitter_name, u.role as submitter_role, u.department as submitter_department,
        v.name as verifier_name
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verifier_id = v.id
      ${whereSql}
      ORDER BY a.id DESC
    `).all(...params);

    res.json({
      success: true,
      summary: {
        total,
        approved,
        pending,
        rejected,
        studentAchievements,
        facultyAchievements
      },
      byCategory,
      byDepartment,
      byYear,
      byStatus: { approved, pending, rejected },
      records
    });
  } catch (err) {
    console.error('Analytics query error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Report Generation: Export Filtered Records as CSV
app.get('/api/reports/export-csv', authenticate, requireRole(['admin', 'verifier']), (req, res) => {
  try {
    const { whereSql, params } = buildFilterClause(req.query);

    const records = db.prepare(`
      SELECT 
        a.id, a.title, a.category, a.event_name, a.event_date, a.position_rank, a.status, a.verified_at,
        u.name as submitter_name, u.role as submitter_role, u.department as submitter_department,
        v.name as verifier_name
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verifier_id = v.id
      ${whereSql}
      ORDER BY a.id DESC
    `).all(...params);

    const escapeCsv = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

    const headers = [
      'Achievement ID',
      'Title',
      'Category',
      'Achiever Name',
      'Role',
      'Department',
      'Event / Organization',
      'Event Date',
      'Position / Rank',
      'Verification Status',
      'Verified By',
      'Verified Timestamp'
    ];

    const rows = records.map((r) =>
      [
        r.id,
        escapeCsv(r.title),
        escapeCsv(r.category),
        escapeCsv(r.submitter_name),
        escapeCsv(r.submitter_role),
        escapeCsv(r.submitter_department),
        escapeCsv(r.event_name),
        escapeCsv(r.event_date),
        escapeCsv(r.position_rank),
        escapeCsv(r.status),
        escapeCsv(r.verifier_name || 'Unassigned'),
        escapeCsv(r.verified_at || 'Pending')
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="pragati_university_achievements_report.csv"'
    );
    res.send(csvContent);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).send('Error generating CSV report: ' + err.message);
  }
});

// 5. Get achievements with submitter and verifier details (Public Showcase)
app.get('/api/achievements', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT 
        a.id,
        a.title,
        a.category,
        a.event_name,
        a.event_date,
        a.position_rank,
        a.description,
        a.certificate_url,
        a.status,
        a.verifier_remarks,
        a.verified_at,
        a.created_at,
        u.name AS submitter_name,
        u.role AS submitter_role,
        u.department AS submitter_department,
        u.batch_or_designation AS submitter_designation,
        v.name AS verifier_name
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verifier_id = v.id
    `;

    const params = [];
    if (status) {
      query += ` WHERE a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.id DESC`;

    const achievements = db.prepare(query).all(...params);
    res.json({ success: true, count: achievements.length, achievements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Pending Queue for Faculty Verifier Desk (Protected: Verifier / Admin)
app.get('/api/achievements/pending', authenticate, requireRole(['verifier', 'admin']), (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.user_id,
        a.title,
        a.category,
        a.event_name,
        a.event_date,
        a.position_rank,
        a.description,
        a.certificate_url,
        a.status,
        a.created_at,
        u.name AS submitter_name,
        u.role AS submitter_role,
        u.department AS submitter_department,
        u.batch_or_designation AS submitter_designation
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'pending'
      ORDER BY a.id ASC
    `;
    const pendingList = db.prepare(query).all();
    res.json({ success: true, count: pendingList.length, achievements: pendingList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Approve Achievement Endpoint (Protected: Verifier / Admin)
app.post('/api/achievements/:id/approve', authenticate, requireRole(['verifier', 'admin']), (req, res) => {
  try {
    const achievementId = parseInt(req.params.id, 10);
    const { remarks } = req.body;

    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId);
    if (!achievement) {
      return res.status(404).json({ success: false, error: 'Achievement record not found.' });
    }

    if (achievement.status === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'This achievement has already been verified and approved.'
      });
    }

    const cleanRemarks = sanitizeInput(remarks);
    const defaultRemarks =
      cleanRemarks && cleanRemarks.length > 0
        ? cleanRemarks
        : 'Official certificate and supporting credentials authenticated by department faculty verifier.';

    const verifierId = req.user.id;
    const verifierName = req.user.name;

    const updateStmt = db.prepare(`
      UPDATE achievements
      SET status = 'approved',
          verifier_id = ?,
          verifier_remarks = ?,
          verified_at = datetime('now')
      WHERE id = ?
    `);
    updateStmt.run(verifierId, defaultRemarks, achievementId);

    db.prepare(`
      INSERT INTO verification_logs (achievement_id, action, performed_by, remarks, timestamp)
      VALUES (?, 'approved', ?, ?, datetime('now'))
    `).run(achievementId, verifierId, defaultRemarks);

    res.json({
      success: true,
      message: 'Achievement approved successfully! It is now live on the public showcase.',
      achievementId: achievementId,
      status: 'approved',
      verified_by: verifierName
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
});

// 8. Reject Achievement Endpoint (Protected: Verifier / Admin)
app.post('/api/achievements/:id/reject', authenticate, requireRole(['verifier', 'admin']), (req, res) => {
  try {
    const achievementId = parseInt(req.params.id, 10);
    const { remarks } = req.body;

    const cleanRemarks = sanitizeInput(remarks);
    if (!cleanRemarks || !cleanRemarks.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Rejection remarks are mandatory. You must explain why the submission was rejected.'
      });
    }

    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId);
    if (!achievement) {
      return res.status(404).json({ success: false, error: 'Achievement record not found.' });
    }

    const verifierId = req.user.id;
    const verifierName = req.user.name;

    const updateStmt = db.prepare(`
      UPDATE achievements
      SET status = 'rejected',
          verifier_id = ?,
          verifier_remarks = ?,
          verified_at = datetime('now')
      WHERE id = ?
    `);
    updateStmt.run(verifierId, cleanRemarks, achievementId);

    db.prepare(`
      INSERT INTO verification_logs (achievement_id, action, performed_by, remarks, timestamp)
      VALUES (?, 'rejected', ?, ?, datetime('now'))
    `).run(achievementId, verifierId, cleanRemarks);

    res.json({
      success: true,
      message: 'Achievement rejected. Feedback has been recorded for the submitter.',
      achievementId: achievementId,
      status: 'rejected',
      verified_by: verifierName,
      remarks: cleanRemarks
    });
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ success: false, error: 'Server error: ' + error.message });
  }
});

// 9. Fix & Re-submit Endpoint (Protected: Must be achievement owner or admin)
app.post('/api/achievements/:id/resubmit', authenticate, (req, res) => {
  upload.single('certificate')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File exceeds 5 MB limit.' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      const achievementId = parseInt(req.params.id, 10);
      const { title, description, event_name, event_date, position_rank, category, resubmit_notes } = req.body;

      const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId);
      if (!achievement) {
        return res.status(404).json({ success: false, error: 'Achievement record not found.' });
      }

      // Enforce ownership: users cannot modify another user's submission
      if (achievement.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to modify another user\'s achievement.'
        });
      }

      let newCertUrl = achievement.certificate_url;
      if (req.file) {
        newCertUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
      }

      const cleanTitle = sanitizeInput(title);
      const cleanCat = sanitizeInput(category);
      const cleanEvent = sanitizeInput(event_name);
      const cleanDate = sanitizeInput(event_date);
      const cleanRank = sanitizeInput(position_rank);
      const cleanDesc = sanitizeInput(description);
      const cleanNotes = sanitizeInput(resubmit_notes);

      const updateStmt = db.prepare(`
        UPDATE achievements
        SET title = COALESCE(?, title),
            category = COALESCE(?, category),
            event_name = COALESCE(?, event_name),
            event_date = COALESCE(?, event_date),
            position_rank = COALESCE(?, position_rank),
            description = COALESCE(?, description),
            certificate_url = ?,
            status = 'pending',
            verifier_remarks = NULL,
            verified_at = NULL
        WHERE id = ?
      `);

      updateStmt.run(
        cleanTitle || null,
        cleanCat || null,
        cleanEvent || null,
        cleanDate || null,
        cleanRank || null,
        cleanDesc || null,
        newCertUrl,
        achievementId
      );

      const logNotes = cleanNotes
        ? `Re-submitted: ${cleanNotes}`
        : 'Re-submitted with updated evidence/details by achiever. Re-queued for verification.';

      db.prepare(`
        INSERT INTO verification_logs (achievement_id, action, performed_by, remarks, timestamp)
        VALUES (?, 'resubmitted', ?, ?, datetime('now'))
      `).run(achievementId, req.user.id, logNotes);

      res.json({
        success: true,
        message: 'Achievement re-submitted successfully and returned to the faculty verification queue.',
        achievementId: achievementId,
        status: 'pending'
      });
    } catch (error) {
      console.error('Resubmit error:', error);
      res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
  });
});

// 10. Get Audit Log History for an Achievement
app.get('/api/achievements/:id/logs', (req, res) => {
  try {
    const achievementId = parseInt(req.params.id, 10);
    const logs = db.prepare(`
      SELECT 
        l.id,
        l.achievement_id,
        l.action,
        l.remarks,
        l.timestamp,
        u.name AS actor_name,
        u.role AS actor_role
      FROM verification_logs l
      LEFT JOIN users u ON l.performed_by = u.id
      WHERE l.achievement_id = ?
      ORDER BY l.id ASC
    `).all(achievementId);

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Achievement Submission Endpoint with Multer File Upload (Protected: Authenticated User)
app.post('/api/achievements', authenticate, (req, res) => {
  upload.single('certificate')(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File is too large. Maximum allowed size is 5 MB.'
          });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      const {
        title,
        category,
        event_name,
        event_date,
        position_rank,
        description
      } = req.body;

      const cleanTitle = sanitizeInput(title);
      const cleanCat = sanitizeInput(category);
      const cleanEvent = sanitizeInput(event_name);
      const cleanDate = sanitizeInput(event_date);
      const cleanRank = sanitizeInput(position_rank) || 'Participant / Achiever';
      const cleanDesc = sanitizeInput(description);

      if (!cleanTitle) {
        return res.status(400).json({ success: false, error: 'Achievement title is required.' });
      }
      if (!cleanCat) {
        return res.status(400).json({ success: false, error: 'Category is required.' });
      }
      if (!cleanEvent) {
        return res.status(400).json({ success: false, error: 'Event/Organization is required.' });
      }
      if (!cleanDate) {
        return res.status(400).json({ success: false, error: 'Event date is required.' });
      }
      if (!cleanDesc) {
        return res.status(400).json({ success: false, error: 'Description is required.' });
      }
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Certificate or supporting evidence file is required.'
        });
      }

      const certificateUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;

      const insertAch = db.prepare(`
        INSERT INTO achievements (
          user_id, title, category, event_name, event_date, position_rank,
          description, certificate_url, status, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now')
        )
      `);

      const result = insertAch.run(
        req.user.id,
        cleanTitle,
        cleanCat,
        cleanEvent,
        cleanDate,
        cleanRank,
        cleanDesc,
        certificateUrl
      );

      const achievementId = result.lastInsertRowid;

      db.prepare(`
        INSERT INTO verification_logs (achievement_id, action, performed_by, remarks, timestamp)
        VALUES (?, 'submitted', ?, 'Achievement submitted by achiever. Awaiting faculty verification.', datetime('now'))
      `).run(achievementId, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Achievement submitted successfully',
        achievementId: achievementId,
        status: 'pending',
        certificateUrl: certificateUrl,
        notice:
          'Your achievement has been submitted with status PENDING. It will undergo faculty scrutiny before appearing on the public showcase.'
      });
    } catch (dbErr) {
      console.error('Database insertion error:', dbErr);
      res.status(500).json({ success: false, error: 'Database error: ' + dbErr.message });
    }
  });
});

// 12. Get authenticated user's own submissions (Protected: Returns only user's records)
app.get('/api/submissions/my', authenticate, (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.title,
        a.category,
        a.event_name,
        a.event_date,
        a.position_rank,
        a.description,
        a.certificate_url,
        a.status,
        a.verifier_remarks,
        a.verified_at,
        a.created_at,
        u.name AS submitter_name,
        u.role AS submitter_role,
        u.department AS submitter_department,
        v.name AS verifier_name
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verifier_id = v.id
      WHERE a.user_id = ?
      ORDER BY a.id DESC
    `;
    const submissions = db.prepare(query).all(req.user.id);
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Get recent submissions for the demo "My Submissions" tracker
app.get('/api/submissions/recent', (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.title,
        a.category,
        a.event_name,
        a.event_date,
        a.position_rank,
        a.description,
        a.certificate_url,
        a.status,
        a.verifier_remarks,
        a.verified_at,
        a.created_at,
        u.name AS submitter_name,
        u.role AS submitter_role,
        u.department AS submitter_department,
        v.name AS verifier_name
      FROM achievements a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verifier_id = v.id
      ORDER BY a.id DESC
      LIMIT 25
    `;
    const submissions = db.prepare(query).all();
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13. Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, department, batch_or_designation, created_at 
      FROM users 
      ORDER BY id ASC
    `).all();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve built frontend assets in production (if client/dist exists)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT}`);
  console.log(`Health check: /api/health`);
  console.log(`Public Stats: /api/stats`);
  console.log(`Analytics API: /api/analytics`);
  console.log(`CSV Export: /api/reports/export-csv`);
});
