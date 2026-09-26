import { createClient, type Client, type InArgs, type InStatement } from '@libsql/client';
import bcrypt from 'bcryptjs';

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

function getClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL is not configured. Create a Turso database and add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to your Vercel project environment variables.'
    );
  }

  client = createClient({ url, authToken });
  return client;
}

export function isCloudDatabaseConfigured() {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
): Promise<T[]> {
  await initDb();
  const result = await getClient().execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

export async function execute(sql: string, args: InArgs = []) {
  await initDb();
  return getClient().execute({ sql, args });
}

export async function batch(statements: InStatement[]) {
  await initDb();
  return getClient().batch(statements, 'write');
}

export async function initDb(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = getClient();

    await db.batch([
      { sql: `CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS resources (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT, class_level INTEGER NOT NULL, board TEXT NOT NULL DEFAULT 'JKBOSE', subject TEXT NOT NULL, chapter TEXT, topic TEXT, resource_type TEXT NOT NULL, paper_type TEXT, year INTEGER, school_name TEXT, contributor_name TEXT, file_url TEXT NOT NULL, file_size INTEGER NOT NULL DEFAULT 0, file_type TEXT NOT NULL DEFAULT 'application/pdf', file_name TEXT NOT NULL, file_hash TEXT, status TEXT NOT NULL DEFAULT 'pending', rejection_reason TEXT, featured INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0, downloads INTEGER NOT NULL DEFAULT 0, average_rating REAL NOT NULL DEFAULT 0.0, rating_count INTEGER NOT NULL DEFAULT 0, tags TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, approved_at TEXT)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, class_level INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, subject_id INTEGER NOT NULL, name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS ratings (id INTEGER PRIMARY KEY AUTOINCREMENT, resource_id INTEGER NOT NULL, session_id TEXT NOT NULL, rating INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(resource_id, session_id))`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS downloads (id INTEGER PRIMARY KEY AUTOINCREMENT, resource_id INTEGER NOT NULL, session_id TEXT NOT NULL, created_at TEXT NOT NULL)`, args: [] },\n      { sql: `CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, rating INTEGER NOT NULL, review TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`, args: [] },\n      { sql: `CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_class ON resources(class_level)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(featured)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_paper_type ON resources(paper_type)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_year ON resources(year)`, args: [] },
    ], 'write');

    // Safe migration for databases created before contributor/review fields existed.
    await db.execute({ sql: `ALTER TABLE resources ADD COLUMN contributor_name TEXT`, args: [] }).catch(() => {});

    const admin = await db.execute({
      sql: 'SELECT COUNT(*) AS count FROM admin_users',
      args: [],
    });

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    if (Number(admin.rows[0]?.count ?? 0) === 0) {
      const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await db.execute({
        sql: 'INSERT OR IGNORE INTO admin_users (username, password_hash, created_at) VALUES (?, ?, ?)',
        args: [adminUsername, hash, new Date().toISOString()],
      });
    }

    // Seeding is intentionally idempotent. Vercel may start several
    // serverless instances at the same time, so a COUNT-then-INSERT check
    // can race. seedDatabase uses INSERT OR IGNORE on the unique slug.
    await seedDatabase(db);
  })().catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

async function seedDatabase(db: Client) {
  const now = new Date().toISOString();
  const seed = [
    ['class-10-science-chemical-reactions-complete-notes','Chemical Reactions & Equations — Complete Notes','Comprehensive, student-friendly chapter notes covering combination, decomposition, displacement, double displacement, redox reactions, balancing equations, and JKBOSE board pattern questions.',10,'JKBOSE','Science','Chemical Reactions and Equations','Chemistry','Notes',null,2025,null,'/uploads/class10_science_chem_reactions_notes.pdf',1450000,'application/pdf','class10_science_chem_reactions_notes.pdf',1,345,189,4.8,24,'science,chemistry,notes,jkbose,class10'],
    ['class-10-science-jkbose-board-paper-2025','Class 10 Science — JKBOSE Annual Board Paper 2025','Official JKBOSE Class 10 Science Annual Examination Question Paper (Series A, B, C) with mark distribution and key solutions.',10,'JKBOSE','Science',null,null,'Previous Year Paper','Board',2025,null,'/uploads/class10_science_jkbose_board_2025.pdf',2100000,'application/pdf','class10_science_jkbose_board_2025.pdf',1,522,311,4.9,38,'jkbose,board paper,science,class10,2025'],
    ['class-10-science-preboard-paper-2026-dps','Class 10 Science — Pre-Board Paper 2026 (DPS Srinagar)','Delhi Public School Srinagar Class 10 Pre-Board Examination paper with high yield expected questions for JKBOSE & CBSE boards.',10,'JKBOSE','Science',null,null,'Previous Year Paper','Pre-board',2026,'Delhi Public School Srinagar','/uploads/class10_science_preboard_2026_dps.pdf',1800000,'application/pdf','class10_science_preboard_2026_dps.pdf',1,290,145,4.7,15,'preboard,dps,science,class10,2026'],
    ['class-10-mathematics-quadratic-equations-notes','Quadratic Equations — Formula Sheet & Important Solved Examples','Quick revision formula sheet covering standard form, quadratic formula, factorization method, completing the square, and nature of roots with solved JKBOSE PYQs.',10,'JKBOSE','Mathematics','Quadratic Equations','Algebra','Formula Sheet',null,2025,null,'/uploads/class10_math_quadratic_equations.pdf',980000,'application/pdf','class10_math_quadratic_equations.pdf',1,410,230,4.6,19,'math,quadratic equations,formulas,class10'],
    ['class-10-mathematics-jkbose-board-paper-2025','Class 10 Mathematics — JKBOSE Board Paper 2025','Official 2025 Annual Board Examination paper for Mathematics Class 10 JKBOSE. Includes step-by-step solved marking scheme.',10,'JKBOSE','Mathematics',null,null,'Previous Year Paper','Board',2025,null,'/uploads/class10_math_jkbose_2025.pdf',2400000,'application/pdf','class10_math_jkbose_2025.pdf',0,611,412,5,1,'math,board paper,jkbose,class10'],
    ['class-12-physics-electrostatics-revision-notes','Electrostatics & Electric Charges — Class 12 Physics Revision Notes','Detailed handwritten & typed notes for Class 12 Physics Electrostatics. Covers Coulomb\'s Law, Electric Dipole, Gauss\'s Law applications and capacitance derivation.',12,'JKBOSE','Physics','Electrostatics','Physics','Notes',null,2025,null,'/uploads/class12_physics_electrostatics.pdf',3200000,'application/pdf','class12_physics_electrostatics.pdf',1,480,295,5,31,'class12,physics,electrostatics,notes'],
    ['class-12-physics-jkbose-previous-year-questions','Class 12 Physics — 5-Year Chapterwise JKBOSE Solved PYQs','Chapterwise previous 5 years (2020-2025) solved questions for Class 12 Physics. Includes 1-mark, 2-mark, 3-mark, and 5-mark long answer questions.',12,'JKBOSE','Physics','All Chapters','PYQs','Study Material',null,2025,null,'/uploads/class12_physics_pyqs_5yrs.pdf',4500000,'application/pdf','class12_physics_pyqs_5yrs.pdf',1,750,512,4.8,56,'class12,physics,pyq,jkbose,solved'],
    ['class-11-chemistry-some-basic-concepts-notes','Some Basic Concepts of Chemistry — Revision & Formula Notes','Mole concept, stoichiometry, limiting reagent, molarity, molality, mass percent formulas, and solved numerical problems for Class 11 JKBOSE.',11,'JKBOSE','Chemistry','Some Basic Concepts of Chemistry','Physical Chemistry','Notes',null,2025,null,'/uploads/class11_chem_basic_concepts.pdf',1650000,'application/pdf','class11_chem_basic_concepts.pdf',0,210,115,4.5,11,'class11,chemistry,mole concept,notes'],
    ['class-9-science-matter-in-our-surroundings-notes','Matter in Our Surroundings — Class 9 Science Notes & Q&A','States of matter, evaporation, latent heat of vaporization, sublimation, and NCERT / JKBOSE textbook exercise answers.',9,'JKBOSE','Science','Matter in Our Surroundings','Chemistry','Notes',null,2025,null,'/uploads/class9_science_matter.pdf',1200000,'application/pdf','class9_science_matter.pdf',0,180,98,4.7,8,'class9,science,matter,notes'],
    ['class-9-mathematics-annual-school-exam-paper-2025','Class 9 Mathematics — Annual Examination Paper (Army Public School)','Army Public School final examination paper for Class 9 Mathematics. Ideal practice paper for JKBOSE Class 9 students.',9,'JKBOSE','Mathematics',null,null,'Previous Year Paper','Annual/Final',2025,'Army Public School','/uploads/class9_math_annual_aps.pdf',1500000,'application/pdf','class9_math_annual_aps.pdf',0,240,130,4.6,14,'class9,math,annual paper,army public school'],
  ];

  for (const r of seed) {
    const [slug,title,description,classLevel,board,subject,chapter,topic,type,paperType,year,school,fileUrl,fileSize,fileType,fileName,featured,views,downloads,avg,ratingCount,tags] = r;
    await db.execute({
      sql: `INSERT OR IGNORE INTO resources (slug,title,description,class_level,board,subject,chapter,topic,resource_type,paper_type,year,school_name,file_url,file_size,file_type,file_name,file_hash,status,featured,views,downloads,average_rating,rating_count,tags,created_at,updated_at,approved_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?,?,?,?,?,?)`,
      args: [slug,title,description,classLevel,board,subject,chapter,topic,type,paperType,year,school,fileUrl,fileSize,fileType,fileName,`seed_hash_${slug}`,featured,views,downloads,avg,ratingCount,tags,now,now,now],
    });
  }
}
