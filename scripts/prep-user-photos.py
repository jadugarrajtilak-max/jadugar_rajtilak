#!/usr/bin/env python3
"""Prepare the client's 5 real photos as static site assets.
- um6 (LG certificate, 305x404) and um1 (stage confetti, 481x472) are low-res
  -> 2x Lanczos upscale + unsharp mask (crisper at gallery render sizes).
- All outputs converted to webp, optimized for the web.
"""
import os
from PIL import Image, ImageFilter, ImageEnhance

SRC = "/home/z/my-project/scripts/img/usermedia"
OUT = "/home/z/my-project/public/images"

# target file name -> (source, upscale 2x?)
PLAN = {
    "rajtilak-stage-confetti.webp": ("um1-bm2rcd.webp", True),    # 481x472
    "rajtilak-mic-closeup.webp": ("um2-uqnban.webp", False),      # 1024x1536
    "rajtilak-umbrella-act.webp": ("um4-00o67p.webp", False),     # 612x918
    "rajtilak-felicitation-hug.webp": ("um5-pggmw1.webp", False), # 1136x1384
    "rajtilak-lg-certificate.webp": ("um6-v3csrp.webp", True),    # 305x404
}

for out_name, (src_name, upscale) in PLAN.items():
    im = Image.open(os.path.join(SRC, src_name)).convert("RGB")
    if upscale:
        w, h = im.size
        im = im.resize((w * 2, h * 2), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=110, threshold=2))
        im = ImageEnhance.Contrast(im).enhance(1.04)
    dst = os.path.join(OUT, out_name)
    im.save(dst, "WEBP", quality=88, method=6)
    print(f"{out_name}: {im.size[0]}x{im.size[1]}  {os.path.getsize(dst)//1024}KB")
print("done")
