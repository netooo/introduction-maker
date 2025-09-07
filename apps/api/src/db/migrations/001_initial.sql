-- Initial migration for Introduction Maker
-- Creates projects and items tables

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    templateId TEXT NOT NULL,
    title TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastAccessedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    imageUrl TEXT,
    description TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_projectId ON items(projectId);
CREATE INDEX IF NOT EXISTS idx_projects_lastAccessedAt ON projects(lastAccessedAt);