import numpy as np
from flask_cors import CORS
from flask import Flask, request
import json
import base64
from PIL import Image
from io import BytesIO

app = Flask(__name__)
CORS(app)
@app.route("/encode", methods=['POST'])
def encode():
    inp = Image.open(BytesIO(base64.b64decode(request.form["image"])))
    return {"latent": list(np.random.random(size=(50)))}


@app.route("/predict", methods=['POST'])
def decode():
    #image = Image.open(BytesIO(base64.b64decode(request.form["image"])))
    fontA = request.form["fontA"]
    fontB = request.form["fontB"]
    print("FONTS", fontA, fontB)
    coef = json.loads(request.form["coefficients"])
    if fontA == "opensans/300":
        ttf = open("Roboto-Light.ttf", "rb").read()
    else:
        ttf = open("Roboto-BoldItalic.ttf", "rb").read()
    return {
        "path": "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z",
        "ttf": b"data:font/ttf;base64,"+base64.b64encode(ttf)
    }
