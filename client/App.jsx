import React, { useState, useEffect } from 'react';
import PlaylistSelector from './components/PlaylistSelector';
import PlaylistPreview from './components/PlaylistPreview';
import TransferButton from './components/TransferButton';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [selected, setSelected] = useState([]);
  const [previewData, setPreviewData] = useState({});
  const [accessToken, setAccessToken] = useState('');

  // Extract token from URL after Spotify login
  useEffect(() => {
    const tokenFromURL = new URLSearchParams(window.location.search).get('token');
    if (tokenFromURL) {
      setAccessToken(tokenFromURL);
      fetchPlaylists(tokenFromURL);
    }
  }, []);

  // Fetch user's playlists from Spotify
  const fetchPlaylists = async (token) => {
    try {
      const res = await fetch('/api/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPlaylists(data.playlists);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    }
  };

  // Handle playlist selection toggle
  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Preview first 20 songs from each selected playlist
  const fetchPreview = async () => {
    const previews = {};

    for (const id of selected) {
      try {
        const res = await fetch(`/api/playlist-tracks?id=${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        previews[id] = {
          name: playlists.find((p) => p.id === id)?.name || 'Untitled',
          tracks: data.tracks.slice(0, 20),
        };
      } catch (err) {
        console.error(`Failed to fetch tracks for playlist ${id}:`, err);
      }
    }

    setPreviewData(previews);
  };

  // Trigger transfer (placeholder)
  const handleTransfer = async () => {
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ playlistIds: selected }),
      });

      const result = await res.json();
      alert(`Transfer complete: ${result.status}`);
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  return (
    <div className="container">
      <h1>🎧 Spotify Playlist Manager</h1>

      {!accessToken ? (
        <a href="/api/login">
          <button>🔐 Connect to Spotify</button>
        </a>
      ) : (
        <>
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

          <TransferButton
            onTransfer={handleTransfer}
            disabled={selected.length === 0}
          />
        </>
      )}
    </div>
  );
}

export default App;
