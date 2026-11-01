"""Generate original, locally bundled retro sounds and a non-operational news clipping."""
from pathlib import Path
import math, random, struct, wave

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'public/files/Windows/Media'
MEDIA.mkdir(parents=True, exist_ok=True)
RATE = 22050

def sound(name, duration, notes, noise=0):
    rng = random.Random(404)
    samples = [0.0] * int(duration * RATE)
    # notes: start, duration, frequency, gain, timbre
    for start, length, hz, gain, timbre in notes:
        for i in range(int(length * RATE)):
            j = int(start * RATE) + i
            if j >= len(samples): break
            t = i / RATE
            attack = min(1, t / .035)
            release = min(1, (length-t) / .18)
            env = attack * max(0, release) * math.exp(-t / (length * .65))
            if timbre == 'bell':
                value = math.sin(math.tau*hz*t) + .30*math.sin(math.tau*hz*2.005*t)*math.exp(-t*3) + .12*math.sin(math.tau*hz*3.01*t)*math.exp(-t*5)
            elif timbre == 'square':
                value = sum(math.sin(math.tau*hz*n*t)/n for n in (1,3,5))*.7
            elif timbre == 'modem':
                value = math.sin(math.tau*(hz*t+35*math.sin(t*19))) * .6 + math.sin(math.tau*hz*1.5*t)*.25
            else:
                value = math.sin(math.tau*hz*t) + .15*math.sin(math.tau*hz*2*t)
            samples[j] += value * gain * env
    if noise:
        for i in range(len(samples)):
            t=i/RATE
            samples[i] += (rng.random()*2-1)*noise*min(1,t/.05,(duration-t)/.1)
    peak = max(max(abs(s) for s in samples), .7)
    with wave.open(str(MEDIA / name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,s/peak*.78))*32767)) for s in samples))

sound('startup.wav',3.6,[(0,3.5,261.63,.16,'pad'),(0,3.3,392,.11,'pad'),(.14,2.9,523.25,.12,'bell'),(.48,2.6,659.25,.12,'bell'),(.88,2.3,783.99,.13,'bell'),(1.26,2.2,1046.5,.10,'bell'),(1.7,1.7,523.25,.09,'pad')])
sound('shutdown.wav',2.6,[(0,1.2,783.99,.22,'bell'),(.28,1.5,659.25,.20,'bell'),(.62,1.8,523.25,.17,'pad'),(.95,1.6,261.63,.17,'pad')])
sound('open.wav',.21,[(0,.20,740,.20,'bell')])
sound('close.wav',.20,[(0,.19,440,.17,'bell')])
sound('click.wav',.07,[(0,.06,1600,.12,'square')])
sound('minimize.wav',.23,[(0,.11,880,.17,'bell'),(.08,.13,587,.16,'bell')])
sound('maximize.wav',.23,[(0,.11,587,.16,'bell'),(.08,.13,880,.17,'bell')])
sound('error.wav',.6,[(0,.2,220,.25,'square'),(.22,.34,164.8,.23,'square')])
sound('notify.wav',.65,[(0,.40,659.25,.24,'bell'),(.18,.45,880,.22,'bell')])
sound('mail.wav',1.1,[(0,.6,783.99,.20,'bell'),(.18,.6,1046.5,.19,'bell'),(.4,.65,1318.5,.12,'bell')])
sound('recycle.wav',.55,[(i*.055,.12,440+i*83,.07,'square') for i in range(7)],noise=.12)
sound('done.wav',.95,[(0,.6,523.25,.23,'bell'),(.14,.6,659.25,.21,'bell'),(.30,.62,783.99,.20,'bell')])
sound('modem.wav',3.5,[(0,.6,440,.14,'pad'),(.65,.6,1100,.12,'modem'),(1.1,.6,1650,.12,'modem'),(1.7,1.7,2100,.08,'modem')],noise=.05)
sound('pinball.wav',.13,[(0,.12,1174.7,.26,'bell')])
notes=[]
for bar in range(8):
    bass=[130.81,110,87.31,98][bar%4]
    notes.append((bar*1.5,1.4,bass,.12,'pad'))
    for beat,hz in enumerate([523.25,659.25,783.99,659.25]):
        notes.append((bar*1.5+beat*.375,.33,hz,.10,'bell'))
sound('hostel_loop.wav',12,notes)

from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
pdf=ROOT/'public/files/My Documents/9-11-attack-planning.pdf'
c=canvas.Canvas(str(pdf),pagesize=(595,842))
c.setFillColorRGB(.96,.95,.90);c.rect(0,0,595,842,fill=1,stroke=0)
c.setFillColorRGB(.12,.12,.12);c.setFont('Times-Bold',29);c.drawString(48,780,'THE WORLD / 11 SEPTEMBER 2001')
c.setFont('Courier',10);c.drawString(48,754,'ROHAN\'S CLASS CLIPPINGS - SAVED OCTOBER 2001')
c.line(48,740,547,740)
c.drawImage(ImageReader(str(ROOT/'public/files/My Documents/news_clipping_2001.jpg')),48,328,width=499,height=374,preserveAspectRatio=True,anchor='c')
c.setFont('Times-Bold',20);c.drawString(48,294,'A day that changed the world')
c.setFont('Times-Roman',12)
lines=['On 11 September 2001, terrorist attacks in the United States struck',
       'New York City and the Pentagon. The World Trade Center towers collapsed.',
       'This clipping preserves a historical photograph for a classroom archive.',
       '', 'Rohan\'s note: We watched the news together in the hostel common room.',
       'For once, nobody argued about which channel to put on.', '',
       'Archive filename copied from the hackathon reference; contents are',
       'historical context and a fictional student note.']
for i,line in enumerate(lines): c.drawString(48,268-i*20,line)
c.setFont('Courier',9);c.drawString(48,56,'REFERENCE IMAGE: USER-SUPPLIED GANDHI HACKATHON PDF, PAGE 4')
c.save()
import fitz
d=fitz.open(pdf);d[0].get_pixmap(matrix=fitz.Matrix(1,1)).save(str(pdf.with_suffix('.png')))
print('Generated 15 original WAV assets, historical PDF, and its local preview.')
