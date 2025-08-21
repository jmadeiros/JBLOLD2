-- Construction Management Database Schema
-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pre-construction',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- AI analysis metadata
    programme_filename VARCHAR(255),
    analysis_date TIMESTAMP WITH TIME ZONE,
    ai_summary JSONB,
    trade_count INTEGER DEFAULT 0,
    admin_items_count INTEGER DEFAULT 0
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Scheduling
    start_date DATE,
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    
    -- Assignment
    assignee VARCHAR(255),
    trade VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Site Work',
    
    -- Construction specific
    floor_core_unit VARCHAR(255),
    estimated_value DECIMAL(15,2) DEFAULT 0,
    week_number INTEGER,
    
    -- Task metadata
    completed BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    is_programme_generated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Team members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    trade VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    hourly_rate DECIMAL(10,2),
    skills TEXT[],
    availability JSONB, -- Store availability schedule as JSON
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task dependencies table (for Gantt charts)
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, etc.
    lag_days INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent circular dependencies
    CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- Indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_trade ON tasks(trade);
CREATE INDEX idx_tasks_start_date ON tasks(start_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_team_members_project_id ON team_members(project_id);
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);

-- Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies (for now, allow all authenticated users to access everything)
-- You can make these more restrictive later
CREATE POLICY "Allow all for authenticated users" ON projects
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON tasks
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON team_members
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all for authenticated users" ON task_dependencies
    FOR ALL TO authenticated USING (true);

-- Allow anonymous users to read/write for now (you can restrict this later)
CREATE POLICY "Allow all for anonymous users" ON projects
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow all for anonymous users" ON tasks
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow all for anonymous users" ON team_members
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow all for anonymous users" ON task_dependencies
    FOR ALL TO anon USING (true);

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO projects (name, description, location, status) VALUES 
('Sample Construction Project', 'A sample project for testing the system', 'London, UK', 'In Progress'); 