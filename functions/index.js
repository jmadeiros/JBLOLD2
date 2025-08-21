/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({ maxInstances: 10 });

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

exports.analyzeProgram = onRequest({ cors: true }, async (req, res) => {
  try {
    console.log('🚀 Firebase Function AI analysis starting...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { programData } = req.body;
    
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log('❌ No API key found, using mock analysis');
      return res.json({ 
        error: 'No API key configured',
        useMock: true 
      });
    }

    console.log('📤 Sending program to Gemini AI...');
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: AI_ANALYSIS_PROMPT + '\n\nProgram Data:\n' + JSON.stringify(programData)
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 65536,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error Response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
      console.error('❌ No candidates in Gemini response:', JSON.stringify(result, null, 2));
      throw new Error('No candidates returned from Gemini API');
    }
    
    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      console.error('❌ No content in candidate:', JSON.stringify(candidate, null, 2));
      throw new Error('No content in Gemini API response');
    }

    const aiResponse = candidate.content.parts[0].text;
    console.log('📥 Raw AI response received, parsing...');
    
    // Clean the AI response
    let cleanResponse = aiResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    
    // Extract JSON from the cleaned response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    let jsonStr = jsonMatch ? jsonMatch[0] : cleanResponse;
    
    // Cleanup JSON
    jsonStr = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/,\s*$/, '')
      .replace(/\n\s*,/g, ',')
      .replace(/,\s*\n\s*}/g, '\n}')
      .replace(/,\s*\n\s*]/g, '\n]');
    
    // Close missing brackets and braces
    let openBraces = (jsonStr.match(/{/g) || []).length;
    let closeBraces = (jsonStr.match(/}/g) || []).length;
    let openBrackets = (jsonStr.match(/\[/g) || []).length;
    let closeBrackets = (jsonStr.match(/]/g) || []).length;
    
    while (openBrackets > closeBrackets) {
      jsonStr += ']';
      closeBrackets++;
    }
    while (openBraces > closeBraces) {
      jsonStr += '}';
      closeBraces++;
    }
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(jsonStr);
      
      // Validate the structure
      if (!analysisResult.tradeTasks || !Array.isArray(analysisResult.tradeTasks)) {
        throw new Error('Missing or invalid tradeTasks array');
      }
      
      if (!analysisResult.adminItems || !Array.isArray(analysisResult.adminItems)) {
        throw new Error('Missing or invalid adminItems array');
      }
      
      console.log('✅ AI analysis complete:', {
        tradeTasks: analysisResult.tradeTasks?.length || 0,
        adminItems: analysisResult.adminItems?.length || 0
      });
      
      return res.json({ 
        success: true,
        result: analysisResult 
      });
    } catch (e) {
      console.error('❌ JSON Parse Error:', e.message);
      
      return res.status(500).json({ 
        error: `Failed to parse AI response as JSON: ${e.message}`,
        useMock: true 
      });
    }

  } catch (error) {
    console.error('❌ Firebase Function AI analysis failed:', error);
    
    const errorMessage = error.message || 'Unknown error';
    const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429');
    
    if (isQuotaError) {
      console.log('🎭 Quota exceeded, falling back to comprehensive mock analysis');
      return res.json({ 
        error: 'API quota exceeded - using detailed mock analysis',
        useMock: true 
      });
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      useMock: true 
    });
  }
});
