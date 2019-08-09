import numpy as np
from flask_cors import CORS
from flask import Flask, request
import json
import base64
from io import BytesIO
import pickle as pk
from fastai.text import *
from fastai.vision import *
import torch.nn as nn
from torchvision import transforms
import torch
from PIL import Image
import PIL.ImageOps

class UpBlock(nn.Module):
    def __init__(self, up_in_c:int,final_div:bool=True, blur:bool=False, leaky:float=None,self_attention:bool=False, **kwargs):
        super().__init__()
        self.shuf = PixelShuffle_ICNR(up_in_c, up_in_c//2, blur=blur, leaky=leaky, **kwargs)
        ni = up_in_c//2
        nf = ni if final_div else ni//2
        self.conv1 = conv_layer(ni, nf, leaky=leaky, **kwargs)
        self.conv2 = conv_layer(nf, nf, leaky=leaky, self_attention=self_attention, **kwargs)
        self.relu = relu(leaky=leaky)

    def forward(self, up_in:Tensor) -> Tensor:
        up_out = self.shuf(up_in)
        return self.conv2(self.conv1(up_out))
    
class VAE(nn.Module):
    def __init__(self):
        super().__init__()
        self.emb = nn.Embedding(62,16)
        self.encoder = nn.Sequential(
            conv2d(1,32,5,1,2),
            nn.InstanceNorm2d(32,affine=True),
            nn.ReLU(),
            conv2d(32,32,5,2,2),
            nn.InstanceNorm2d(32,affine=True),
            nn.ReLU(),
            conv2d(32,64,5,1,2),
            nn.InstanceNorm2d(64,affine=True),
            nn.ReLU(),
            conv2d(64,64,5,2,2),
            nn.InstanceNorm2d(64,affine=True),
            nn.ReLU(),
            conv2d(64,64,3,2,1),
            nn.InstanceNorm2d(64,affine=True),
            nn.ReLU(),
            conv2d(64,64,3,2,1),
            nn.InstanceNorm2d(64,affine=True),
            nn.ReLU())
        
        self.z_mean = nn.Linear(64*16,32)
        self.z_logvar = nn.Linear(64*16,32)
        
        self.z_to_dec = nn.Linear(32+16,128*16)
        
        nf = [128,64,32,16]
        #nf = [2048,1024,512,256,128]
        self.decoder = nn.Sequential(*[UpBlock(f, blur=(False if f != 32 else False)) for f in nf])
        self.final_conv = conv_layer(8, 1, ks=1, use_activ=False)
    
    def forward(self,x,char_class):
        u = self.encoder(x)
        u = u.view(x.shape[0],-1)
        mean, logvar = self.z_mean(u), self.z_logvar(u)
        
        std = torch.exp(0.5*logvar)
        eps = torch.randn_like(std)
        z = mean
        #if self.training:
        z = z + eps*std
            
        z = torch.cat([z,self.emb(char_class)],dim=1)
        ls = z
        
        z = self.z_to_dec(z)
        z = z.view(x.shape[0],128,4,4)
        
        return torch.sigmoid(self.final_conv(self.decoder(z))), mean, logvar, ls

model = VAE()
model.load_state_dict(pk.load(open('state_dict.pk', 'rb')))
c2i = pk.load(open('class2index.pk', 'rb'))
trans = transforms.ToTensor()
model = model.cpu().eval()


def interpolate_z(f1_res, f2_res, alpha):
    z1 = model.z_to_dec(f1_res[3][0].expand(48)).view(1,128,4,4)
    z2 = model.z_to_dec(f2_res[3][0].expand(48)).view(1,128,4,4)
    
    new = z2 * alpha + z1*(1-alpha)
    res = torch.sigmoid(model.final_conv(model.decoder(new)))
    return res


def font_interpolator(font1_images, font2_images):
    res = []
    alphas = np.linspace(0, 1, 15)
    for (img1, y1), (img2, y2) in zip(font1_images, font2_images):
        temp = []
        
        f1_res = model(trans(img1.convert('L')).unsqueeze(0), torch.from_numpy(np.array([c2i[y1]])))
        f2_res = model(trans(img2.convert('L')).unsqueeze(0), torch.from_numpy(np.array([c2i[y2]])))
        
        temp.append(f1_res[0][0].permute(1,2,0).squeeze())
        
        for alpha in alphas:
            inter = interpolate_z(f1_res, f2_res, alpha)
            temp.append(inter[0].permute(1,2,0).squeeze())
            #temp.append(inter.permute(1,2,0).squeeze())
        
        temp.append(f2_res[0][0].permute(1,2,0).squeeze())
        
        res.append(temp)
    return res


app = Flask(__name__)
CORS(app)
@app.route("/encode", methods=['POST'])
def encode():
    inp = Image.open(BytesIO(base64.b64decode(request.form["image"])))
    return {"latent": list(np.random.random(size=(50)))}


@app.route("/predict", methods=['POST'])
def predict():
    print("YO", Image)
    #image = Image.open(BytesIO(base64.b64decode(request.form["image"])))
    # "ttf": b"data:font/ttf;base64,"+base64.b64encode(ttf)
    fonts = json.loads(request.form["fonts"])
    imagesAL = []
    print("HELLOP", fonts)
    for char in fonts[0]["chars"]:
        print("data/"+fonts[0]["name"].replace("regular", "400")+"/png/"+char+".png")
        imagesAL.append([Image.open("data/"+fonts[0]["name"].replace("regular", "400")+"/png/"+char+".png"), char])
    imagesBL = []
    for char in fonts[1]["chars"]:
        print("data/"+fonts[0]["name"].replace("regular", "400")+"/png/"+char+".png")
        imagesBL.append([Image.open("data/"+fonts[1]["name"].replace("regular", "400")+"/png/"+char+".png"), char])
    
    """
    for i,img in enumerate(fonts[0]["images"]):
        imagesAL.append([Image.open(BytesIO(base64.b64decode(img.split(",")[-1]))), fonts[0]["chars"][i]])
    imagesBL = []
    for i,img in enumerate(fonts[1]["images"]):
        imagesBL.append([Image.open(BytesIO(base64.b64decode(img.split(",")[-1]))), fonts[1]["chars"][i]])
    """   
    #import matplotlib.pyplot as plt
    #plt.imshow(imagesAL[0][0])
    result = font_interpolator(imagesAL, imagesBL)
    
    images = []
    for i, imgs in enumerate(result):
        inner = []
        for j, img in enumerate(imgs):
            pil = transforms.ToPILImage()(img).convert("L")
            buffered = BytesIO()
            pil.save(buffered, format="png")
            img_str = base64.b64encode(buffered.getvalue())
            inner.append(b"data:image/png;base64,"+img_str)
        images.append(inner)
    images = list(map(list, zip(*images)))
                        
    coef = json.loads(request.form["coefficients"])

    return {
        "path": "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z",
        "images": images
    }
