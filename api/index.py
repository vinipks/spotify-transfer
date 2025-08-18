import os
from flask import Flask, redirect, request, session
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-me")

CLIENT_ID = os.environ["SPOTIFY_CLIENT_ID"]
CLIENT_SECRET = os.environ["SPOTIFY_CLIENT_SECRET"]
REDIRECT_URI = os.environ.get("REDIRECT_URI")

SCOPE_A = "user-library-read"
SCOPE_B = "playlist-modify-private playlist-modify-public"

def oauth_for(account_flag: str):
    key = f"token_info_{account_flag}"
    cache_handler = FlaskSessionCacheHandler(session, key=key)
    scope = SCOPE_A if account_flag == "A" else SCOPE_B
    return SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=scope,
        cache_handler=cache_handler,
        show_dialog=True
    )

@app.route("/")
def home():
    return """
    <h2>Spotify Liked Songs Transfer</h2>
    <ol>
      <li><a href="/login_a">Login with Account A</a></li>
      <li>Then <a href="/login_b">Login with Account B</a></li>
      <li>Finally <a href="/transfer">Transfer liked songs</a></li>
    </ol>
    """

@app.route("/login_a")
def login_a():
    session["auth_for"] = "A"
    return redirect(oauth_for("A").get_authorize_url())

@app.route("/login_b")
def login_b():
    session["auth_for"] = "B"
    return redirect(oauth_for("B").get_authorize_url())

@app.route("/callback")
def callback():
    auth_for = session.get("auth_for")
    if auth_for not in ("A", "B"):
        return "Invalid login flow", 400

    sp_oauth = oauth_for(auth_for)
    code = request.args.get("code")
    sp_oauth.get_access_token(code, as_dict=True)

    if auth_for == "A":
        return '<p>✅ Account A logged in! <a href="/login_b">Login Account B</a></p>'
    else:
        return '<p>✅ Account B logged in! <a href="/transfer">Transfer liked songs</a></p>'

@app.route("/transfer")
def transfer():
    if not session.get("token_info_A") or not session.get("token_info_B"):
        return '<p>Please log in: <a href="/">start over</a></p>', 400

    sp_a = spotipy.Spotify(auth_manager=oauth_for("A"))
    sp_b = spotipy.Spotify(auth_manager=oauth_for("B"))

    tracks = []
    results = sp_a.current_user_saved_tracks(limit=50)
    while True:
        for item in results.get("items", []):
            t = item.get("track")
            if t and t.get("uri"):
                tracks.append(t["uri"])
        if results.get("next"):
            results = sp_a.next(results)
        else:
            break

    if not tracks:
        return "<p>No liked songs found on Account A.</p>"

    user_b = sp_b.current_user()["id"]
    playlist = sp_b.user_playlist_create(
        user=user_b,
        name="Imported from Account A",
        public=False,
        description="Auto-imported via Vercel app"
    )

    for i in range(0, len(tracks), 100):
        sp_b.playlist_add_items(playlist["id"], tracks[i:i+100])

    return f"<p>✅ {len(tracks)} songs transferred! <a href='https://open.spotify.com/playlist/{playlist['id']}' target='_blank'>View playlist</a></p>"
