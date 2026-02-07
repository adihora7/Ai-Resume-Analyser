import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import confetti from 'canvas-confetti'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [isRemoving, setIsRemoving] = useState(false)

    const maxFileSize = 20 * 1024 * 1024

    const fireConfetti = () => {
        confetti({
            particleCount: 140,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366F1', '#8B5CF6', '#EC4899', '#22C55E']
        })
    }

    const simulateUpload = () => {
        setProgress(0)
        let value = 0

        const interval = setInterval(() => {
            value += 8
            setProgress(value)

            if (value >= 100) {
                clearInterval(interval)
                fireConfetti()
            }
        }, 40)
    }

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            setError('Only PDF files under 20MB are allowed.')
            return
        }

        const selected = acceptedFiles[0]
        setFile(selected)
        setError(null)
        onFileSelect?.(selected)
        simulateUpload()
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize,
    })

    const removeFile = () => {
        setIsRemoving(true)
        setTimeout(() => {
            setFile(null)
            setProgress(0)
            setIsRemoving(false)
            onFileSelect?.(null)
        }, 200)
    }

    return (
        <div
            {...getRootProps()}
            className={`
        w-full gradient-border transition-all duration-200
        ${isDragActive ? 'scale-[1.02] ring-2 ring-indigo-400' : ''}
      `}
        >
            <input {...getInputProps()} />

            <div className="space-y-4 cursor-pointer">
                {file ? (
                    <div
                        className={`
              uploader-selected-file flex items-center justify-between
              transition-all duration-200
              ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />

                            <div>
                                <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                    {file.name}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {formatSize(file.size)}
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full transition-all duration-200"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="p-2 hover:bg-red-50 rounded-full transition"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                removeFile()
                            }}
                        >
                            <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        className={`
              text-center py-8 transition-all
              ${isDragActive ? 'scale-105 text-indigo-600' : 'text-gray-500'}
            `}
                    >
                        <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                            <img src="/icons/info.svg" alt="upload" className="size-20" />
                        </div>

                        <p className="text-lg">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>

                        <p className="text-sm">PDF (max {formatSize(maxFileSize)})</p>

                        {error && (
                            <p className="mt-2 text-sm text-red-500 animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FileUploader
