import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (matching our schema)
export interface Project {
  id: string
  name: string
  description?: string
  location?: string
  status: string
  start_date?: string
  end_date?: string
  budget?: number
  progress: number
  created_at: string
  updated_at: string
  created_by?: string
  
  // AI analysis metadata
  programme_filename?: string
  analysis_date?: string
  ai_summary?: any
  trade_count: number
  admin_items_count: number
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: string
  priority: string
  
  // Scheduling
  start_date?: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  
  // Assignment
  assignee?: string
  trade?: string
  category: string
  
  // Construction specific
  floor_core_unit?: string
  estimated_value: number
  week_number?: number
  
  // Task metadata
  completed: boolean
  tags: string[]
  is_programme_generated: boolean
  
  created_at: string
  updated_at: string
  created_by?: string
}

export interface TeamMember {
  id: string
  project_id: string
  name: string
  role?: string
  trade?: string
  email?: string
  phone?: string
  hourly_rate?: number
  skills: string[]
  availability?: any
  
  created_at: string
  updated_at: string
}

export interface TaskDependency {
  id: string
  task_id: string
  depends_on_task_id: string
  dependency_type: string
  lag_days: number
  created_at: string
}

// Project operations
export const projectService = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
    
    return data || []
  },

  // Get project by ID
  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching project:', error)
      return null
    }
    
    return data
  },

  // Create new project
  async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating project:', error)
      throw error
    }
    
    return data
  },

  // Update project
  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating project:', error)
      throw error
    }
    
    return data
  },

  // Delete project
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting project:', error)
      return false
    }
    
    return true
  }
}

// Task operations
export const taskService = {
  // Get all tasks for a project
  async getByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
    
    return data || []
  },

  // Get all tasks
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('start_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching all tasks:', error)
      throw error
    }
    
    return data || []
  },

  // Create multiple tasks (for AI import)
  async createMany(tasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(tasks)
      .select()
    
    if (error) {
      console.error('Error creating tasks:', error)
      throw error
    }
    
    return data || []
  },

  // Create single task
  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating task:', error)
      throw error
    }
    
    return data
  },

  // Update task
  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating task:', error)
      throw error
    }
    
    return data
  },

  // Delete task
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting task:', error)
      return false
    }
    
    return true
  }
}

// Team member operations
export const teamService = {
  // Get team members for a project
  async getByProject(projectId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching team members:', error)
      throw error
    }
    
    return data || []
  },

  // Create team member
  async create(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .insert([member])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating team member:', error)
      throw error
    }
    
    return data
  }
}

// Utility function to test connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
} 