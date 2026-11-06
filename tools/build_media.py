"""Bangun media.js: potongan lagu (data URI) untuk soundtrack rekaman video.
Website tidak memakai foto asli; boneka rajut dibuat di avatar.js.
Jalankan dari folder ultahjovi:  python tools/build_media.py"""
import base64, json, subprocess, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
clip = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, 'aset', 'ulangtahun.mp3'), '-t', '22',
                       '-af', 'afade=t=in:d=0.3,afade=t=out:st=19.5:d=2.5', '-ac', '2', '-b:a', '96k',
                       '-f', 'mp3', '-'], capture_output=True, check=True).stdout
out = {'clip': 'data:audio/mpeg;base64,' + base64.b64encode(clip).decode()}
with open(os.path.join(ROOT, 'media.js'), 'w', encoding='utf-8') as fh:
    fh.write('/* dibuat otomatis oleh tools/build_media.py */\nwindow.MEDIA=' + json.dumps(out) + ';\n')
print('media.js', os.path.getsize(os.path.join(ROOT, 'media.js')) // 1024, 'KB')
