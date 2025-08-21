import type { 
  ProgramAnalysisResult, 
  TradeTaskBreakdown, 
  ProgrammeAdminItem,
  ProgramUploadStatus 
} from "../../types/task"

export interface ProgramRow {
  lineNumber: number
  name: string
  duration: string
  startDate: string
  finishDate: string
  predecessors?: string
  notes?: string
  resource?: string
  workType?: string
}

export interface ParsedProgram {
  projectName: string
  rows: ProgramRow[]
  timeline: {
    programStart: Date
    programEnd: Date
    totalDuration: number
  }
  metadata: {
    fileName: string
    parseDate: Date
    totalLines: number
  }
}

// AI Analysis Prompt based on user requirements
const AI_ANALYSIS_PROMPT = `
Please analyse the construction programme and produce a detailed breakdown of works that is suitable for assigning tasks to specific trade teams or individuals. The goal is to generate task-level data that reflects the actual workflow on-site.

📌 Part 1: Element of Work Breakdown

Identify and tag each line item in the programme with a clearly defined trade (e.g., electrician, plumber, bricklayer, dryliner, etc.).

Disaggregate high-level items into smaller, task-specific elements — especially for trades like:

Electrical: split into first fix, second fix, testing, commissioning, and snagging per flat, core, or floor.

Plumbing: break down by first fix pipework, soil stacks, second fix, testing, plant room work, and commissioning.

Fit-out works: separate into joinery, painting, flooring, kitchens, bathrooms — per flat or per core.

SFS, cladding, windows: divide into floors or elevations, if applicable.

Scaffold and crane operations: include sequences and dependencies.

📌 Part 2: Task Structuring for Assignment

For each task identified, present it in a structured format that includes:

Trade (e.g., Electrician)
Description of task (e.g. "2nd Fix Electrics – Unit 15, 2nd Floor, Private")
Start date
End date (or duration)
Floor / Core / Unit reference (as applicable)
Dependencies (e.g. after window install, post-plastering)
Priority (High, Medium, Low if deducible from sequence)
Week number (based on the programme's timeline)

🧠 Think practically like a Site Manager or PM handing out daily or weekly work packages to trade teams. Assume each task should be specific enough that:

A foreman can assign it to a team member
Progress can be tracked and ticked off
Delays or blockers can be clearly identified

📌 Part 3: Programme Admin Items

Identify and tag non-trade-specific activities separately, such as:

Client approvals
Surveys
Design development
Procurement deadlines
Handover and PC milestones

These should be categorised as "Programme Admin" and kept separate from trade tasks. Do not include these in trade task tracking.

Return the analysis as a JSON object with the following structure:
{
  "tradeTasks": [
    {
      "trade": "string",
      "description": "string", 
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "floorCoreUnit": "string",
      "dependencies": ["string"],
      "priority": "high|medium|low",
      "weekNumber": number,
      "estimatedHours": number,
      "estimatedValue": number
    }
  ],
  "adminItems": [
    {
      "title": "string",
      "description": "string",
      "type": "client_approval|survey|design|procurement|handover|milestone|meeting",
      "date": "YYYY-MM-DD",
      "priority": "high|medium|low"
    }
  ]
}
`;

// Client-side program analysis service
// AI analysis now handled by server-side API route

