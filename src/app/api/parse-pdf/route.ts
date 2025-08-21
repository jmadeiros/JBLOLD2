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

    console.log('📄 Processing PDF file:', fileName)
    console.log('📊 Base64 data length:', fileData.length, 'characters')

    // Convert base64 back to buffer with validation
    let buffer: Buffer
    try {
      buffer = Buffer.from(fileData, 'base64')
      console.log('📊 Buffer size:', buffer.length, 'bytes')
      
      // Validate it's a PDF file by checking the header
      const pdfHeader = buffer.subarray(0, 4).toString()
      if (!pdfHeader.includes('%PDF')) {
        throw new Error('Invalid PDF file: Missing PDF header')
      }
      
      console.log('✅ PDF header validated')
    } catch (bufferError) {
      console.error('❌ Base64 to Buffer conversion failed:', bufferError)
      throw new Error('Failed to process file data: Invalid Base64 or corrupted file')
    }
    
    // Parse PDF to extract text with additional error handling
    console.log('🔄 Starting PDF text extraction...')
    const pdfData = await pdfParse(buffer)
    
    console.log('✅ PDF parsing complete:', {
      pages: pdfData.numpages,
      textLength: pdfData.text.length,
      hasText: pdfData.text.length > 0,
      preview: pdfData.text.length > 0 ? pdfData.text.substring(0, 200) + '...' : 'No text extracted'
    })
    
    // Validate that we actually got text content
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      console.warn('⚠️ PDF parsed but no text content found')
      return NextResponse.json({ 
        success: false,
        error: 'PDF processed successfully but no text content could be extracted. This might be a scanned PDF or image-based document.'
      }, { status: 422 })
    }
    
    return NextResponse.json({ 
      success: true,
      text: pdfData.text,
      pages: pdfData.numpages,
      metadata: {
        fileName,
        extractedAt: new Date().toISOString(),
        textLength: pdfData.text.length
      }
    })
    
  } catch (error) {
    console.error('❌ PDF parsing failed:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? `PDF parsing error: ${error.message}` : 'Unknown error during PDF parsing'
    }, { status: 500 })
  }
} 