const db = require('./src/config/db');

async function recreateBudgetsTable() {
  console.log('Connecting to DB to drop and recreate budgets table...');
  try {
    // Drop existing
    await db.execute('DROP TABLE IF EXISTS budgets;');
    console.log('Successfully dropped old budgets table.');

    // Recreate with User's requested schema
    const createQuery = `
      CREATE TABLE budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        category VARCHAR(100),
        amount DECIMAL(10,2),
        period VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await db.execute(createQuery);
    console.log("Successfully created budgets table with new schema!");
    
    process.exit(0);
  } catch (err) {
    console.error('Error recreating budgets table:', err);
    process.exit(1);
  }
}

recreateBudgetsTable();