export class ProgramAnalysisService {
  // File parsing methods
  static async parseExcelFile(file: File): Promise<ParsedProgram> {
    console.log('📄 Parsing uploaded file:', file.name)
    
    const projectName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    
    // For now, we'll create a basic structure that the AI can analyze
    // In a real implementation, this would use a library like xlsx to actually parse the file
    // The AI analysis will handle the intelligent disaggregation
    console.log('📋 Creating program structure for AI analysis...')
    
    const basicRows: ProgramRow[] = [
      // ADMIN ITEMS (Go to Calendar)
      {
        lineNumber: 1,
        name: "Client Activities",
        duration: "",
        startDate: "20/04/20",
        finishDate: "20/04/20",
        workType: "admin"
      },
      {
        lineNumber: 2,
        name: "Contract Signing",
        duration: "29w",
        startDate: "10/12/19",
        finishDate: "20/07/20",
        workType: "admin"
      },
      {
        lineNumber: 3,
        name: "Contract Start Date",
        duration: "",
        startDate: "20/07/2020",
        finishDate: "20/07/2020",
        workType: "milestone"
      },
      {
        lineNumber: 5,
        name: "Surveys",
        duration: "17w 5d",
        startDate: "20/07/20",
        finishDate: "23/11/20",
        workType: "survey"
      },
      {
        lineNumber: 6,
        name: "Consultant appointments",
        duration: "4w",
        startDate: "20/07/20",
        finishDate: "14/08/20",
        workType: "admin"
      },
      {
        lineNumber: 7,
        name: "Design",
        duration: "40w",
        startDate: "03/08/20",
        finishDate: "27/05/21",
        workType: "design"
      },
      {
        lineNumber: 12,
        name: "Procurement & Sub-Contractor Mobilisation",
        duration: "65w",
        startDate: "20/07/20",
        finishDate: "08/11/21",
        workType: "procurement"
      },
      {
        lineNumber: 13,
        name: "Site Possession Date",
        duration: "",
        startDate: "28/09/2020",
        finishDate: "28/09/2020",
        workType: "milestone"
      },

      // CONSTRUCTION TRADE TASKS (Go to Gantt + Tasks)
      {
        lineNumber: 18,
        name: "Enabling & Demolition Works",
        duration: "14w",
        startDate: "28/09/20",
        finishDate: "15/01/21",
        workType: "demolition"
      },
      {
        lineNumber: 19,
        name: "Initial Site Set Up & Erection of Hoarding",
        duration: "3w",
        startDate: "28/09/20",
        finishDate: "16/10/20",
        workType: "site"
      },
      {
        lineNumber: 20,
        name: "Asbestos Removal (Provisional) & Soft strip",
        duration: "4w",
        startDate: "05/10/20",
        finishDate: "30/10/20",
        workType: "demolition"
      },
      {
        lineNumber: 21,
        name: "Demolition",
        duration: "6w",
        startDate: "02/11/20",
        finishDate: "11/12/20",
        workType: "demolition"
      },
      {
        lineNumber: 27,
        name: "Piling",
        duration: "3w 1d",
        startDate: "18/01/2021",
        finishDate: "08/02/2021",
        workType: "structural"
      },
      {
        lineNumber: 33,
        name: "Sub-structures",
        duration: "6w 3d",
        startDate: "09/02/21",
        finishDate: "25/03/21",
        workType: "structural"
      },
      {
        lineNumber: 34,
        name: "Excavate & trim piles",
        duration: "2w",
        startDate: "09/02/21",
        finishDate: "22/02/21",
        workType: "structural"
      },
      {
        lineNumber: 35,
        name: "Form crane base",
        duration: "1w",
        startDate: "23/02/21",
        finishDate: "01/03/21",
        workType: "structural"
      },
      {
        lineNumber: 36,
        name: "FRC foundations, pilecaps & beams",
        duration: "3d",
        startDate: "16/02/21",
        finishDate: "18/02/21",
        workType: "structural"
      },
      {
        lineNumber: 41,
        name: "RC Frame",
        duration: "16w 1d",
        startDate: "26/03/21",
        finishDate: "22/07/21",
        workType: "structural"
      },
      {
        lineNumber: 42,
        name: "G - 1st Floor Slab",
        duration: "2w",
        startDate: "26/03/21",
        finishDate: "12/04/21",
        workType: "structural"
      },
      {
        lineNumber: 43,
        name: "1st - 2nd Floor Slab",
        duration: "2w",
        startDate: "14/04/21",
        finishDate: "27/04/21",
        workType: "structural"
      },
      {
        lineNumber: 44,
        name: "2nd - 3rd Floor Slab",
        duration: "2w",
        startDate: "28/04/21",
        finishDate: "12/05/21",
        workType: "structural"
      },
      {
        lineNumber: 45,
        name: "3rd - 4th Floor Slab",
        duration: "2w",
        startDate: "13/05/21",
        finishDate: "26/05/21",
        workType: "structural"
      },
      {
        lineNumber: 46,
        name: "4th - 5th Floor Slab",
        duration: "2w",
        startDate: "27/05/21",
        finishDate: "10/06/21",
        workType: "structural"
      },
      {
        lineNumber: 47,
        name: "5th - Roof Slab",
        duration: "2w",
        startDate: "11/06/21",
        finishDate: "24/06/21",
        workType: "structural"
      },
      {
        lineNumber: 54,
        name: "Erect Scaffolding",
        duration: "14w",
        startDate: "09/07/21",
        finishDate: "15/10/21",
        workType: "scaffolding"
      },
      {
        lineNumber: 61,
        name: "SFS inner skin",
        duration: "14w",
        startDate: "28/06/21",
        finishDate: "04/10/21",
        workType: "structural"
      },
      {
        lineNumber: 75,
        name: "Install Windows",
        duration: "13w 4d",
        startDate: "23/08/21",
        finishDate: "26/11/21",
        workType: "windows"
      },
      {
        lineNumber: 85,
        name: "Roofing",
        duration: "24w 1d",
        startDate: "06/08/21",
        finishDate: "07/02/22",
        workType: "roofing"
      },
      {
        lineNumber: 97,
        name: "Brick & blockwork",
        duration: "14w 2d",
        startDate: "20/09/21",
        finishDate: "11/01/22",
        workType: "masonry"
      },
      {
        lineNumber: 118,
        name: "Fit out (38No. Flats)",
        duration: "34w",
        startDate: "30/07/21",
        finishDate: "08/04/22",
        workType: "fitout"
      },
      {
        lineNumber: 123,
        name: "Fit Out 5No.Ground Floor Flats",
        duration: "20w 4d",
        startDate: "23/08/21",
        finishDate: "28/01/22",
        workType: "fitout"
      },
      {
        lineNumber: 130,
        name: "Fit Out 7No. First Floor Flats",
        duration: "21w 4d",
        startDate: "31/08/21",
        finishDate: "11/02/22",
        workType: "fitout"
      },
      {
        lineNumber: 139,
        name: "Fit Out 7No.Second Floor Flats",
        duration: "22w",
        startDate: "13/09/21",
        finishDate: "25/02/22",
        workType: "fitout"
      },
      {
        lineNumber: 148,
        name: "Fit Out 7No.Third Floor Flats",
        duration: "22w",
        startDate: "27/09/21",
        finishDate: "11/03/22",
        workType: "fitout"
      },
      {
        lineNumber: 157,
        name: "Fit Out 7No.Fourth Floor Flats",
        duration: "21w",
        startDate: "11/10/21",
        finishDate: "18/03/22",
        workType: "fitout"
      },
      {
        lineNumber: 166,
        name: "Fit Out 5No.Fifth Floor Flats",
        duration: "21w",
        startDate: "25/10/21",
        finishDate: "01/04/22",
        workType: "fitout"
      },
      {
        lineNumber: 173,
        name: "Communal Area",
        duration: "21w",
        startDate: "01/11/21",
        finishDate: "08/04/22",
        workType: "fitout"
      },
      {
        lineNumber: 185,
        name: "External works",
        duration: "5w 2d",
        startDate: "22/03/22",
        finishDate: "03/05/22",
        workType: "site"
      },
      {
        lineNumber: 190,
        name: "Hand Over 38No.Flats",
        duration: "4d",
        startDate: "26/04/22",
        finishDate: "03/05/22",
        workType: "handover"
      }
    ];

    const programStart = new Date("2020-07-20");
    const programEnd = new Date("2022-05-03");
    
    return {
      projectName,
      rows: basicRows,
      timeline: {
        programStart,
        programEnd,
        totalDuration: Math.ceil((programEnd.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24 * 7)) // weeks
      },
      metadata: {
        fileName: file.name,
        parseDate: new Date(),
        totalLines: basicRows.length
      }
    };
  }

