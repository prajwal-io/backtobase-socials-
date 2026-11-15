// Add published YouTube links here; their real thumbnails come from YouTube.
export const videos = [
  { title: 'BacktoBase community highlight 1', url: 'https://youtu.be/m2dGP0BzTVo', videoId: 'm2dGP0BzTVo' },
  { title: 'BacktoBase community highlight 2', url: 'https://youtu.be/JjyS3d6sttQ', videoId: 'JjyS3d6sttQ' },
  { title: 'BacktoBase community highlight 3', url: 'https://youtu.be/UvLzX8XCinM', videoId: 'UvLzX8XCinM' },
];

export function wrapVideoIndex(index, direction, count = videos.length) {
  return (index + direction + count) % count;
}
