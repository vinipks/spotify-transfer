import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = process.env.REDIRECT_URI;

  const tokenRes = await axios.post('https://accounts.spotify.com/api/token', null, {
    params: {
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id,
      client_secret,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const { access_token, refresh_token } = tokenRes.data;

  // For now, just show the token in browser (later we’ll store it securely)
  res.status(200).send(`Access Token: ${access_token}`);
}
