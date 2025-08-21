import { NextRequest, NextResponse } from 'next/server'

// AI Configuration - reads from environment variables (server-side)
const AI_CONFIG = {
  provider: (process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'azure' | 'gemini' | 'mock') || 'gemini',
  apiKey: process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY,
  model: process.env.AI_PROVIDER === 'gemini' ? 'gemini-2.5-flash' : 'claude-3-sonnet-20240229'
}

// AI Analysis Prompt
const AI_ANALYSIS_PROMPT = `
Please analyse the construction programme and produce a detailed breakdown of works that is suitable for assigning tasks to specific trade teams or individuals. The goal is to generate task-level data that reflects the actual workflow on-site.

📌 Part 1: Element of Work Breakdown

Identify and tag each line item in the programme with a clearly defined trade (e.g., electrician, plumber, bricklayer, dryliner, etc.).

Disaggregate high-level items into smaller, task-specific elements — especially for trades like:

Electrical: split into first fix, second fix, testing, commissioning, and snagging per flat, core, or floor.

Plumbing: break down by first fix pipework, soil stacks, second fix, testing, plant room work, and commissioning.

Fit-out works: separate into joinery, painting, flooring, kitchens, bathrooms — per flat or per core.

📌 Part 2: Task-Level Disaggregation

For each trade task, provide:
- A specific description of the work
- Estimated hours for completion
- Dependencies (what must be completed before this task can start)
- Priority level (high/medium/low)
- Floor/unit reference where applicable

📌 Part 3: Admin vs Trade Separation

Separate programme items into two categories:

1. TRADE TASKS: Physical construction work that requires specific trades/skills
   - These will go into the Gantt timeline and task management system
   - Include trades like: electrician, plumber, bricklayer, carpenter, etc.

2. ADMIN ITEMS: Non-trade activities, approvals, milestones, meetings
   - These will go into the calendar as events
   - Include items like: client approvals, surveys, design, procurement, handovers, etc.

CRITICAL: You must return ALL trade tasks in the tradeTasks array, not just a sample. If you identify 117 trade tasks in your summary, then include all 117 tasks in the tradeTasks array. Do not truncate or limit the output.

ENSURE COMPLETE JSON: Make sure your JSON response is valid and complete. End all arrays with ] and objects with }. If you need to break down tasks, prioritize the most important ones first.

Return the analysis in this JSON format:

{
  "summary": {
    "totalTradeTasks": number,
    "totalAdminItems": number,
    "projectDuration": "X weeks",
    "uniqueTrades": string[]
  },
  "tradeTasks": [
    {
      "trade": "string (e.g., Electrician, Plumber, etc.)",
      "description": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD", 
      "floorCoreUnit": "string (e.g., Ground Floor, Unit 1-5, etc.)",
      "priority": "high|medium|low",
      "dependencies": ["string"],
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

function extractPartialData(jsonStr: string): any {
  console.log('🔍 Extracting partial data from response...')
  
  let tradeTasks: any[] = [];
  let adminItems: any[] = [];
  
  // More aggressive task extraction - look for individual task objects
  const allTaskMatches = jsonStr.match(/{\s*"trade":\s*"[^"]+",[\s\S]*?(?="trade":|}\s*,?\s*}|}\s*]|$)/g) || [];
  
  console.log(`🔍 Found ${allTaskMatches.length} potential task objects`)
  
  for (let i = 0; i < allTaskMatches.length; i++) {
    let taskStr = allTaskMatches[i];
    
    // Try to close the object if it's incomplete
    if (!taskStr.endsWith('}')) {
      taskStr += '}';
    }
    
    try {
      const task = JSON.parse(taskStr);
      if (task.trade && task.description) {
        tradeTasks.push({
          trade: task.trade,
          description: task.description,
          startDate: task.startDate || '2024-01-01',
          endDate: task.endDate || '2024-01-02', 
          floorCoreUnit: task.floorCoreUnit || 'Unknown',
          priority: task.priority || 'medium',
          dependencies: task.dependencies || [],
          estimatedHours: task.estimatedHours || 8,
          estimatedValue: task.estimatedValue || 1000
        });
      }
    } catch (e) {
      console.log(`⚠️ Skipping malformed task ${i + 1}:`, e instanceof Error ? e.message : 'Unknown error');
    }
  }
  
  // Extract admin items similarly
  const adminMatches = jsonStr.match(/{\s*"title":\s*"[^"]+",[\s\S]*?(?="title":|}\s*,?\s*}|}\s*]|$)/g) || [];
  
  for (let i = 0; i < adminMatches.length; i++) {
    let itemStr = adminMatches[i];
    
    if (!itemStr.endsWith('}')) {
      itemStr += '}';
    }
    
    try {
      const item = JSON.parse(itemStr);
      if (item.title && item.type) {
        adminItems.push(item);
      }
    } catch (e) {
      console.log(`⚠️ Skipping malformed admin item ${i + 1}`);
    }
  }
  
  console.log(`✅ Extracted ${tradeTasks.length} trade tasks and ${adminItems.length} admin items`)
  
  return {
    summary: {
      totalTradeTasks: tradeTasks.length,
      totalAdminItems: adminItems.length,
      projectDuration: "Unknown",
      uniqueTrades: [...new Set(tradeTasks.map(t => t.trade).filter(Boolean))]
    },
    tradeTasks,
    adminItems
  };
}

async function callGeminiAPI(prompt: string, programData: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt + '\n\nProgram Data:\n' + programData
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 65536,
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Gemini API Error Response:', errorText)
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const result = await response.json()
  
  // Debug the response structure
  console.log('🔍 Gemini API Response Structure:', {
    hasCandidates: !!result.candidates,
    candidatesLength: result.candidates?.length || 0,
    firstCandidate: result.candidates?.[0] ? {
      hasContent: !!result.candidates[0].content,
      hasParts: !!result.candidates[0].content?.parts,
      partsLength: result.candidates[0].content?.parts?.length || 0,
      finishReason: result.candidates[0].finishReason
    } : null,
    keys: Object.keys(result)
  })
  
  // Handle different response structures
  if (!result.candidates || result.candidates.length === 0) {
    console.error('❌ No candidates in Gemini response:', JSON.stringify(result, null, 2))
    throw new Error('No candidates returned from Gemini API')
  }
  
  const candidate = result.candidates[0]
  if (!candidate.content) {
    console.error('❌ No content in candidate:', JSON.stringify(candidate, null, 2))
    throw new Error('No content in Gemini API response')
  }
  
  // Handle different response structures (parts vs direct text)
  if (candidate.content.parts && candidate.content.parts.length > 0) {
    return candidate.content.parts[0].text
  } else if (candidate.content.text) {
    return candidate.content.text
  } else {
    console.error('❌ No text found in response:', JSON.stringify(candidate.content, null, 2))
    console.log('🔍 Finish reason:', candidate.finishReason)
    throw new Error(`No text content found. Finish reason: ${candidate.finishReason}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Server-side AI analysis starting...')
    
    // Debug API key
    const apiKey = AI_CONFIG.apiKey
    console.log('🔐 API Key Debug:', {
      provider: AI_CONFIG.provider,
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyStart: apiKey?.substring(0, 15) || 'none',
      keyEnd: apiKey?.slice(-10) || 'none',
      model: AI_CONFIG.model
    })

    const { programData } = await request.json()
    
    if (!apiKey) {
      console.log('❌ No API key found, using mock analysis')
      return NextResponse.json({ 
        error: 'No API key configured',
        useMock: true 
      })
    }

    console.log('📤 Sending program to Gemini AI...')
    console.log('📊 Program data size:', JSON.stringify(programData).length, 'characters')
    console.log('📋 Program data preview:', JSON.stringify(programData).substring(0, 500) + '...')
    
    // Call Gemini API with fallback
    let aiResponse: string
    try {
      aiResponse = await callGeminiAPI(AI_ANALYSIS_PROMPT, JSON.stringify(programData))
    } catch (geminiError) {
      console.error('❌ Gemini 2.5-flash failed, trying fallback model...', geminiError)
      
      // Try with 1.5-flash as fallback
      const fallbackConfig = { ...AI_CONFIG, model: 'gemini-1.5-flash' }
      const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallbackConfig.model}:generateContent?key=${fallbackConfig.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: AI_ANALYSIS_PROMPT + '\n\nProgram Data:\n' + JSON.stringify(programData) }] }],
          generationConfig: { temperature: 0.3, topK: 40, topP: 0.95, maxOutputTokens: 8000 }
        })
      })
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback model also failed: ${fallbackResponse.status}`)
      }
      
      const fallbackResult = await fallbackResponse.json()
      aiResponse = fallbackResult.candidates[0].content.parts[0].text
      console.log('✅ Fallback model succeeded')
    }
    
    console.log('📥 Raw AI response received, parsing...')
    console.log('📊 AI response length:', aiResponse.length, 'characters')
    console.log('📋 AI response preview:', aiResponse.substring(0, 500) + '...')
    console.log('📋 AI response ending:', aiResponse.slice(-500))
    
    // Clean the AI response - remove markdown code blocks and comments
    let cleanResponse = aiResponse
      .replace(/```json\s*/g, '')  // Remove ```json
      .replace(/```\s*/g, '')      // Remove ```
      .replace(/\/\/.*$/gm, '')    // Remove // comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .trim()
    
    // Extract JSON from the cleaned response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
    let jsonStr = jsonMatch ? jsonMatch[0] : cleanResponse
    
    // Aggressive JSON cleanup and repair
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/,\s*$/, '')           // Remove trailing comma at end
      .replace(/\n\s*,/g, ',')        // Fix newline comma issues
      .replace(/,\s*\n\s*}/g, '\n}')  // Fix comma before closing brace
      .replace(/,\s*\n\s*]/g, '\n]')  // Fix comma before closing bracket
    
    // If JSON is truncated, try to close it properly
    let openBraces = (jsonStr.match(/{/g) || []).length
    let closeBraces = (jsonStr.match(/}/g) || []).length
    let openBrackets = (jsonStr.match(/\[/g) || []).length
    let closeBrackets = (jsonStr.match(/]/g) || []).length
    
    // Close missing brackets and braces
    while (openBrackets > closeBrackets) {
      jsonStr += ']'
      closeBrackets++
    }
    while (openBraces > closeBraces) {
      jsonStr += '}'
      closeBraces++
    }
    
    console.log('🧹 Cleaned JSON string length:', jsonStr.length)
    console.log('🔍 JSON Preview:', jsonStr.substring(0, 200) + '...')
    
        let analysisResult
    try {
      analysisResult = JSON.parse(jsonStr)
      
      // Validate the structure
      if (!analysisResult.tradeTasks || !Array.isArray(analysisResult.tradeTasks)) {
        throw new Error('Missing or invalid tradeTasks array')
      }
      
      if (!analysisResult.adminItems || !Array.isArray(analysisResult.adminItems)) {
        throw new Error('Missing or invalid adminItems array')
      }
      
      if (!analysisResult.summary || typeof analysisResult.summary !== 'object') {
        throw new Error('Missing or invalid summary object')
      }
      
      console.log('🔍 Raw AI analysis result structure:', {
        hasTradeTasksArray: Array.isArray(analysisResult.tradeTasks),
        tradeTasksCount: analysisResult.tradeTasks?.length || 0,
        hasAdminItemsArray: Array.isArray(analysisResult.adminItems),
        adminItemsCount: analysisResult.adminItems?.length || 0,
        summaryTasksCount: analysisResult.summary?.totalTradeTasks || 0,
        firstTradeTasks: analysisResult.tradeTasks?.slice(0, 3) || [],
        keys: Object.keys(analysisResult)
      })
      
      console.log('✅ AI analysis complete:', {
        tradeTasks: analysisResult.tradeTasks?.length || 0,
        adminItems: analysisResult.adminItems?.length || 0
      })
      
      return NextResponse.json({ 
        success: true,
        result: analysisResult 
      })
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('❌ JSON Parse Error:', e.message)
        console.log('📝 Last 500 characters of JSON:', jsonStr.slice(-500))
        
        // Try to extract partial data using regex
        console.log('🔧 Attempting to extract partial data...')
        try {
          const partialResult = extractPartialData(jsonStr)
          console.log('✅ Partial extraction successful:', {
            tradeTasks: partialResult.tradeTasks.length,
            adminItems: partialResult.adminItems.length
          })
          
          return NextResponse.json({ 
            success: true,
            result: partialResult,
            note: 'Recovered from JSON parsing error using partial extraction'
          })
        } catch (extractError) {
          console.error('❌ Partial extraction also failed:', extractError)
          
          return NextResponse.json({ 
            error: `Failed to parse AI response as JSON: ${e.message}`,
            useMock: true 
          }, { status: 500 })
        }
      }
      throw e
    }

    return NextResponse.json({ 
      success: true,
      result: analysisResult 
    })

  } catch (error) {
    console.error('❌ Server-side AI analysis failed:', error)
    
    // Check if it's a quota/rate limit error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')
    
    if (isQuotaError) {
      console.log('🎭 Quota exceeded, falling back to comprehensive mock analysis')
      return NextResponse.json({ 
        error: 'API quota exceeded - using detailed mock analysis',
        useMock: true 
      })
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      useMock: true 
    }, { status: 500 })
  }
} 