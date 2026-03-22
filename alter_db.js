const db = require('./src/config/db');

async function alterDB() {
  try {
    console.log("Altering budgets table...");
    await db.execute("ALTER TABLE budgets ADD COLUMN period VARCHAR(20) DEFAULT 'monthly'");
    console.log("Successfully added 'period' column to budgets.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("Column 'period' already exists.");
    } else {
        console.error("Error altering DB:", err.message);
    }
  }
  process.exit();
}

alterDB();
