"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, Subtitles, CaptionsIcon as SubtitlesOff } from "lucide-react"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl: string
  title: string
  transcript?: string
  onProgress?: (currentTime: number, duration: number) => void
  onComplete?: () => void
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title, transcript, onProgress, onComplete }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)
  const [currentTranscriptSegment, setCurrentTranscriptSegment] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // Parse transcript into segments with timestamps if available
  const transcriptSegments = transcript ? parseTranscript(transcript) : []

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      // Report progress every second
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime
          const duration = videoRef.current.duration || 0

          // Call onProgress callback if provided
          if (onProgress) {
            onProgress(currentTime, duration)
          }

          // Check if video is complete (within 1 second of the end)
          if (duration > 0 && currentTime >= duration - 1 && onComplete) {
            onComplete()
          }
        }
      }, 1000)
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying, onProgress, onComplete])

  // Update current transcript segment based on video time
  useEffect(() => {
    if (transcriptSegments.length > 0) {
      const segment = transcriptSegments.find((seg, index) => {
        const nextSeg = transcriptSegments[index + 1]
        return currentTime >= seg.startTime && (!nextSeg || currentTime < nextSeg.startTime)
      })

      if (segment) {
        setCurrentTranscriptSegment(segment.text)
      }
    }
  }, [currentTime, transcriptSegments])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleFullscreen = () => {
    if (playerRef.current) {
      if (!isFullscreen) {
        if (playerRef.current.requestFullscreen) {
          playerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // For demo purposes, we're using an image instead of a real video
  // In a real implementation, you would use a video element with a proper source
  return (
    <div ref={playerRef} className="relative group">
      <div className="relative aspect-video bg-black">
        {!isPlaying ? (
          <div className="absolute inset-0">
            <Image src={thumbnailUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button
                onClick={handlePlayPause}
                size="icon"
                className="h-16 w-16 rounded-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* AI Transcript Overlay */}
        {showTranscript && currentTranscriptSegment && isPlaying && (
          <div className="absolute bottom-16 left-0 right-0 p-4 bg-black/70 text-white text-center">
            {currentTranscriptSegment}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-white text-xs">{formatTime(duration || 0)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handlePlayPause} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button onClick={handleMuteToggle} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {transcript && (
                <Button onClick={toggleTranscript} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  {showTranscript ? <Subtitles className="h-5 w-5" /> : <SubtitlesOff className="h-5 w-5" />}
                </Button>
              )}
              <Button onClick={handleFullscreen} variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to parse transcript text with timestamps
function parseTranscript(transcript: string): { startTime: number; text: string }[] {
  // Simple parsing logic - in a real app, you'd have a more sophisticated parser
  // This assumes format like: "[00:15] This is text. [00:30] More text."
  const segments: { startTime: number; text: string }[] = []
  const regex = /\[(\d{2}):(\d{2})\]\s*(.*?)(?=\[\d{2}:\d{2}\]|$)/g

  let match
  while ((match = regex.exec(transcript)) !== null) {
    const minutes = Number.parseInt(match[1], 10)
    const seconds = Number.parseInt(match[2], 10)
    const startTime = minutes * 60 + seconds
    const text = match[3].trim()

    segments.push({ startTime, text })
  }

  // If no timestamps found, treat the whole transcript as one segment
  if (segments.length === 0 && transcript.trim()) {
    segments.push({ startTime: 0, text: transcript.trim() })
  }

  return segments
}
