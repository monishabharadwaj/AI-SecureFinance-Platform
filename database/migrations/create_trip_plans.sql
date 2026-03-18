-- Create trip_plans table
CREATE TABLE trip_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INT NOT NULL DEFAULT 1,
  estimated_budget DECIMAL(12,2),
  budget_breakdown JSON,
  status ENUM('planning', 'confirmed', 'completed', 'cancelled') DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_trips (user_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_status (status)
);
