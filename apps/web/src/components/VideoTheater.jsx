/**
 * Shared theater-style modal for playing a video (YouTube / Vimeo / MP4).
 * Used by Reel page, Homepage reel section, Case study related videos.
 */
import { youtubeEmbedSrc, vimeoEmbedSrc } from '../lib/videoEmbed.js'

export default function VideoTheater({ video, onClose }) {
  if (!video) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 grid place-items-center p-6" onClick={onClose}>
      <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="text-ink-mute hover:text-saffron text-sm tracking-[.2em] uppercase mb-4">Close ×</button>
        <div className="aspect-video bg-black border border-line">
          {video.youtubeId
            ? <iframe className="w-full h-full" src={youtubeEmbedSrc(video.youtubeId)} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            : video.vimeoId
              ? <iframe className="w-full h-full" src={vimeoEmbedSrc(video.vimeoId)} title={video.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              : video.mp4Url
                ? <video className="w-full h-full" src={video.mp4Url} controls autoPlay />
                : <div className="grid place-items-center h-full text-ink-mute">No playable source</div>}
        </div>
        <div className="mt-4">
          <h2 className="font-display text-3xl">{video.title}</h2>
          <span className="label-tag">{video.category}{video.year ? ` · ${video.year}` : ''}{video.client ? ` · ${video.client}` : ''}</span>
        </div>
      </div>
    </div>
  )
}
