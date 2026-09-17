const db = require('./db');

// 1. Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'verifier', 'admin')),
    department TEXT NOT NULL,
    batch_or_designation TEXT NOT NULL,
    password_hash TEXT,
    password_salt TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_date TEXT NOT NULL,
    position_rank TEXT NOT NULL,
    description TEXT NOT NULL,
    certificate_url TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
    verifier_id INTEGER REFERENCES users(id),
    verifier_remarks TEXT,
    verified_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS verification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id),
    action TEXT NOT NULL,
    performed_by INTEGER NOT NULL REFERENCES users(id),
    remarks TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add password columns if table already existed without them
const tableCols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
if (!tableCols.includes('password_hash')) {
  db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;");
}
if (!tableCols.includes('password_salt')) {
  db.exec("ALTER TABLE users ADD COLUMN password_salt TEXT;");
}

console.log('Database tables verified or created successfully.');

// 2. Check if data already exists to prevent duplicate entries
const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

if (userCount === 0) {
  console.log('Seeding initial sample data for fictional college: Pragati University...');

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, role, department, batch_or_designation)
    VALUES (@name, @email, @role, @department, @batch_or_designation)
  `);

  const sampleUsers = [
    {
      name: 'Aarav Patel',
      email: 'aarav.cs23@pragati.edu',
      role: 'student',
      department: 'Computer Science & Engineering',
      batch_or_designation: '3rd Year B.Tech'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.ece22@pragati.edu',
      role: 'student',
      department: 'Electronics & Communication',
      batch_or_designation: '4th Year B.Tech'
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.mech24@pragati.edu',
      role: 'student',
      department: 'Mechanical Engineering',
      batch_or_designation: '2nd Year B.Tech'
    },
    {
      name: 'Dr. Sunita Rao',
      email: 'sunita.rao@pragati.edu',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      batch_or_designation: 'Associate Professor'
    },
    {
      name: 'Prof. Vikram Mehta',
      email: 'vikram.mehta@pragati.edu',
      role: 'verifier',
      department: 'Electrical Engineering',
      batch_or_designation: 'HOD & Chief Faculty Verifier'
    },
    {
      name: 'Dr. Anita Desai',
      email: 'anita.desai@pragati.edu',
      role: 'admin',
      department: 'Academic Affairs',
      batch_or_designation: 'Dean of Academics'
    }
  ];

  const userIds = {};
  for (const user of sampleUsers) {
    const result = insertUser.run(user);
    userIds[user.name] = result.lastInsertRowid;
  }
  console.log(`Inserted ${sampleUsers.length} sample users.`);

  // Insert Achievements
  const insertAchievement = db.prepare(`
    INSERT INTO achievements (
      user_id, title, category, event_name, event_date, position_rank,
      description, certificate_url, status, verifier_id, verifier_remarks, verified_at
    ) VALUES (
      @user_id, @title, @category, @event_name, @event_date, @position_rank,
      @description, @certificate_url, @status, @verifier_id, @verifier_remarks, @verified_at
    )
  `);

  const insertLog = db.prepare(`
    INSERT INTO verification_logs (achievement_id, action, performed_by, remarks, timestamp)
    VALUES (@achievement_id, @action, @performed_by, @remarks, @timestamp)
  `);

  const verifierId = userIds['Prof. Vikram Mehta'];

  const sampleAchievements = [
    {
      user_id: userIds['Aarav Patel'],
      title: '1st Place Grand Finale Winner - Smart India Hackathon',
      category: 'Hackathon',
      event_name: 'Smart India Hackathon 2026 (Ministry of Education)',
      event_date: '2026-03-12',
      position_rank: '1st Place / Winner',
      description: 'Built an AI-powered disaster management alert system for remote coastal regions.',
      certificate_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60',
      status: 'approved',
      verifier_id: verifierId,
      verifier_remarks: 'Outstanding achievement! Certificate verified against SIH official portal credentials.',
      verified_at: '2026-03-14 11:30:00'
    },
    {
      user_id: userIds['Dr. Sunita Rao'],
      title: 'Published IEEE Research Paper on Edge Computing and AI',
      category: 'Research',
      event_name: 'IEEE International Conference on Advanced Computing (ICAC)',
      event_date: '2026-02-18',
      position_rank: 'Best Paper Award',
      description: 'Paper titled "Low-Latency Edge AI Inference on Embedded Devices" published in IEEE Xplore.',
      certificate_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=60',
      status: 'approved',
      verifier_id: verifierId,
      verifier_remarks: 'DOI verified on IEEE Xplore. Excellent research contribution for college NAAC records.',
      verified_at: '2026-02-22 15:45:00'
    },
    {
      user_id: userIds['Rohan Verma'],
      title: 'Gold Medalist - State Inter-University Badminton Championship',
      category: 'Sports',
      event_name: 'State University Athletic Association Tournament',
      event_date: '2026-01-20',
      position_rank: 'Gold Medal / 1st Place',
      description: 'Won singles badminton championship representing Pragati University against 24 universities.',
      certificate_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=60',
      status: 'approved',
      verifier_id: verifierId,
      verifier_remarks: 'Verified with College Sports Director. Official medal certificate authenticated.',
      verified_at: '2026-01-25 10:15:00'
    },
    {
      user_id: userIds['Priya Sharma'],
      title: 'Google Cloud Certified Associate Cloud Engineer',
      category: 'Certification',
      event_name: 'Google Cloud Official Certification Exam',
      event_date: '2026-04-05',
      position_rank: 'Certified Professional',
      description: 'Demonstrated proficiency in deploying applications and maintaining cloud infrastructure.',
      certificate_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
      status: 'pending',
      verifier_id: null,
      verifier_remarks: null,
      verified_at: null
    },
    {
      user_id: userIds['Aarav Patel'],
      title: 'Autonomous Agricultural Drone Prototype for Crop Health',
      category: 'Innovation',
      event_name: 'National Student Innovation & Startup Expo',
      event_date: '2026-04-10',
      position_rank: 'Finalist / Top 10 National',
      description: 'Designed a lightweight multispectral drone capable of identifying early stage crop pests.',
      certificate_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=60',
      status: 'pending',
      verifier_id: null,
      verifier_remarks: null,
      verified_at: null
    },
    {
      user_id: userIds['Rohan Verma'],
      title: 'Participation in Online 2-Hour Web Design Sprint',
      category: 'Coding',
      event_name: 'WebDev Online Community Sprint',
      event_date: '2026-03-01',
      position_rank: 'Participant',
      description: 'Participated in a 2-hour front-end coding sprint.',
      certificate_url: 'https://images.unsplash.com/photo-1589330694653-dad6bf49cfaa?w=600&auto=format&fit=crop&q=60',
      status: 'rejected',
      verifier_id: verifierId,
      verifier_remarks: 'Uploaded document is a blurry screenshot with no verifiable certificate ID or signature. Please re-upload official scanned certificate.',
      verified_at: '2026-03-05 14:20:00'
    }
  ];

  for (const ach of sampleAchievements) {
    const res = insertAchievement.run(ach);
    const achievementId = res.lastInsertRowid;

    // Add initial submit log
    insertLog.run({
      achievement_id: achievementId,
      action: 'submitted',
      performed_by: ach.user_id,
      remarks: 'Achievement submitted for departmental verification.',
      timestamp: ach.event_date + ' 10:00:00'
    });

    // If verified or rejected, add the review log
    if (ach.status === 'approved' || ach.status === 'rejected') {
      insertLog.run({
        achievement_id: achievementId,
        action: ach.status,
        performed_by: ach.verifier_id,
        remarks: ach.verifier_remarks,
        timestamp: ach.verified_at
      });
    }
  }

  console.log(`Inserted ${sampleAchievements.length} sample achievements with audit logs.`);
} else {
  console.log(`Database already contains ${userCount} users. Skipping seed to prevent duplicates.`);
}

// 3. Demo Accounts & Password Migration
const crypto = require('crypto');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Update demo accounts to standard emails if they still have the initial seed emails
try {
  db.prepare("UPDATE users SET email = 'student@pragati.edu' WHERE id = 1 AND email = 'aarav.cs23@pragati.edu'").run();
  db.prepare("UPDATE users SET email = 'faculty@pragati.edu' WHERE id = 4 AND email = 'sunita.rao@pragati.edu'").run();
  db.prepare("UPDATE users SET email = 'verifier@pragati.edu' WHERE id = 5 AND email = 'vikram.mehta@pragati.edu'").run();
  db.prepare("UPDATE users SET email = 'admin@pragati.edu' WHERE id = 6 AND email = 'anita.desai@pragati.edu'").run();
} catch (e) {
  // If unique constraint or already updated, ignore
}

// Ensure all users have hashed password (default: Pragati@2026)
const usersWithoutPassword = db.prepare("SELECT id FROM users WHERE password_hash IS NULL").all();
const updatePasswordStmt = db.prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?");

for (const u of usersWithoutPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword('Pragati@2026', salt);
  updatePasswordStmt.run(hash, salt, u.id);
}
if (usersWithoutPassword.length > 0) {
  console.log(`Secured ${usersWithoutPassword.length} user accounts with PBKDF2 password hashes.`);
}

module.exports = { hashPassword };
