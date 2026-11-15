import { useState } from 'react';
import { videos, wrapVideoIndex } from '../data/videos.js';

export default function FeaturedVideos() {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (videos.length === 0) return null;
  const video = videos[currentIndex];
  const move = (direction) => setCurrentIndex((current) => wrapVideoIndex(current, direction));

  return (
    <section className="videos" aria-labelledby="videos-title">
      <div className="section-heading">
        <span className="eyebrow">From BacktoBase</span>
        <h2 id="videos-title">Featured videos</h2>
      </div>
      <div className="video-carousel" role="group" aria-roledescription="carousel" aria-label="Featured videos">
        <div className="video-card">
          <div className="video-thumbnail">
            <a className="video-image" href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title} on YouTube, opens in a new tab`}>
              <img src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" />
              <span className="video-play" aria-hidden="true">▶</span>
            </a>
            <button className="carousel-arrow carousel-previous" type="button" onClick={() => move(-1)} aria-label="Previous video">‹</button>
            <button className="carousel-arrow carousel-next" type="button" onClick={() => move(1)} aria-label="Next video">›</button>
          </div>
          <div className="video-copy">
            <span className="video-title" aria-live="polite">{video.title}</span>
            <span className="video-description">Watch on YouTube</span>
          </div>
        </div>
      </div>
    </section>
  );
}
