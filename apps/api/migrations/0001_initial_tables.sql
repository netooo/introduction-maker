-- Migration: Create initial tables for Introduction Maker
-- Created: 2025-09-07

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    templateId TEXT NOT NULL,
    title TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    lastAccessedAt TEXT NOT NULL DEFAULT (datetime('now'))
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

-- Indexes for better performance (SQLite will ignore if they already exist)
CREATE INDEX IF NOT EXISTS idx_items_projectId ON items(projectId);
CREATE INDEX IF NOT EXISTS idx_projects_lastAccessedAt ON projects(lastAccessedAt);