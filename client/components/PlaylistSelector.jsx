import React from 'react';

function PlaylistSelector({ playlists, selected, onSelect }) {
  return (
    <div>
      <h3>Select Source Playlists</h3>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(playlist.id)}
                onChange={() => onSelect(playlist.id)}
              />
              {playlist.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlaylistSelector;