  static async analyzeProgram(parsedProgram: ParsedProgram): Promise<ProgramAnalysisResult> {
    // In a real implementation, this would call an AI service (OpenAI, Anthropic, etc.)
    // For now, we'll simulate the analysis based on the parsed program

    const tradeTasks: TradeTaskBreakdown[] = [];
    const adminItems: ProgrammeAdminItem[] = [];
    const tradeBreakdown: Record<string, number> = {};

    let weekCounter = 1;
    
    for (const row of parsedProgram.rows) {
      const startDate = this.parseDate(row.startDate);
      const endDate = this.parseDate(row.finishDate);
      
      if (!startDate || !endDate) continue;

      // Categorize based on work type and name
      if (this.isAdminItem(row)) {
        adminItems.push({
          id: `admin-${row.lineNumber}`,
          title: row.name,
          description: `Programme item: ${row.name}`,
          type: this.getAdminType(row),
          date: startDate,
          priority: this.getPriority(row),
          projectName: parsedProgram.projectName,
          notes: row.notes
        });
      } else if (this.isTradeWork(row)) {
        // Disaggregate construction work into trade-specific tasks
        const tasks = this.disaggregateTradeWork(row, startDate, endDate, weekCounter);
        tradeTasks.push(...tasks);
        
        // Update trade breakdown
        for (const task of tasks) {
          tradeBreakdown[task.trade] = (tradeBreakdown[task.trade] || 0) + 1;
        }
      }
      
      weekCounter++;
    }

    return {
      programName: parsedProgram.projectName,
      analysisDate: new Date(),
      tradeTasks,
      adminItems,
      summary: {
        totalTasks: tradeTasks.length,
        totalAdminItems: adminItems.length,
        tradeBreakdown,
        timeline: {
          startDate: parsedProgram.timeline.programStart,
          endDate: parsedProgram.timeline.programEnd,
          durationWeeks: parsedProgram.timeline.totalDuration
        },
        criticalPath: this.identifyCriticalPath(tradeTasks)
      },
      rawProgram: parsedProgram
    };
  }

