from flask import Flask
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

detectives = [
        {
            "name": "Watson",
            "image": "https://firebasestorage.googleapis.com/v0/b/who-done-it-298503.appspot.com/o/clouseau.jpeg?alt=media",
            "score": 0
        },
        {
            "name": "Nancy Drew",
            "image": "https://firebasestorage.googleapis.com/v0/b/who-done-it-298503.appspot.com/o/nancy.png?alt=media",
            "score": 0
        },
        {
            "name": "Detective Clouseau",
            "image": "https://firebasestorage.googleapis.com/v0/b/who-done-it-298503.appspot.com/o/clouseau.jpeg?alt=media",
            "score": 0
        },
        {
            "name": "Velma Dinkley",
            "image": "https://firebasestorage.googleapis.com/v0/b/who-done-it-298503.appspot.com/o/velma.jpeg?alt=media",
            "score": 0
        }
    ]

def get_scores(user_image, detective_image):
    r = requests.post(
        "https://api.deepai.org/api/image-similarity",
        data={
            'image1': 'https://firebasestorage.googleapis.com/v0/b/who-done-it-298503.appspot.com/o/' + user_image + '?alt=media',
            'image2': detective_image,
        },
        headers={'api-key': os.getenv("DEEPAI_API")}
    )
    return r.json()['output']['distance']

def get_most_similar(user_image):
    global detectives
    for detective in detectives:
        score = get_scores(user_image, detective['image'])
        detective['score'] = score

    detectives = sorted(detectives, key=lambda i: i['score'])
    most_similar = detectives[0]
    print(most_similar)
    return most_similar

@app.route('/most-similar/<image>')
def print_most_similar(image):
    most_similar = get_most_similar(image)
    return most_similar['name']

if __name__ == '__main__':
   app.run()