import * as THREE from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {buildZulmira} from './model.js';

const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
if(new URLSearchParams(location.search).has('embed'))document.body.classList.add('embed');
const photoLabels={dormitorio:'Dormitorio · Fotografía real',estar:'Estar · Fotografía real',barra:'Barra · Fotografía real',bano:'Baño · Fotografía real'};
all('[data-photo]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.photo;$('#large-photo').src=`./assets/${key}.jpg`;$('#large-photo').alt=photoLabels[key];$('#photo-caption').textContent=photoLabels[key];$('#photo-dialog').showModal();}));
$('#help').onclick=()=>$('#help-dialog').showModal();
all('dialog').forEach(d=>{d.querySelector('.dialog-close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});

try{
  const viewport=$('#viewport'),scene=new THREE.Scene();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);viewport.appendChild(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(36,1,.04,80);camera.position.set(-7.2,8.0,10.0);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.7,.65);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=1.35;controls.maxDistance=23;controls.maxPolarAngle=Math.PI*.485;controls.minPolarAngle=.018;controls.rotateSpeed=.62;controls.panSpeed=.65;controls.zoomSpeed=.8;controls.autoRotateSpeed=.7;controls.maxTargetRadius=7;controls.cursor.set(0,.7,.8);
  scene.add(new THREE.HemisphereLight(0xe8f3ff,0x8c7457,2.45));
  const sun=new THREE.DirectionalLight(0xfff3dc,3.5);sun.position.set(-4,9,-3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.camera.near=.1;sun.shadow.camera.far=24;sun.shadow.normalBias=.02;sun.shadow.bias=-.00008;sun.shadow.radius=4;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xd6e7f6,1.5);fill.position.set(5,5,6);scene.add(fill);
  const {root,roof,walls}=buildZulmira();scene.add(root);roof.visible=false;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.15}));ground.rotation.x=-Math.PI/2;ground.position.y=-.235;ground.receiveShadow=true;scene.add(ground);
  // Broad soft grounding shadow beneath the model, independent of light direction.
  const sc=document.createElement('canvas');sc.width=sc.height=128;const ctx=sc.getContext('2d');const gr=ctx.createRadialGradient(64,64,3,64,64,64);gr.addColorStop(0,'rgba(32,49,61,.22)');gr.addColorStop(.5,'rgba(32,49,61,.12)');gr.addColorStop(1,'rgba(32,49,61,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,128,128);const sm=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false});const shade=new THREE.Mesh(new THREE.PlaneGeometry(7.4,10.8),sm);shade.rotation.x=-Math.PI/2;shade.position.set(0,-.23,.7);scene.add(shade);
  let cutaway=true,currentView='general',transition=null,lastFrame=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const presets={
    general:{position:[-7.2,8.0,10.0],target:[0,.7,.65],label:'Vista general'},
    bed:{position:[-3.5,3.65,1.15],target:[0,.74,-1.65],label:'Dormitorio'},
    living:{position:[4.6,4.7,4.7],target:[-.3,.69,.90],label:'Estar y barra'},
    bath:{position:[-1.6,4.3,6.65],target:[.88,.94,3.77],label:'Baño'},
    top:{position:[0,12.5,.81],target:[0,0,.80],label:'Vista desde arriba'}
  };
  function generalPosition(p){const a=p.slice();if(viewport.clientWidth/viewport.clientHeight<.78){a[0]*=1.2;a[1]*=1.2;a[2]*=1.2;}return a;}
  function setView(key,animate=true){
    const p=presets[key];if(!p)return;currentView=key;const position=key==='general'?generalPosition(p.position):p.position;
    if(key!=='general'&&roof.visible){roof.visible=false;$('#roof').setAttribute('aria-pressed','false');$('#roof').classList.remove('on');$('#roof').textContent='Mostrar techo';}
    if(key==='top'&&!cutaway)toggleWalls(true);
    controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').setAttribute('aria-label','Activar giro automático');
    transition={from:camera.position.clone(),to:new THREE.Vector3(...position),targetFrom:controls.target.clone(),targetTo:new THREE.Vector3(...p.target),start:performance.now(),duration:animate&&!reduced?700:1};
    $('#view-label').textContent=p.label;
    all('[data-view]').forEach(b=>{const on=b.dataset.view===key;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  }
  function toggleWalls(force){cutaway=typeof force==='boolean'?force:!cutaway;$('#walls').setAttribute('aria-pressed',String(cutaway));$('#walls').classList.toggle('on',cutaway);$('#walls').textContent=cutaway?'Paredes abiertas':'Paredes completas';}
  function cutWalls(){
    if(!cutaway){Object.values(walls).forEach(g=>g.visible=true);return;}
    const above=camera.position.y>8&&Math.hypot(camera.position.x-controls.target.x,camera.position.z-controls.target.z)<.8;
    walls.west.visible=above||camera.position.x>-.4;
    walls.east.visible=above||camera.position.x<.4;
    walls.north.visible=above||camera.position.z>-1.9;
    walls.south.visible=!above&&camera.position.z<2.15;
    walls.bathWest.visible=above||camera.position.x>.8;
    walls.bathEast.visible=above||camera.position.x<1.2;
    walls.bathSouth.visible=above||camera.position.z<3.8;
    // From overhead the divider is omitted to keep the small bathroom readable.
  }
  all('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
  $('#walls').onclick=()=>toggleWalls();
  $('#roof').onclick=()=>{roof.visible=!roof.visible;$('#roof').setAttribute('aria-pressed',String(roof.visible));$('#roof').classList.toggle('on',roof.visible);$('#roof').textContent=roof.visible?'Ocultar techo':'Mostrar techo';};
  $('#rotate').onclick=()=>{transition=null;controls.autoRotate=!controls.autoRotate;$('#rotate').setAttribute('aria-pressed',String(controls.autoRotate));$('#rotate').setAttribute('aria-label',controls.autoRotate?'Pausar giro automático':'Activar giro automático');};
  function zoom(f){transition=null;const v=camera.position.clone().sub(controls.target);v.setLength(THREE.MathUtils.clamp(v.length()*f,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(v);controls.update();}
  $('#zoom-in').onclick=()=>zoom(.82);$('#zoom-out').onclick=()=>zoom(1.22);
  $('#reset').onclick=()=>{toggleWalls(true);roof.visible=false;$('#roof').setAttribute('aria-pressed','false');$('#roof').classList.remove('on');$('#roof').textContent='Mostrar techo';setView('general');};
  $('#top').onclick=()=>setView('top');
  const stage=$('.stage');$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.requestFullscreen)await stage.requestFullscreen();else stage.classList.toggle('fullscreen-fallback');}catch{stage.classList.toggle('fullscreen-fallback');}};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')stage.classList.remove('fullscreen-fallback');});
  controls.addEventListener('start',()=>{transition=null;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').setAttribute('aria-label','Activar giro automático');});
  viewport.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))return;e.preventDefault();transition=null;
    if(e.key==='Home')setView('general');else if(['+','ArrowUp'].includes(e.key))zoom(.9);else if(['-','ArrowDown'].includes(e.key))zoom(1.1);else{const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?.13:-.13);camera.position.copy(controls.target).add(v);controls.update();}
  });
  const resize=()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};new ResizeObserver(resize).observe(viewport);resize();setView('general',false);
  renderer.setAnimationLoop(now=>{
    if(document.hidden)return;
    const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):1/60;lastFrame=now;
    if(transition){const t=Math.min((now-transition.start)/transition.duration,1),q=1-Math.pow(1-t,3);camera.position.lerpVectors(transition.from,transition.to,q);controls.target.lerpVectors(transition.targetFrom,transition.targetTo,q);if(t===1)transition=null;}
    controls.update(dt);cutWalls();renderer.render(scene,camera);
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#error').hidden=false;});
  $('#loading').hidden=true;
  // Useful for inspection without retaining guest data or requiring a server.
  window.zulmiraViewer={setView,reset:()=>$('#reset').click(),getState:()=>({view:currentView,roof:roof.visible,cutaway})};
}catch(err){console.error('No se pudo iniciar Zulmira 3D:',err);$('#loading').hidden=true;$('#error').hidden=false;}
