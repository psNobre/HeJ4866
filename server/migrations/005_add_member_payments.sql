-- Create member_payments table
CREATE TABLE IF NOT EXISTS member_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Migrate existing data from transactions to member_payments
INSERT INTO member_payments (transaction_id, member_id, month, year)
SELECT id, member_id, month, year
FROM transactions
WHERE category = 'Mensalidade' AND type = 'income' AND member_id IS NOT NULL AND month IS NOT NULL AND year IS NOT NULL;
