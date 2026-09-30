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

function jsonSafeValue(value: unknown): unknown {
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(jsonSafeValue);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = jsonSafeValue(item);
    return out;
  }
  return value;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
): Promise<T[]> {
  await initDb();
  const result = await getClient().execute({ sql, args });
  return result.rows.map((row) => jsonSafeValue(row)) as T[];
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

// Bump this whenever the schema/migration steps below change so they re-run once.
const INIT_MARKER = 'db_init_complete_v36';

export async function initDb(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = getClient();

    // Fast path: one cheap round trip on a cold start instead of ~15 schema/migration
    // statements. If the marker exists, the schema and all migrations are already applied.
    try {
      const done = await db.execute({
        sql: 'SELECT 1 FROM app_migrations WHERE id = ? LIMIT 1',
        args: [INIT_MARKER],
      });
      if (done.rows.length) return;
    } catch {
      // app_migrations does not exist yet (fresh database): fall through to full init.
    }

    await runFullInit(db);

    await db.execute({
      sql: 'INSERT OR IGNORE INTO app_migrations (id, applied_at) VALUES (?, ?)',
      args: [INIT_MARKER, new Date().toISOString()],
    });
  })().catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

async function runFullInit(db: Client): Promise<void> {
  {
    await db.batch([
      { sql: `CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS resources (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT, class_level INTEGER NOT NULL, board TEXT NOT NULL DEFAULT 'JKBOSE', subject TEXT NOT NULL, chapter TEXT, topic TEXT, resource_type TEXT NOT NULL, paper_type TEXT, year INTEGER, school_name TEXT, contributor_name TEXT, file_url TEXT NOT NULL, storage_key TEXT, file_size INTEGER NOT NULL DEFAULT 0, file_type TEXT NOT NULL DEFAULT 'application/pdf', file_name TEXT NOT NULL, file_hash TEXT, status TEXT NOT NULL DEFAULT 'pending', rejection_reason TEXT, featured INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0, downloads INTEGER NOT NULL DEFAULT 0, average_rating REAL NOT NULL DEFAULT 0.0, rating_count INTEGER NOT NULL DEFAULT 0, tags TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, approved_at TEXT, photo_keys TEXT)`, args: [] },      { sql: `CREATE TABLE IF NOT EXISTS storage_reservations (storage_key TEXT PRIMARY KEY, file_size INTEGER NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, class_level INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, subject_id INTEGER NOT NULL, name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS ratings (id INTEGER PRIMARY KEY AUTOINCREMENT, resource_id INTEGER NOT NULL, session_id TEXT NOT NULL, rating INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(resource_id, session_id))`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS downloads (id INTEGER PRIMARY KEY AUTOINCREMENT, resource_id INTEGER NOT NULL, session_id TEXT NOT NULL, created_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, rating INTEGER NOT NULL, review TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS app_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS tips (id INTEGER PRIMARY KEY AUTOINCREMENT, class_level INTEGER NOT NULL, subject TEXT NOT NULL DEFAULT 'General', title TEXT NOT NULL, body TEXT NOT NULL, author TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, class_level INTEGER NOT NULL DEFAULT 0, section TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, attachments TEXT, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_tips_class_status ON tips(class_level,status)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_class ON resources(class_level)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(featured)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_paper_type ON resources(paper_type)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_status_class_type_created ON resources(status,class_level,resource_type,created_at DESC)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_status_class_subject ON resources(status,class_level,subject)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_status_contributor_created ON resources(status,contributor_name,created_at DESC)`, args: [] },
      { sql: `CREATE INDEX IF NOT EXISTS idx_resources_year ON resources(year)`, args: [] },
    ], 'write');

    await db.execute({ sql: `ALTER TABLE resources ADD COLUMN contributor_name TEXT`, args: [] }).catch(() => {});
    await db.execute({ sql: `ALTER TABLE resources ADD COLUMN storage_key TEXT`, args: [] }).catch(() => {});
    await db.execute({ sql: `ALTER TABLE resources ADD COLUMN photo_keys TEXT`, args: [] }).catch(() => {});
    await db.execute({ sql: `ALTER TABLE tips ADD COLUMN subject TEXT NOT NULL DEFAULT 'General'`, args: [] }).catch(() => {});

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

    const now = new Date().toISOString();

    const tips = [
      [9,'General','Make a one-page chapter map','Write the chapter name in the centre and connect formulas, definitions, diagrams and common mistakes around it.','ARCHIVUM'],
      [9,'General','Use active recall, not rereading','Close the book and explain the topic aloud from memory before checking what you missed.','ARCHIVUM'],
      [10,'Science','Practise full-mark answers','For Science and Social Science, practise writing complete answers with keywords and labelled diagrams.','ARCHIVUM'],
      [10,'Maths','Keep a formula error list','Whenever you lose marks in Mathematics, add the exact mistake to one short list and revisit it weekly.','ARCHIVUM'],
      [11,'General','Build chapter-wise PYQ sets','Group previous questions by chapter so you can spot repeated concepts instead of revising randomly.','ARCHIVUM'],
      [11,'Physics','Time your numericals','Do a short timed set of numerical problems and review the steps where you lost time, not just the final answer.','ARCHIVUM'],
      [12,'General','Revise high-weight concepts first','Use your current syllabus and recent school/board papers to prioritise concepts that repeatedly require multi-step answers.','ARCHIVUM'],
      [12,'General','Protect the final revision window','Keep the last revision day for formulas, diagrams, definitions and your own mistake list rather than starting new chapters.','ARCHIVUM'],
      [12,'General','Write before you look','For derivations and long answers, attempt the structure from memory first, then compare it with your notes.','ARCHIVUM'],
    ];
    tips.push(
      [9,'Maths','Show every working line','In school and board-style mathematics, write the key step on each line. A correct method is easier to award marks for than a cramped final answer.','ARCHIVUM'],
      [9,'Science','Label diagrams before you finish','Draw a clean outline first, then add labels with straight leader lines. Leave enough space so labels do not overlap.','ARCHIVUM'],
      [9,'English','Build a small quote bank','Keep a page with short, accurate quotations or key phrases from each literature chapter and revise it before writing answers.','ARCHIVUM'],
      [10,'SST','Use answer headings','For long Social Science answers, use short headings and separate points. This makes recall and checking much easier.','ARCHIVUM'],
      [10,'Hindi','Practise timed writing','Do one timed writing task every few days so handwriting, structure and time management improve together.','ARCHIVUM'],
      [10,'Urdu','Revise meanings with context','Learn difficult words alongside the sentence or passage where they occur instead of memorising isolated meanings.','ARCHIVUM'],
      [11,'Chemistry','Keep a reaction notebook','Write important reactions with conditions, observations and products in one compact revision sheet and revisit it frequently.','ARCHIVUM'],
      [11,'Biology','Draw from memory','After studying a diagram, close the book and redraw it from memory. Check labels only after the attempt.','ARCHIVUM'],
      [11,'Maths','Mark questions by confidence','During practice, tag questions as easy, uncertain or difficult. Revisit the uncertain set first during revision.','ARCHIVUM'],
      [12,'Physics','Check units before finalising','After every numerical, check dimensions, unit conversion and significant figures before moving on.','ARCHIVUM'],
      [12,'English','Plan long answers first','Spend a short moment identifying the argument, examples and conclusion before writing a long literature or writing answer.','ARCHIVUM'],
      [12,'Chemistry','Separate formulas from exceptions','Maintain one page for standard formulas and another for exceptions, special cases and common traps.','ARCHIVUM'],
    );
    const tipsMigration = await db.execute({
      sql: `SELECT id FROM app_migrations WHERE id = ? LIMIT 1`,
      args: ['tips_seed_v2'],
    });
    if (!tipsMigration.rows.length) {
      for (const [level,subject,title,body,author] of tips) {
        await db.execute({ sql: `INSERT OR IGNORE INTO tips (class_level,subject,title,body,author,status,created_at) SELECT ?,?,?,?,?, 'approved',? WHERE NOT EXISTS (SELECT 1 FROM tips WHERE class_level=? AND subject=? AND title=?)`, args: [level,subject,title,body,author,now,level,subject,title] });
      }
      await db.execute({
        sql: `INSERT OR IGNORE INTO app_migrations (id, applied_at) VALUES (?, ?)`,
        args: ['tips_seed_v2', now],
      });
    }

    const seedMigration = await db.execute({
      sql: `SELECT id FROM app_migrations WHERE id = ? LIMIT 1`,
      args: ['base_seed_v3'],
    });
    if (!seedMigration.rows.length) {
      await seedDatabase(db);
      await db.execute({
        sql: `INSERT OR IGNORE INTO app_migrations (id, applied_at) VALUES (?, ?)`,
        args: ['base_seed_v3', now],
      });
    }

    // V26 rating reset: start the new rating mechanism with a clean slate.
    // This runs exactly once, so future ratings are preserved across deploys.
    const ratingResetMigration = await db.execute({
      sql: `SELECT id FROM app_migrations WHERE id = ? LIMIT 1`,
      args: ['ratings_reset_v26'],
    });
    if (!ratingResetMigration.rows.length) {
      await db.execute({ sql: `DELETE FROM ratings`, args: [] });
      await db.execute({
        sql: `UPDATE resources SET average_rating=0, rating_count=0`,
        args: [],
      });
      await db.execute({
        sql: `INSERT OR IGNORE INTO app_migrations (id, applied_at) VALUES (?, ?)`,
        args: ['ratings_reset_v26', now],
      });
    }
  }
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
  await db.execute({ sql: `UPDATE resources SET contributor_name='ARCHIVUM Archive' WHERE status='approved' AND (file_hash LIKE 'seed_hash_%' OR file_hash LIKE 'starter_%') AND (contributor_name IS NULL OR TRIM(contributor_name)='')`, args: [] });

  const starterSubjects: Array<[number,string,string,string,string,string]> = [
    [9,'Maths','Class 9 Maths — ARCHIVUM Starter Notes','Core practice and revision starter pack for Class 9 Maths.','class9-maths-archivum-starter-notes.pdf','maths'],
    [9,'Science','Class 9 Science — ARCHIVUM Starter Notes','Core concepts and revision starter pack for Class 9 Science.','class9-science-archivum-starter-notes.pdf','science'],
    [9,'SST','Class 9 SST — ARCHIVUM Starter Notes','History, geography, civics and economics revision starter pack.','class9-sst-archivum-starter-notes.pdf','sst'],
    [9,'English','Class 9 English — ARCHIVUM Starter Notes','Literature, language and writing revision starter pack.','class9-english-archivum-starter-notes.pdf','english'],
    [9,'Hindi','Class 9 Hindi — ARCHIVUM Starter Notes','Literature, grammar and writing revision starter pack.','class9-hindi-archivum-starter-notes.pdf','hindi'],
    [9,'Urdu','Class 9 Urdu — ARCHIVUM Starter Notes','Literature, grammar and writing revision starter pack.','class9-urdu-archivum-starter-notes.pdf','urdu'],
    [10,'Maths','Class 10 Maths — ARCHIVUM Starter Notes','Core practice and board-style revision starter pack for Class 10 Maths.','class10-maths-archivum-starter-notes.pdf','maths'],
    [10,'Science','Class 10 Science — ARCHIVUM Starter Notes','Core concepts, diagrams and revision starter pack for Class 10 Science.','class10-science-archivum-starter-notes.pdf','science'],
    [10,'SST','Class 10 SST — ARCHIVUM Starter Notes','History, geography, civics and economics revision starter pack.','class10-sst-archivum-starter-notes.pdf','sst'],
    [10,'English','Class 10 English — ARCHIVUM Starter Notes','Literature, language and writing revision starter pack.','class10-english-archivum-starter-notes.pdf','english'],
    [10,'Hindi','Class 10 Hindi — ARCHIVUM Starter Notes','Literature, grammar and writing revision starter pack.','class10-hindi-archivum-starter-notes.pdf','hindi'],
    [10,'Urdu','Class 10 Urdu — ARCHIVUM Starter Notes','Literature, grammar and writing revision starter pack.','class10-urdu-archivum-starter-notes.pdf','urdu'],
    [11,'Maths','Class 11 Maths — ARCHIVUM Starter Notes','Core formulas and practice starter pack for Class 11 Maths.','class11-maths-archivum-starter-notes.pdf','maths'],
    [11,'Biology','Class 11 Biology — ARCHIVUM Starter Notes','Core diagrams and concepts starter pack for Class 11 Biology.','class11-biology-archivum-starter-notes.pdf','biology'],
    [11,'Chemistry','Class 11 Chemistry — ARCHIVUM Starter Notes','Reactions, concepts and numericals starter pack for Class 11 Chemistry.','class11-chemistry-archivum-starter-notes.pdf','chemistry'],
    [11,'English','Class 11 English — ARCHIVUM Starter Notes','Literature, language and writing revision starter pack.','class11-english-archivum-starter-notes.pdf','english'],
    [12,'Maths','Class 12 Maths — ARCHIVUM Starter Notes','Core formulas and board-style practice starter pack for Class 12 Maths.','class12-maths-archivum-starter-notes.pdf','maths'],
    [12,'Biology','Class 12 Biology — ARCHIVUM Starter Notes','Core diagrams and high-yield concepts starter pack for Class 12 Biology.','class12-biology-archivum-starter-notes.pdf','biology'],
    [12,'Physics','Class 12 Physics — ARCHIVUM Starter Notes','Concepts, derivations and numericals starter pack for Class 12 Physics.','class12-physics-archivum-starter-notes.pdf','physics'],
    [12,'Chemistry','Class 12 Chemistry — ARCHIVUM Starter Notes','Reactions, equations and numerical practice starter pack.','class12-chemistry-archivum-starter-notes.pdf','chemistry'],
    [12,'English','Class 12 English — ARCHIVUM Starter Notes','Literature, language and writing revision starter pack.','class12-english-archivum-starter-notes.pdf','english'],
  ];
  for (const [level,subject,title,description,fileName,tag] of starterSubjects) {
    const slug = fileName.replace('.pdf','');
    const fileUrl = `/uploads/${fileName}`;
    await db.execute({
      sql: `INSERT OR IGNORE INTO resources (slug,title,description,class_level,board,subject,chapter,topic,resource_type,paper_type,year,school_name,file_url,file_size,file_type,file_name,file_hash,status,featured,views,downloads,average_rating,rating_count,tags,created_at,updated_at,approved_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?,?,?,?,?,?)`,
      args: [slug,title,description,level,'JKBOSE',subject,'Starter Revision','ARCHIVUM Starter','Notes',null,2026,null,fileUrl,0,'application/pdf',fileName,`starter_${slug}`,0,0,0,0,0,`starter,${tag},class${level}`,now,now,now],
    });
  }


  const physicsMigration = await db.execute({
    sql: `SELECT id FROM app_migrations WHERE id = ? LIMIT 1`,
    args: ['class11_physics_hadiya_hilal_v1'],
  });
  if (!physicsMigration.rows.length) {
    await db.execute({
      sql: `DELETE FROM resources WHERE class_level = 11 AND LOWER(subject) = 'physics'`,
      args: [],
    });
    const physicsChapters = [
      ['units-and-measurements','Units & Measurements','01_units_measurements'],
      ['mathematical-tools','Mathematical Tools','02_mathematical_tools'],
      ['vectors','Vectors','03_vectors'],
      ['laws-of-motion','Laws of Motion','04_laws_of_motion'],
      ['work-energy-and-power','Work, Energy & Power','05_work_energy_power'],
      ['system-of-particles-and-rotational-motion','System of Particles & Rotational Motion','06_system_of_particles_rotational_motion'],
      ['collisions','Collisions','07_collisions'],
      ['gravitation','Gravitation','08_gravitation'],
      ['mechanical-properties-of-solids','Mechanical Properties of Solids','09_mechanical_properties_of_solids'],
      ['oscillations-and-waves','Oscillations & Waves','10_oscillations_waves'],
    ] as const;
    const fileMap: Record<string,string> = {
      '01_units_measurements':'class11_physics_hadiya_01_units_measurements.pdf',
      '02_mathematical_tools':'class11_physics_hadiya_02_mathematical_tools.pdf',
      '03_vectors':'class11_physics_hadiya_03_vectors.pdf',
      '04_laws_of_motion':'class11_physics_hadiya_04_laws_of_motion.pdf',
      '05_work_energy_power':'class11_physics_hadiya_05_work_energy_power.pdf',
      '06_system_of_particles_rotational_motion':'class11_physics_hadiya_06_system_of_particles_rotational_motion.pdf',
      '07_collisions':'class11_physics_hadiya_07_collisions.pdf',
      '08_gravitation':'class11_physics_hadiya_08_gravitation.pdf',
      '09_mechanical_properties_of_solids':'class11_physics_hadiya_09_mechanical_properties_of_solids.pdf',
      '10_oscillations_waves':'class11_physics_hadiya_10_oscillations_waves.pdf',
    };
    const fileSizes: Record<string,number> = {
      '01_units_measurements':24549377,
      '02_mathematical_tools':17670360,
      '03_vectors':27193317,
      '04_laws_of_motion':10130430,
      '05_work_energy_power':6649240,
      '06_system_of_particles_rotational_motion':40268963,
      '07_collisions':4254690,
      '08_gravitation':2451761,
      '09_mechanical_properties_of_solids':18781897,
      '10_oscillations_waves':16709057,
    };
    for (const [slugPart, chapter, fileKey] of physicsChapters) {
      const slug = `class-11-physics-${slugPart}-handwritten-notes-hadiya-hilal`;
      const fileName = fileMap[fileKey];
      const title = `Class 11 Physics — ${chapter} Handwritten Notes`;
      await db.execute({
        sql: `INSERT INTO resources (slug,title,description,class_level,board,subject,chapter,topic,resource_type,paper_type,year,school_name,contributor_name,file_url,storage_key,file_size,file_type,file_name,file_hash,status,featured,views,downloads,average_rating,rating_count,tags,created_at,updated_at,approved_at,photo_keys)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'approved',?,?,?,?,?,?,?,?,?,?)`,
        args: [slug,title,`Handwritten Class 11 Physics chapter notes for ${chapter}, contributed by Hadiya Hilal.`,11,'JKBOSE','Physics',chapter,'Chapter Notes','Notes',null,2026,null,'Hadiya Hilal',`/uploads/${fileName}`,null,fileSizes[fileKey],'application/pdf',fileName,`hadiya_hilal_physics_${fileKey}`,0,0,0,0,0,'class11,physics,handwritten,notes,jkbose,hadiya hilal',now,now,now,null],
      });
    }
    await db.execute({
      sql: `INSERT OR IGNORE INTO app_migrations (id, applied_at) VALUES (?, ?)`,
      args: ['class11_physics_hadiya_hilal_v1', now],
    });
  }


  const metricsMigration = await db.execute({
    sql: `SELECT id FROM app_migrations WHERE id = ? LIMIT 1`,
    args: ['zero_demo_metrics_v1'],
  });
  if (!metricsMigration.rows.length) {
    await db.execute({
      sql: `UPDATE resources
            SET views = 0, downloads = 0, average_rating = 0, rating_count = 0
            WHERE status = 'approved'
              AND (file_hash LIKE 'seed_hash_%' OR file_hash LIKE 'starter_%')`,
      args: [],
    });
    await db.execute({
      sql: `INSERT OR IGNORE INTO app_migrations (id, applied_at) VALUES (?, ?)`,
      args: ['zero_demo_metrics_v1', new Date().toISOString()],
    });
  }

}
