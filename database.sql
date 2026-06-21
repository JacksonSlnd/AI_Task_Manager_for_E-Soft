CREATE TABLE tasks(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

ALTER TABLE tasks ADD COLUMN task_date DATE NOT NULL;

ALTER TABLE tasks ADD COLUMN color VARCHAR(7) DEFAULT '#4a90e2';