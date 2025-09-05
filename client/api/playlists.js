import axios from 'axios';

export default async function handler(req, res) {
  const accessToken = req.headers.authorization?.split('Bearer ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const playlists = response.data.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      total: playlist.tracks.total,
    }));

    res.status(200).json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
}
