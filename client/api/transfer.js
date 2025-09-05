import axios from 'axios';

export default async function handler(req, res) {
  const accessToken = req.headers.authorization?.split('Bearer ')[1];
  const { playlistIds } = req.body;

  if (!accessToken || !playlistIds || !Array.isArray(playlistIds)) {
    return res.status(400).json({ error: 'Missing access token or playlist IDs' });
  }

  try {
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Get current user's ID
    const userRes = await axios.get('https://api.spotify.com/v1/me', { headers });
    const userId = userRes.data.id;

    for (const playlistId of playlistIds) {
      // Get original playlist details
      const originalRes = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, { headers });
      const originalName = originalRes.data.name;

      // Get tracks in order
      const tracksRes = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers,
        params: { fields: 'items(track(uri))', limit: 100 },
      });

      const trackUris = tracksRes.data.items
        .map((item) => item.track?.uri)
        .filter(Boolean);

      // Create new playlist
      const newRes = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        { name: `Imported – ${originalName}`, public: false },
        { headers }
      );

      const newPlaylistId = newRes.data.id;

      // Add tracks in order (in batches of 100 max)
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        await axios.post(
          `https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`,
          { uris: batch },
          { headers }
        );
      }
    }

    res.status(200).json({ status: 'Playlists transferred successfully' });
  } catch (error) {
    console.error('Transfer error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Transfer failed' });
  }
}
