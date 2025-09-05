import axios from 'axios';

export default async function handler(req, res) {
  const playlistId = req.query.id;
  const accessToken = req.headers.authorization?.split('Bearer ')[1];

  if (!accessToken || !playlistId) {
    return res.status(400).json({ error: 'Missing access token or playlist ID' });
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: 'items(track(name,artists(name)))',
        limit: 50, // You can increase this if needed
      },
    });

    const tracks = response.data.items.map((item) => ({
      name: item.track.name,
      artist: item.track.artists.map((a) => a.name).join(', '),
    }));

    res.status(200).
