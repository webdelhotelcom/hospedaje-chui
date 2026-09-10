import * as THREE from './vendor/three.module.js';

function random(seed=73){return()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};}
function surface(w,h,paint){
  const canvas=globalThis.document?document.createElement('canvas'):new globalThis.OffscreenCanvas(w,h);
  canvas.width=w;canvas.height=h;paint(canvas.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
export function createTextures(){
  const pine=surface(1024,256,(c,w,h)=>{
    const r=random(192),g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bb702f');g.addColorStop(.22,'#dba04f');g.addColorStop(.7,'#c3863d');g.addColorStop(1,'#a76027');c.fillStyle=g;c.fillRect(0,0,w,h);
    for(let n=0;n<260;n++){let y=r()*h;c.beginPath();for(let x=0;x<=w;x+=8){const wave=Math.sin(x*.008+n*.64)*2.2+Math.sin(x*.026+n)*.65;const yy=y+wave;if(x===0)c.moveTo(x,yy);else c.lineTo(x,yy);}c.strokeStyle=`rgba(${r()>.2?'85,43,17':'255,220,151'},${.08+r()*.3})`;c.lineWidth=.4+r()*.9;c.stroke();}
    for(let k=0;k<5;k++){const x=80+r()*860,y=35+r()*190;c.save();c.translate(x,y);c.rotate((r()-.5)*.12);for(let j=7;j>0;j--){c.beginPath();c.ellipse(0,0,j*5.5,j*1.2,0,0,Math.PI*2);c.strokeStyle=`rgba(75,37,17,${.13+(8-j)*.03})`;c.lineWidth=.8;c.stroke();}c.beginPath();c.ellipse(0,0,9,2.8,0,0,Math.PI*2);c.fillStyle='#4e2c19';c.fill();c.restore();}
  });
  const fabric=(base,seed)=>surface(256,256,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);const r=random(seed);for(let i=0;i<12000;i++){c.fillStyle=`rgba(${r()>.5?'255,255,255':'20,20,20'},${r()*.11})`;c.fillRect(r()*w,r()*h,1,1);}for(let i=0;i<w;i+=3){c.fillStyle='rgba(255,255,255,.035)';c.fillRect(i,0,1,h);c.fillRect(0,i,w,1);}});
  const floral=surface(512,512,(c,w,h)=>{
    c.fillStyle='#dadbd1';c.fillRect(0,0,w,h);const r=random(55);
    for(let i=0;i<35;i++){const x=r()*w,y=r()*h;c.strokeStyle='#7a927f';c.lineWidth=1.8;c.beginPath();c.moveTo(x,y+45);c.bezierCurveTo(x-20,y+15,x+18,y+5,x,y-23);c.stroke();for(let side of [-1,1]){c.save();c.translate(x,y+16);c.rotate(side*.75);c.beginPath();c.ellipse(0,0,4,15,0,0,Math.PI*2);c.fillStyle='#a4b69b';c.fill();c.restore();}for(let j=0;j<6;j++){c.save();c.translate(x,y);c.rotate(j*Math.PI/3);c.beginPath();c.ellipse(0,-8,5,11,0,0,Math.PI*2);c.fillStyle=j%2?'#db9c9b':'#c8767c';c.fill();c.restore();}c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fillStyle='#f1d9ad';c.fill();}
  });
  const tiles=surface(512,512,(c,w,h)=>{
    c.fillStyle='#edece6';c.fillRect(0,0,w,h);c.strokeStyle='#c0beb5';c.lineWidth=2;c.strokeRect(1,1,w-2,h-2);
    for(let row=0;row<2;row++){let y=140+row*235;c.strokeStyle='#747879';c.lineWidth=2;
      for(let q=0;q<2;q++){c.beginPath();c.moveTo(-20,y+q*14);c.bezierCurveTo(90,y-80+q*14,150,y+80+q*14,280,y+q*14);c.bezierCurveTo(370,y-60+q*14,430,y+60+q*14,530,y+q*14);c.stroke();}
      for(let x=75;x<512;x+=180){for(let j=0;j<4;j++){c.save();c.translate(x,y);c.rotate(Math.PI/2*j+.5);c.beginPath();c.ellipse(0,-15,9,15,0,0,Math.PI*2);c.stroke();c.restore();}c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.stroke();}
      for(let x=165;x<500;x+=180){c.beginPath();for(let a=0;a<Math.PI*4;a+=.15){const rr=2+a*2.2,xx=x+Math.cos(a)*rr,yy=y+25+Math.sin(a)*rr;if(a===0)c.moveTo(xx,yy);else c.lineTo(xx,yy);}c.stroke();}
    }
  });
  const quilt=surface(512,512,(c,w,h)=>{
    c.fillStyle='#ded8c5';c.fillRect(0,0,w,h);let r=random(97);for(let i=0;i<19000;i++){c.fillStyle=`rgba(${r()>.5?'255,255,255':'114,104,81'},.085)`;c.fillRect(r()*w,r()*h,1,2);}
    c.strokeStyle='rgba(148,138,115,.25)';c.lineWidth=1.2;for(let i=-512;i<1024;i+=128){c.beginPath();c.moveTo(i,0);c.lineTo(i+512,512);c.stroke();c.beginPath();c.moveTo(i,0);c.lineTo(i-512,512);c.stroke();}
    c.strokeStyle='rgba(255,252,232,.4)';for(let i=0;i<24;i++){let x=r()*w,y=r()*h;c.beginPath();c.ellipse(x,y,9,21,r()*6,0,Math.PI*2);c.stroke();}
  });
  const tv=surface(512,288,(c,w,h)=>{
    c.fillStyle='#a9c6d6';c.fillRect(0,0,w,h);c.fillStyle='#233a49';c.fillRect(0,45,w,77);let r=random(11);for(let i=0;i<2000;i++){c.fillStyle=['#b5b6b9','#dcdfdc','#495c70','#a46461'][i%4];c.fillRect(r()*w,52+r()*60,2,2);}c.fillStyle='#47834e';c.fillRect(0,125,w,163);for(let i=0;i<8;i++){if(i%2===0){c.fillStyle='#548f58';c.fillRect(i*64,125,64,163);}}c.strokeStyle='#d9e2cc';c.lineWidth=2;c.strokeRect(20,146,470,130);c.beginPath();c.moveTo(256,146);c.lineTo(256,276);c.stroke();c.beginPath();c.ellipse(256,210,45,37,0,0,Math.PI*2);c.stroke();for(let i=0;i<16;i++){c.fillStyle=i%2?'#e7e9ec':'#344789';c.fillRect(40+r()*420,157+r()*96,4,8);}c.fillStyle='#173240';c.fillRect(14,14,132,20);c.fillStyle='#e1eeee';c.font='13px sans-serif';c.fillText('FÚTBOL   1  –  0',23,29);
  });
  const rug=surface(256,256,(c,w,h)=>{for(let y=0;y<h;y+=6){c.fillStyle=['#60424b','#ad9a88','#3e424f','#bab2a0','#80656f'][Math.floor(y/6)%5];c.fillRect(0,y,w,6);}c.fillStyle='rgba(255,255,255,.1)';for(let x=0;x<w;x+=3)c.fillRect(x,0,1,h);});
  return {pine,floral,tiles,quilt,tv,rug,sofa:fabric('#797e82',21),pillow:fabric('#323538',22),towel:fabric('#caa888',23)};
}
