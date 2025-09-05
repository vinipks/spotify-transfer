import React from 'react';

function PlaylistPreview({ playlistName, tracks }) {
  const previewTracks = tracks.slice(0, 20);

  return (
    <div>
      <h4>{playlistName} (Preview)</h4>
      <ol>
        {previewTracks.map((track, index) => (
          <li key={index}>
            {track.name} – {track.artist}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default PlaylistPreview;
