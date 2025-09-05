import React, { useState } from 'react';
import PlaylistSelector from './components/PlaylistSelector';
import PlaylistPreview from './components/PlaylistPreview';
import TransferButton from './components/TransferButton';

function App() {
  const [playlists, setPlaylists] = useState([
    { id: '1', name: 'Feid Vibes' },
    { id: '2', name: 'Yandel Essentials' },
    { id: '3', name: 'Emoji Energy' }
  ]);

  const [selected, setSelected] = useState([]);
  const [previewData, setPreviewData] = useState({});

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleTransfer = () => {
    // Placeholder for backend call
    alert('Transfer initiated for: ' + selected.join(', '));
  };

  const fetchPreview = () => {
    // Simulated preview data
    const mockTracks = Array.from({ length: 30 }, (_, i) => ({
      name: `Track ${i + 1}`,
      artist: 'Feid'
    }));

    const previews = {};
    selected.forEach((id) => {
      const playlist = playlists.find((p) => p.id === id);
      previews[id] = { name: playlist.name, tracks: mockTracks };
    });

    setPreviewData(previews);
  };

  return (
    <div className="container">
      <h1>🎧 Spotify Playlist Manager</h1>
      <PlaylistSelector
        playlists={playlists}
        selected={selected}
        onSelect={handleSelect}
      />
      <button onClick={fetchPreview}>Preview Selected</button>

      {Object.entries(previewData).map(([id, data]) => (
        <PlaylistPreview
          key={id}
          playlistName={data.name}
          tracks={data.tracks}
        />
      ))}

      <TransferButton onTransfer={handleTransfer} disabled={selected.length === 0} />
    </div>
  );
}

export default App;
