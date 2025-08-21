import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Server-side PDF parsing starting...')
    
    const { fileData, fileName } = await request.json()
    
    if (!fileData) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file data provided' 
      }, { status: 400 })
    }

    // Convert base64 back to buffer
    const buffer = Buffer.from(fileData, 'base64')
    
    console.log('📄 Processing PDF file:', fileName)
    console.log('📊 File size:', buffer.length, 'bytes')
    
    // Parse PDF to extract text
    const pdfData = await pdfParse(buffer)
    
    console.log('✅ PDF parsing complete:', {
      pages: pdfData.numpages,
      textLength: pdfData.text.length,
      preview: pdfData.text.substring(0, 200) + '...'
    })
    
    return NextResponse.json({ 
      success: true,
      text: pdfData.text,
      pages: pdfData.numpages,
      metadata: {
        fileName,
        extractedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ PDF parsing failed:', error)
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during PDF parsing'
    }, { status: 500 })
  }
} 