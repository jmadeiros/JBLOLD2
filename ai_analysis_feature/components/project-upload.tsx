"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, Check, AlertCircle, FileSpreadsheet, FileImage, Archive, Folder, Zap, Brain, FileSearch } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { ProgramAnalysisService } from "@/lib/program-analysis"
import { ProgramAnalysisResults } from "./program-analysis-results"
import type { ProgramAnalysisResult, TradeTaskBreakdown, ProgrammeAdminItem } from "../../types/task"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'completed' | 'analyzing' | 'analyzed' | 'error'
  progress: number
  analysisResult?: ProgramAnalysisResult
  errorMessage?: string
}

interface ProjectUploadProps {
  onFilesUploaded?: (files: File[]) => void
  onTasksImported?: (tasks: TradeTaskBreakdown[], programName?: string) => void
  onAdminItemsImported?: (items: ProgrammeAdminItem[], programName?: string) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  projectId?: string
  enableAIAnalysis?: boolean
}

export function ProjectUpload({ 
  onFilesUploaded, 
  onTasksImported,
  onAdminItemsImported,
  maxFiles = 10, 
  maxFileSize = 100,
  acceptedTypes = ['.pdf', '.dwg', '.xlsx', '.docx', '.png', '.jpg', '.jpeg', '.zip', '.mpp'],
  projectId,
  enableAIAnalysis = true
}: ProjectUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileForAnalysis, setSelectedFileForAnalysis] = useState<UploadedFile | null>(null)
  const [showAnalysisResults, setShowAnalysisResults] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const fileSizeMB = file.size / (1024 * 1024)

    if (!acceptedTypes.some(type => fileExtension === type.toLowerCase())) {
      return `File type ${fileExtension} not supported`
    }

    if (fileSizeMB > maxFileSize) {
      return `File size exceeds ${maxFileSize}MB limit`
    }

    return null
  }

  const simulateUpload = async (file: UploadedFile, originalFile: File) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadedFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, progress } : f)
      )
    }

    // Mark as completed
    setUploadedFiles(prev => 
      prev.map(f => f.id === file.id ? { ...f, status: 'completed' } : f)
    )

    // Auto-analyze if it's a program file and AI analysis is enabled
    if (enableAIAnalysis && isProgramFile(originalFile)) {
      await analyzeFile(file, originalFile)
    }
  }

  const isProgramFile = (file: File): boolean => {
    const programExtensions = ['.xlsx', '.xls', '.mpp', '.csv']
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isProgramKeyword = file.name.toLowerCase().includes('program') || 
                            file.name.toLowerCase().includes('schedule') ||
                            file.name.toLowerCase().includes('timeline')
    
    console.log('File analysis:', {
      fileName: file.name,
      extension,
      isProgramExtension: programExtensions.includes(extension),
      isProgramKeyword,
      willAnalyze: programExtensions.includes(extension) || isProgramKeyword
    })
    
    return programExtensions.includes(extension) || isProgramKeyword
  }

  const analyzeFile = async (uploadedFile: UploadedFile, originalFile: File) => {
    try {
      console.log('Starting AI analysis for:', originalFile.name)
      
      // Update status to analyzing
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'analyzing' } : f)
      )

      toast.info("Analyzing construction program...", {
        description: "AI is disaggregating the program into trade tasks and admin items"
      })

      // Perform AI analysis
      console.log('Calling ProgramAnalysisService...')
      const analysisResult = await ProgramAnalysisService.analyzeUploadedProgram(originalFile, projectId)
      console.log('Analysis completed:', analysisResult)

      // Update with analysis results
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { 
          ...f, 
          status: 'analyzed',
          analysisResult 
        } : f)
      )

      toast.success("Program analysis complete!", {
        description: `Found ${analysisResult.tradeTasks.length} trade tasks and ${analysisResult.adminItems.length} admin items. Ready to create new project!`
      })

    } catch (error) {
      console.error('Analysis failed:', error)
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { 
          ...f, 
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Analysis failed'
        } : f)
      )

      toast.error("Program analysis failed", {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  const handleViewAnalysis = (file: UploadedFile) => {
    setSelectedFileForAnalysis(file)
    setShowAnalysisResults(true)
  }

  const handleImportTasks = async (tasks: TradeTaskBreakdown[]) => {
    setIsImporting(true)
    try {
      // Convert TradeTaskBreakdown to Task objects and import
      if (onTasksImported && selectedFileForAnalysis?.analysisResult) {
        const programName = selectedFileForAnalysis.analysisResult.programName
        console.log('🏷️ Program name from analysis:', {
          programName,
          analysisResult: selectedFileForAnalysis.analysisResult,
          hasAnalysisResult: !!selectedFileForAnalysis.analysisResult,
          hasProgramName: !!programName
        })
        onTasksImported(tasks, programName)
      }
      
      toast.success(`Imported ${tasks.length} trade tasks`, {
        description: "Tasks added to project timeline and can be assigned to team members"
      })
      
      setShowAnalysisResults(false)
    } catch (error) {
      toast.error("Failed to import tasks")
    } finally {
      setIsImporting(false)
    }
  }

  const handleImportAdminItems = async (items: ProgrammeAdminItem[]) => {
    setIsImporting(true)
    try {
      if (onAdminItemsImported && selectedFileForAnalysis?.analysisResult) {
        const programName = selectedFileForAnalysis.analysisResult.programName
        onAdminItemsImported(items, programName)
      }
      
      toast.success(`Imported ${items.length} admin items`, {
        description: "Items added to project calendar"
      })
      
      setShowAnalysisResults(false)
    } catch (error) {
      toast.error("Failed to import admin items")
    } finally {
      setIsImporting(false)
    }
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    setIsUploading(true)

    const validFiles: File[] = []
    const newUploadedFiles: UploadedFile[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        return
      }

      validFiles.push(file)
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      }
      newUploadedFiles.push(uploadedFile)
    })

    // Show validation errors
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (newUploadedFiles.length === 0) {
      setIsUploading(false)
      return
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles])

    // Simulate upload for each file
    await Promise.all(newUploadedFiles.map((file, index) => simulateUpload(file, validFiles[index])))

    setIsUploading(false)
    
    // Show success message
    if (validFiles.length > 0) {
      toast.success(`Successfully uploaded ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`)
      
      if (onFilesUploaded) {
        onFilesUploaded(validFiles)
      }
    }
  }, [uploadedFiles.length, maxFiles, maxFileSize, acceptedTypes, onFilesUploaded])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
        return <FileImage className="h-4 w-4 text-blue-600" />
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-4 w-4 text-orange-600" />
      case 'dwg':
      case 'rvt':
      case 'mpp':
        return <Folder className="h-4 w-4 text-purple-600" />
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />
      case 'docx':
      case 'doc':
        return <FileText className="h-4 w-4 text-blue-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        <Upload className={cn(
          "mx-auto h-12 w-12 mb-4",
          isDragOver ? "text-blue-500" : "text-gray-400"
        )} />
        <div className="space-y-2 text-center">
          <p className="text-lg font-medium">
            {isDragOver ? "Drop files here" : "Drag & drop construction program"}
          </p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <label className="text-blue-600 hover:text-blue-500 cursor-pointer underline">
              browse files
              <input
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
            </label>{" "}
            to create a new project
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file
          </p>
        </div>
      </div>

      {/* Upload Progress and File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
            {isUploading && (
              <Badge variant="outline" className="text-blue-600">
                Uploading...
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <div className="flex-shrink-0">
                  {file.status === 'completed' && <Check className="h-4 w-4 text-green-600" />}
                  {file.status === 'analyzed' && <Brain className="h-4 w-4 text-blue-600" />}
                  {file.status === 'analyzing' && <Zap className="h-4 w-4 text-orange-600 animate-pulse" />}
                  {file.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  {file.status === 'uploading' && getFileIcon(file.name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-1" />
                  )}
                  
                  {file.status === 'analyzing' && (
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="h-3 w-3 text-orange-600" />
                      <span className="text-xs text-orange-600">Analyzing program...</span>
                    </div>
                  )}
                  
                  {file.status === 'analyzed' && file.analysisResult && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {file.analysisResult.tradeTasks.length} tasks
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.analysisResult.adminItems.length} admin items
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalysis(file)}
                        className="h-6 text-xs"
                      >
                        <FileSearch className="h-3 w-3 mr-1" />
                        View Analysis
                      </Button>
                    </div>
                  )}
                  
                  {file.status === 'completed' && !file.analysisResult && isProgramFile({ name: file.name } as File) && (
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => analyzeFile(file, { name: file.name, size: file.size } as File)}
                      className="h-6 text-xs mt-1"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Analyze with AI
                    </Button>
                  )}
                  
                  {file.status === 'error' && file.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">{file.errorMessage}</p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Stats */}
      {uploadedFiles.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Total files: {uploadedFiles.length} / {maxFiles}</div>
          <div>
            Total size: {formatFileSize(uploadedFiles.reduce((acc, file) => acc + file.size, 0))}
          </div>
        </div>
      )}

      {/* Analysis Results Modal */}
      {showAnalysisResults && selectedFileForAnalysis?.analysisResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <ProgramAnalysisResults
                analysisResult={selectedFileForAnalysis.analysisResult}
                onImportTasks={handleImportTasks}
                onImportAdminItems={handleImportAdminItems}
                onClose={() => setShowAnalysisResults(false)}
                isImporting={isImporting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 