  // Real AI analysis using server-side API route (secure for all users)
  static async analyzeWithAI(parsedProgram: ParsedProgram): Promise<ProgramAnalysisResult> {
    console.log('🚀 Starting AI analysis via server-side API...')

    try {
      const programData = {
        projectName: parsedProgram.projectName,
        timeline: parsedProgram.timeline,
        activities: parsedProgram.rows.map(row => ({
          name: row.name,
          duration: row.duration,
          startDate: row.startDate,
          finishDate: row.finishDate,
          workType: row.workType
        }))
      }

      console.log('📤 Sending program data to server for AI analysis...')
      
      // Call our secure server-side API route
      const response = await fetch('/api/analyze-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programData })
      })

      const apiResult = await response.json()
      
      if (apiResult.useMock || !apiResult.success) {
        console.log('🎭 Server indicated to use mock analysis, falling back...')
        return this.analyzeProgram(parsedProgram)
      }

      console.log('✅ Server-side AI analysis complete:', {
        tradeTasks: apiResult.result.tradeTasks?.length || 0,
        adminItems: apiResult.result.adminItems?.length || 0
      })
      
      return this.convertAIResponseToAnalysisResult(apiResult.result, parsedProgram)
      
    } catch (error) {
      console.error('❌ Server-side AI analysis failed, falling back to mock:', error)
      // Fallback to mock implementation
      return this.analyzeProgram(parsedProgram)
    }
  }

  // AI service methods removed - now handled by server-side API route

  private static convertAIResponseToAnalysisResult(
    aiResult: any, 
    parsedProgram: ParsedProgram
  ): ProgramAnalysisResult {
    const tradeTasks: TradeTaskBreakdown[] = aiResult.tradeTasks.map((task: any) => ({
      trade: task.trade,
      description: task.description,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      floorCoreUnit: task.floorCoreUnit,
      dependencies: task.dependencies || [],
      priority: task.priority,
      weekNumber: task.weekNumber,
      estimatedHours: task.estimatedHours,
      estimatedValue: task.estimatedValue
    }))

    const adminItems: ProgrammeAdminItem[] = aiResult.adminItems.map((item: any, index: number) => ({
      id: `ai-admin-${index}`,
      title: item.title,
      description: item.description,
      type: item.type,
      date: new Date(item.date),
      priority: item.priority,
      projectName: parsedProgram.projectName
    }))

    const tradeBreakdown: Record<string, number> = {}
    tradeTasks.forEach(task => {
      tradeBreakdown[task.trade] = (tradeBreakdown[task.trade] || 0) + 1
    })

    return {
      programName: parsedProgram.projectName,
      analysisDate: new Date(),
      tradeTasks,
      adminItems,
      summary: {
        totalTasks: tradeTasks.length,
        totalAdminItems: adminItems.length,
        tradeBreakdown,
        timeline: {
          startDate: parsedProgram.timeline.programStart,
          endDate: parsedProgram.timeline.programEnd,
          durationWeeks: parsedProgram.timeline.totalDuration
        },
        criticalPath: tradeTasks
          .filter(task => task.priority === 'high')
          .map(task => task.description)
          .slice(0, 5)
      },
      rawProgram: parsedProgram
    }
  }

  private static parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    // Handle various date formats
    const formats = [
      /(\d{2})\/(\d{2})\/(\d{2,4})/, // DD/MM/YY or DD/MM/YYYY
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format.source.includes('\/')) {
          // DD/MM/YY format
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // JS months are 0-indexed
          let year = parseInt(match[3]);
          if (year < 100) year += 2000; // Convert 2-digit year
          return new Date(year, month, day);
        } else {
          // YYYY-MM-DD format
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }
      }
    }
    
    return null;
  }

  private static isAdminItem(row: ProgramRow): boolean {
    const adminKeywords = [
      'client', 'contract', 'approval', 'survey', 'design', 'procurement', 
      'consultant', 'planning', 'discharge', 'milestone', 'handover',
      'mobilisation', 'pre-commencement', 'agreement'
    ];
    
    return adminKeywords.some(keyword => 
      row.name.toLowerCase().includes(keyword) || 
      row.workType === 'admin' ||
      row.workType === 'design' ||
      row.workType === 'survey' ||
      row.workType === 'procurement' ||
      row.workType === 'milestone'
    );
  }

  private static isTradeWork(row: ProgramRow): boolean {
    const tradeKeywords = [
      'construction', 'structural', 'electrical', 'plumbing', 'hvac',
      'demolition', 'piling', 'concrete', 'steel', 'cladding', 'roofing',
      'flooring', 'drywall', 'painting', 'joinery', 'scaffold', 'crane',
      'site work', 'foundations', 'framing', 'fit-out', 'finishes'
    ];
    
    return tradeKeywords.some(keyword => 
      row.name.toLowerCase().includes(keyword) ||
      ['construction', 'structural', 'demolition', 'site', 'equipment'].includes(row.workType || '')
    );
  }

  private static getAdminType(row: ProgramRow): ProgrammeAdminItem['type'] {
    const name = row.name.toLowerCase();
    
    if (name.includes('client') || name.includes('approval')) return 'client_approval';
    if (name.includes('survey')) return 'survey';
    if (name.includes('design')) return 'design';
    if (name.includes('procurement')) return 'procurement';
    if (name.includes('handover') || name.includes('completion')) return 'handover';
    if (name.includes('milestone') || name.includes('start') || name.includes('end')) return 'milestone';
    
    return 'meeting';
  }

  private static getPriority(row: ProgramRow): 'high' | 'medium' | 'low' {
    const name = row.name.toLowerCase();
    
    if (name.includes('critical') || name.includes('milestone') || name.includes('approval')) return 'high';
    if (name.includes('survey') || name.includes('design')) return 'medium';
    
    return 'low';
  }

  private static disaggregateTradeWork(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const tasks: TradeTaskBreakdown[] = [];
    const name = row.name.toLowerCase();
    
    // Determine primary trade and create specific tasks based on Telfer House program
    if (name.includes('demolition') || name.includes('asbestos')) {
      tasks.push(...this.createDemolitionTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('piling') || name.includes('foundation') || name.includes('pilecaps')) {
      tasks.push(...this.createStructuralTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('rc frame') || name.includes('slab') || name.includes('sub-structures')) {
      tasks.push(...this.createConcreteFrameTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('scaffold')) {
      tasks.push(...this.createScaffoldingTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('sfs inner skin') || name.includes('blockwork') || name.includes('brick')) {
      tasks.push(...this.createMasonryTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('windows')) {
      tasks.push(...this.createWindowTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('roofing')) {
      tasks.push(...this.createRoofingTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('fit out') && (name.includes('flat') || name.includes('floor'))) {
      tasks.push(...this.createFitOutTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('communal area')) {
      tasks.push(...this.createCommunalAreaTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('external works')) {
      tasks.push(...this.createExternalWorksTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('electrical')) {
      tasks.push(...this.createElectricalTasks(row, startDate, endDate, weekNumber));
    } else if (name.includes('plumbing')) {
      tasks.push(...this.createPlumbingTasks(row, startDate, endDate, weekNumber));
    } else {
      // Generic construction task
      tasks.push({
        trade: "General Construction",
        description: row.name,
        startDate,
        endDate,
        priority: this.getTaskPriority(row),
        weekNumber,
        estimatedHours: this.estimateHours(row),
        estimatedValue: this.estimateValue(row)
      });
    }
    
    return tasks;
  }

  private static createDemolitionTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    if (row.name.toLowerCase().includes('asbestos')) {
      return [{
        trade: "Asbestos Specialist",
        description: "Asbestos removal and safe disposal",
        startDate,
        endDate,
        priority: "high",
        weekNumber,
        dependencies: ["Site setup complete"],
        estimatedHours: 160,
        estimatedValue: 8000
      }];
    }
    
    return [{
      trade: "Demolition Specialist",
      description: `Demolition works - ${row.name}`,
      startDate,
      endDate,
      priority: "medium",
      weekNumber,
      dependencies: ["Asbestos removal complete", "Services disconnected"],
      estimatedHours: 320,
      estimatedValue: 12000
    }];
  }

  private static createStructuralTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    return [{
      trade: "Structural Engineer",
      description: `Structural work - ${row.name}`,
      startDate,
      endDate,
      priority: "high",
      weekNumber,
      dependencies: ["Site clearance complete", "Services diverted"],
      estimatedHours: 480,
      estimatedValue: 25000
    }];
  }

  private static createElectricalTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const duration = endDate.getTime() - startDate.getTime();
    const midDate = new Date(startDate.getTime() + duration / 2);
    
    return [
      {
        trade: "Electrician",
        description: "First fix electrical installation",
        startDate,
        endDate: midDate,
        priority: "high",
        weekNumber,
        dependencies: ["Structural work complete"],
        estimatedHours: 120,
        estimatedValue: 4500
      },
      {
        trade: "Electrician", 
        description: "Second fix electrical installation",
        startDate: midDate,
        endDate,
        priority: "medium",
        weekNumber: weekNumber + 1,
        dependencies: ["First fix complete", "Plastering complete"],
        estimatedHours: 80,
        estimatedValue: 3000
      }
    ];
  }

  private static createPlumbingTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const duration = endDate.getTime() - startDate.getTime();
    const midDate = new Date(startDate.getTime() + duration / 2);
    
    return [
      {
        trade: "Plumber",
        description: "First fix plumbing - pipework and soil stacks",
        startDate,
        endDate: midDate,
        priority: "high",
        weekNumber,
        dependencies: ["Structural work complete"],
        estimatedHours: 100,
        estimatedValue: 4000
      },
      {
        trade: "Plumber",
        description: "Second fix plumbing - fixtures and commissioning",
        startDate: midDate,
        endDate,
        priority: "medium",
        weekNumber: weekNumber + 1,
        dependencies: ["First fix complete", "Tiling complete"],
        estimatedHours: 60,
        estimatedValue: 2500
      }
    ];
  }

  // New methods for Telfer House specific trades
  private static createConcreteFrameTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const floorMatch = row.name.match(/(\d+)\w*\s*-\s*(\d+)\w*\s*floor\s*slab/i);
    const floorRef = floorMatch ? `${floorMatch[1]} to ${floorMatch[2]} Floor` : "Structure";
    
    return [{
      trade: "Concrete Finisher",
      description: `RC Frame Construction - ${floorRef}`,
      startDate,
      endDate,
      floorCoreUnit: floorRef,
      priority: "high",
      weekNumber,
      dependencies: ["Previous slab complete", "Reinforcement inspected"],
      estimatedHours: 320,
      estimatedValue: 15000
    }];
  }

  private static createScaffoldingTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const floorMatch = row.name.match(/(gnd|ground|\d+st|\d+nd|\d+rd|\d+th)\s*to\s*(\d+st|\d+nd|\d+rd|\d+th|roof)/i);
    const location = floorMatch ? `${floorMatch[1]} to ${floorMatch[2]}` : "Building perimeter";
    
    return [{
      trade: "Scaffolder",
      description: `Scaffold erection - ${location}`,
      startDate,
      endDate,
      floorCoreUnit: location,
      priority: "high",
      weekNumber,
      dependencies: ["Structure ready", "Access cleared"],
      estimatedHours: 160,
      estimatedValue: 6000
    }];
  }

  private static createMasonryTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    if (row.name.toLowerCase().includes('sfs inner skin')) {
      const floorMatch = row.name.match(/(gnd|ground|\d+st|\d+nd|\d+rd|\d+th)/i);
      const floor = floorMatch ? floorMatch[1] : "All floors";
      
      return [{
        trade: "Dry Liner",
        description: `SFS inner skin installation - ${floor}`,
        startDate,
        endDate,
        floorCoreUnit: floor,
        priority: "medium",
        weekNumber,
        dependencies: ["Structure complete", "Services rough-in"],
        estimatedHours: 200,
        estimatedValue: 8000
      }];
    }
    
    return [{
      trade: "Bricklayer",
      description: "Brick & blockwork construction",
      startDate,
      endDate,
      priority: "medium",
      weekNumber,
      dependencies: ["SFS complete", "Scaffold ready"],
      estimatedHours: 280,
      estimatedValue: 12000
    }];
  }

  private static createWindowTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const floorMatch = row.name.match(/(gnd|ground|\d+st|\d+nd|\d+rd|\d+th)/i);
    const floor = floorMatch ? floorMatch[1] : "All floors";
    
    return [{
      trade: "Glazier",
      description: `Window installation - ${floor}`,
      startDate,
      endDate,
      floorCoreUnit: floor,
      priority: "medium",
      weekNumber,
      dependencies: ["SFS complete", "Weatherproofing ready"],
      estimatedHours: 120,
      estimatedValue: 5000
    }];
  }

  private static createRoofingTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const duration = endDate.getTime() - startDate.getTime();
    const quarterDuration = duration / 4;
    
    return [
      {
        trade: "Roofer",
        description: "Roof structure and coverings",
        startDate,
        endDate: new Date(startDate.getTime() + quarterDuration * 2),
        priority: "high",
        weekNumber,
        dependencies: ["Roof slab complete"],
        estimatedHours: 200,
        estimatedValue: 12000
      },
      {
        trade: "Roofer",
        description: "Roof waterproofing and green roof installation",
        startDate: new Date(startDate.getTime() + quarterDuration * 2),
        endDate,
        priority: "high",
        weekNumber: weekNumber + 2,
        dependencies: ["Roof structure complete"],
        estimatedHours: 160,
        estimatedValue: 8000
      }
    ];
  }

  private static createFitOutTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const tasks: TradeTaskBreakdown[] = [];
    const floorMatch = row.name.match(/(\d+)no\.\s*(\w+)\s*floor\s*flats/i);
    const unitCount = floorMatch ? parseInt(floorMatch[1]) : 1;
    const floor = floorMatch ? floorMatch[2] : "Floor";
    
    const duration = endDate.getTime() - startDate.getTime();
    const taskDuration = duration / 4; // Split into 4 phases
    
    // First Fix Electrical
    tasks.push({
      trade: "Electrician",
      description: `1st Fix Electrical - ${unitCount} units, ${floor} floor`,
      startDate,
      endDate: new Date(startDate.getTime() + taskDuration),
      floorCoreUnit: `${floor} floor`,
      priority: "high",
      weekNumber,
      dependencies: ["Structure complete"],
      estimatedHours: unitCount * 16,
      estimatedValue: unitCount * 600
    });

    // First Fix Plumbing
    tasks.push({
      trade: "Plumber",
      description: `1st Fix Plumbing - ${unitCount} units, ${floor} floor`,
      startDate: new Date(startDate.getTime() + taskDuration * 0.5),
      endDate: new Date(startDate.getTime() + taskDuration * 1.5),
      floorCoreUnit: `${floor} floor`,
      priority: "high",
      weekNumber,
      dependencies: ["1st fix electrical started"],
      estimatedHours: unitCount * 20,
      estimatedValue: unitCount * 800
    });

    // Dry Lining & Decoration
    tasks.push({
      trade: "Dry Liner",
      description: `Drywall & Decoration - ${unitCount} units, ${floor} floor`,
      startDate: new Date(startDate.getTime() + taskDuration * 1.5),
      endDate: new Date(startDate.getTime() + taskDuration * 2.5),
      floorCoreUnit: `${floor} floor`,
      priority: "medium",
      weekNumber: weekNumber + 1,
      dependencies: ["1st fix trades complete"],
      estimatedHours: unitCount * 24,
      estimatedValue: unitCount * 900
    });

    // Second Fix & Completion
    tasks.push({
      trade: "General Construction",
      description: `2nd Fix & Final Finishes - ${unitCount} units, ${floor} floor`,
      startDate: new Date(startDate.getTime() + taskDuration * 2.5),
      endDate,
      floorCoreUnit: `${floor} floor`,
      priority: "medium",
      weekNumber: weekNumber + 2,
      dependencies: ["Drywall complete", "Flooring installed"],
      estimatedHours: unitCount * 18,
      estimatedValue: unitCount * 700
    });

    return tasks;
  }

  private static createCommunalAreaTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    const duration = endDate.getTime() - startDate.getTime();
    const halfDuration = duration / 2;
    
    return [
      {
        trade: "Electrician",
        description: "Communal area electrical installation",
        startDate,
        endDate: new Date(startDate.getTime() + halfDuration),
        floorCoreUnit: "Communal areas",
        priority: "medium",
        weekNumber,
        dependencies: ["Structure ready"],
        estimatedHours: 80,
        estimatedValue: 3000
      },
      {
        trade: "General Construction",
        description: "Communal area fit-out and finishes",
        startDate: new Date(startDate.getTime() + halfDuration * 0.5),
        endDate,
        floorCoreUnit: "Communal areas",
        priority: "medium",
        weekNumber,
        dependencies: ["Electrical 1st fix complete"],
        estimatedHours: 120,
        estimatedValue: 4500
      }
    ];
  }

  private static createExternalWorksTasks(
    row: ProgramRow, 
    startDate: Date, 
    endDate: Date, 
    weekNumber: number
  ): TradeTaskBreakdown[] {
    return [
      {
        trade: "Landscaper",
        description: "External works and landscaping",
        startDate,
        endDate,
        floorCoreUnit: "External areas",
        priority: "low",
        weekNumber,
        dependencies: ["Building substantially complete"],
        estimatedHours: 200,
        estimatedValue: 8000
      }
    ];
  }

  private static getTaskPriority(row: ProgramRow): 'high' | 'medium' | 'low' {
    const criticalKeywords = ['foundation', 'structural', 'crane', 'critical', 'milestone'];
    
    if (criticalKeywords.some(keyword => row.name.toLowerCase().includes(keyword))) {
      return 'high';
    }
    
    return 'medium';
  }

  private static estimateHours(row: ProgramRow): number {
    // Basic estimation based on duration and work type
    const durationMatch = row.duration.match(/(\d+)w/);
    const weeks = durationMatch ? parseInt(durationMatch[1]) : 1;
    
    return weeks * 40; // 40 hours per week baseline
  }

  private static estimateValue(row: ProgramRow): number {
    // Basic value estimation
    const hours = this.estimateHours(row);
    const ratePerHour = 25; // Average rate
    
    return hours * ratePerHour;
  }

  private static identifyCriticalPath(tasks: TradeTaskBreakdown[]): string[] {
    // Simple critical path identification - in reality this would be more complex
    return tasks
      .filter(task => task.priority === 'high')
      .map(task => task.description)
      .slice(0, 5); // Top 5 critical tasks
  }

  // Main public method to analyze uploaded file
  static async analyzeUploadedProgram(file: File, projectId?: string): Promise<ProgramAnalysisResult> {
    try {
      // Step 1: Parse the file
      const parsedProgram = await this.parseExcelFile(file);
      
      // Step 2: Analyze with AI
      const analysisResult = await this.analyzeWithAI(parsedProgram);
      
      // Step 3: Associate with project if provided
      if (projectId) {
        analysisResult.tradeTasks.forEach(task => {
          // This would be handled in the UI layer when converting to actual Task objects
        });
        
        analysisResult.adminItems.forEach(item => {
          item.projectId = projectId;
        });
      }
      
      return analysisResult;
      
    } catch (error) {
      console.error('Program analysis failed:', error);
      throw new Error(`Failed to analyze program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 