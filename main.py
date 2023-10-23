import http.client
import json
from urllib.parse import quote
import sys

base_url = 'musicapi.x007.workers.dev'

def play_audio(song_id):
    connection = http.client.HTTPSConnection(base_url)
    fetch_url = f'/fetch?id={song_id}'
    try:
        connection.request('GET', fetch_url)
        response = connection.getresponse()
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))
            stream_url = data['response']
            print(f"Stream URL: {stream_url}")
        else:
            print(f"Failed to fetch audio: {response.status}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if len(sys.argv) == 2:
    song_name = sys.argv[1]
    search_engine = 'gaama'
    search_url = f'/search?q={quote(song_name)}&searchEngine={search_engine}'
    connection = http.client.HTTPSConnection(base_url)
    connection.request('GET', search_url)
    response = connection.getresponse()
    if response.status == 200:
        data = json.loads(response.read().decode('utf-8'))
        songs = data['response']
        if songs:
            first_song = songs[0]
            song_id = first_song['id']
            play_audio(song_id)
        else:
            print("No songs found.")
    else:
        print(f"Failed to search for songs: {response.status}")
