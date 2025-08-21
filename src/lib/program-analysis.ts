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
  // Efficient Base64 conversion for large files (prevents call stack overflow)
  private static arrayBufferToBase64(uint8Array: Uint8Array): string {
    const chunkSize = 0x8000 // 32KB chunks to prevent call stack overflow
    let base64 = ''
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
      base64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)))
    }
    
    return base64
  }

  // File parsing methods - now sends raw file to server for processing
  static async parseExcelFile(file: File): Promise<ParsedProgram> {
    console.log('📄 Parsing uploaded file:', file.name)
    
    const projectName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    
    try {
      // Convert file to base64 for sending to server (chunk-based approach for large files)
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const base64Data = this.arrayBufferToBase64(uint8Array)
      
      console.log('📋 Sending file to server for PDF text extraction...')
      
      // Send to server for PDF parsing
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fileData: base64Data,
          fileName: file.name 
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to parse PDF on server')
      }
      
      console.log('✅ PDF text extracted on server:', {
        textLength: result.text.length,
        preview: result.text.substring(0, 200)
      })
      
      // Parse the text into program rows
      const rows = this.parseProgramText(result.text)
      
      // Extract timeline information
      const dates = this.extractDatesFromText(result.text)
      const programStart = dates.start || new Date("2020-07-20")
      const programEnd = dates.end || new Date("2022-05-03")
      
      return {
        projectName,
        rows,
        timeline: {
          programStart,
          programEnd,
          totalDuration: Math.ceil((programEnd.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24 * 7)) // weeks
        },
        metadata: {
          fileName: file.name,
          parseDate: new Date(),
          totalLines: rows.length
        }
      };
    } catch (error) {
      console.error('❌ Failed to parse PDF:', error)
      
      // Fallback to basic structure if PDF parsing fails
      console.log('🔄 Falling back to basic program structure...')
      return this.createFallbackProgram(projectName, file.name)
    }
  }

  private static parseProgramText(text: string): ProgramRow[] {
    const rows: ProgramRow[] = []
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    
    let lineNumber = 1
    
    for (const line of lines) {
      // Look for lines that seem like program activities
      // This is a basic parser - could be enhanced based on your specific PDF format
      const trimmedLine = line.trim()
      
      // Skip header lines and page numbers
      if (this.isHeaderOrPageNumber(trimmedLine)) {
        continue
      }
      
      // Try to extract activity information
      const activityData = this.extractActivityFromLine(trimmedLine)
      
      if (activityData) {
        rows.push({
          lineNumber: lineNumber++,
          name: activityData.name,
          duration: activityData.duration || "",
          startDate: activityData.startDate || "",
          finishDate: activityData.finishDate || "",
          workType: activityData.workType,
          notes: activityData.notes
        })
      }
    }
    
    console.log(`📊 Extracted ${rows.length} program activities from PDF`)
    return rows
  }

  private static isHeaderOrPageNumber(line: string): boolean {
    // Skip common header patterns and page numbers
    const skipPatterns = [
      /^page\s+\d+/i,
      /^project:/i,
      /^programme/i,
      /^activity\s+id/i,
      /^task\s+name/i,
      /^start\s+date/i,
      /^finish\s+date/i,
      /^\d+\s*$/,
      /^-+$/,
      /^=+$/
    ]
    
    return skipPatterns.some(pattern => pattern.test(line))
  }

  private static extractActivityFromLine(line: string): {
    name: string
    duration?: string
    startDate?: string
    finishDate?: string
    workType?: string
    notes?: string
  } | null {
    // This is a basic extraction - you may need to adjust based on your PDF format
    // Look for patterns like: "Activity Name    Duration    Start Date    End Date"
    
    // Remove extra whitespace and split by multiple spaces/tabs
    const parts = line.split(/\s{2,}|\t+/).filter(part => part.trim().length > 0)
    
    if (parts.length < 1) return null
    
    const name = parts[0].trim()
    
    // Skip if it looks like a date or number only
    if (/^\d+[\/\-]\d+[\/\-]\d+$/.test(name) || /^\d+$/.test(name)) {
      return null
    }
    
    // Extract duration (look for patterns like "5w", "3w 2d", "14 weeks")
    const duration = parts.find(part => 
      /\d+\s*w|week|day|month/i.test(part)
    ) || ""
    
    // Extract dates (look for date patterns)
    const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/
    const dates = parts.filter(part => datePattern.test(part))
    
    // Determine work type based on keywords
    const workType = this.determineWorkType(name)
    
    return {
      name,
      duration,
      startDate: dates[0] || "",
      finishDate: dates[1] || dates[0] || "",
      workType,
      notes: parts.length > 3 ? parts.slice(3).join(' ') : undefined
    }
  }

  private static determineWorkType(activityName: string): string {
    const name = activityName.toLowerCase()
    
    if (name.includes('demolition') || name.includes('asbestos')) return 'demolition'
    if (name.includes('piling') || name.includes('foundation')) return 'structural'
    if (name.includes('concrete') || name.includes('slab') || name.includes('frame')) return 'structural'
    if (name.includes('electrical')) return 'electrical'
    if (name.includes('plumbing') || name.includes('mechanical')) return 'plumbing'
    if (name.includes('scaffold')) return 'scaffolding'
    if (name.includes('roofing') || name.includes('roof')) return 'roofing'
    if (name.includes('window') || name.includes('glazing')) return 'windows'
    if (name.includes('brick') || name.includes('block') || name.includes('masonry')) return 'masonry'
    if (name.includes('fit out') || name.includes('fitout')) return 'fitout'
    if (name.includes('external') || name.includes('landscap')) return 'site'
    if (name.includes('client') || name.includes('approval') || name.includes('design')) return 'admin'
    if (name.includes('survey') || name.includes('procurement')) return 'admin'
    if (name.includes('handover') || name.includes('milestone')) return 'milestone'
    
    return 'construction'
  }

  private static extractDatesFromText(text: string): { start?: Date, end?: Date } {
    const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g
    const dates = text.match(datePattern) || []
    
    const parsedDates = dates
      .map(dateStr => this.parseDate(dateStr))
      .filter(date => date !== null)
      .sort((a, b) => a!.getTime() - b!.getTime())
    
    return {
      start: parsedDates[0] || undefined,
      end: parsedDates[parsedDates.length - 1] || undefined
    }
  }

  private static createFallbackProgram(projectName: string, fileName: string): ParsedProgram {
    console.log('🔄 Creating fallback program structure for AI analysis...')
    
    // Return a minimal structure that tells the AI to work with whatever data it receives
    const basicRows: ProgramRow[] = [
      {
        lineNumber: 1,
        name: "Construction Programme Analysis Required",
        duration: "TBD",
        startDate: "TBD",
        finishDate: "TBD",
        workType: "analysis",
        notes: `Please analyze the uploaded file: ${fileName}`
      }
    ]

    const programStart = new Date("2020-07-20")
    const programEnd = new Date("2022-05-03")
    
    return {
      projectName,
      rows: basicRows,
      timeline: {
        programStart,
        programEnd,
        totalDuration: Math.ceil((programEnd.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24 * 7))
      },
      metadata: {
        fileName,
        parseDate: new Date(),
        totalLines: basicRows.length
      }
    }
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
      // Send the complete program data including raw text for better AI analysis
      const programData = {
        projectName: parsedProgram.projectName,
        timeline: parsedProgram.timeline,
        activities: parsedProgram.rows.map(row => ({
          name: row.name,
          duration: row.duration,
          startDate: row.startDate,
          finishDate: row.finishDate,
          workType: row.workType,
          notes: row.notes
        })),
        metadata: parsedProgram.metadata
      }

      console.log('📤 Sending complete program data to server for AI analysis...')
      
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