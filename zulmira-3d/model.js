import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {createTextures} from './textures.js';

// Metres are estimated from the photographs. No measured survey was supplied.
export const DIMENSIONS={width:3.4,length:5.6,height:2.65,bathWidth:1.55,bathDepth:1.65};
export function buildZulmira(){
  const tex=createTextures(),root=new T.Group();root.name='Zulmira — interior aproximado';
  root.userData={description:'Recreación manual a partir de 16 fotografías. Dimensiones y zonas ocultas estimadas.',units:'metres',measured:false};
  const mats={
    wood:new T.MeshStandardMaterial({map:tex.pine,color:0xffffff,roughness:.55}),
    trim:new T.MeshStandardMaterial({map:tex.pine,color:0x99642f,roughness:.46}),
    lightWood:new T.MeshStandardMaterial({map:tex.pine,color:0xe4c491,roughness:.6}),
    black:new T.MeshStandardMaterial({color:0x1a1c1c,roughness:.45}),
    metal:new T.MeshStandardMaterial({color:0xc8cdcf,metalness:.87,roughness:.24}),
    gold:new T.MeshStandardMaterial({color:0xa98643,metalness:.72,roughness:.35}),
    plaster:new T.MeshStandardMaterial({color:0xe7e2d5,roughness:.92}),
    white:new T.MeshStandardMaterial({color:0xf5f3e8,roughness:.32}),
    grey:new T.MeshStandardMaterial({color:0x85867e,roughness:.85}),
    sofa:new T.MeshStandardMaterial({map:tex.sofa,roughness:1}),
    pillow:new T.MeshStandardMaterial({map:tex.pillow,roughness:1}),
    quilt:new T.MeshStandardMaterial({map:tex.quilt,roughness:.95}),
    floral:new T.MeshStandardMaterial({map:tex.floral,roughness:.96,side:T.DoubleSide}),
    towel:new T.MeshStandardMaterial({map:tex.towel,roughness:1}),
    glass:new T.MeshStandardMaterial({color:0xc9e4eb,transparent:true,opacity:.25,metalness:.15,roughness:.12,depthWrite:false,side:T.DoubleSide}),
    window:new T.MeshStandardMaterial({color:0xdceaf0,roughness:.23,transparent:true,opacity:.47,depthWrite:false,side:T.DoubleSide}),
    basin:new T.MeshStandardMaterial({color:0x080e10,metalness:.2,roughness:.18,side:T.DoubleSide}),
  };
  const groups={};function group(name,parent=root){const g=new T.Group();g.name=name;parent.add(g);groups[name]=g;return g;}
  const floor=group('Piso de madera'),furniture=group('Muebles'),roof=group('Techo y vigas'),bath=group('Baño');
  const walls={west:group('Pared oeste'),east:group('Pared este'),north:group('Pared cabecera'),south:group('Pared fondo'),bathWest:group('Baño lateral'),bathEast:group('Baño exterior'),bathSouth:group('Baño fondo')};
  function mesh(geo,mat,p,parent=furniture,name=''){let m=new T.Mesh(geo,mat);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;m.name=name;parent.add(m);return m;}
  function box(s,p,mat=mats.wood,parent=furniture,r=0,name=''){return mesh(r?new RoundedBoxGeometry(...s,2,Math.min(r,...s.map(v=>v/2))):new T.BoxGeometry(...s),mat,p,parent,name);}
  function cylinder(rt,rb,h,p,mat=mats.metal,parent=furniture,n=20){return mesh(new T.CylinderGeometry(rt,rb,h,n),mat,p,parent);}
  function ball(s,p,mat,parent=furniture){const o=mesh(new T.SphereGeometry(1,20,12),mat,p,parent);o.scale.set(...s);return o;}
  function tube(points,r,mat=mats.metal,parent=furniture){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(12,points.length*6),r,8,false),mat,[0,0,0],parent);}
  function rod(a,b,r,mat=mats.metal,parent=furniture){const A=new T.Vector3(...a),B=new T.Vector3(...b);const o=cylinder(r,r,A.distanceTo(B),A.clone().add(B).multiplyScalar(.5).toArray(),mat,parent,10);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());return o;}
  const H=DIMENSIONS.height;
  box([3.63,.18,5.84],[0,-.13,0],mats.trim,floor,.025,'Base');
  const woodVariants=Array.from({length:9},(_,i)=>{const m=mats.wood.clone();m.color.setHSL(.086+(i%3)*.007,.31+(i%2)*.09,.48+i*.035);return m;});
  for(let x=0;x<19;x++){for(let j=0;j<5;j++){let z=-2.8+j*1.12;box([3.4/19-.009,.055,1.11],[-1.7+(x+.5)*3.4/19,.003,z+.56],woodVariants[(x*7+j*3)%9],floor,0,'Tabla del piso');}}
  function windowFrame(g,cx,cy,width,height){
    box([width+.11,height+.11,.095],[cx,cy,0],mats.trim,g,.012);
    box([width-.025,height-.025,.025],[cx,cy,-.025],mats.window,g);
    // Opening remains transparent; slim rails cover the outer rim of the glazing.
    const frame=groups; // Keep every component in the wall's cutaway group.
  }
  function wall(g,length,openings=[],mat=mats.wood,wood=true){
    // Each horizontal strip is split around genuine window / doorway openings.
    const step=wood?.19:.18;
    for(let lo=0;lo<H-.001;lo+=step){const hi=Math.min(H,lo+step-.005);let spans=[[-length/2,length/2]];
      for(const o of openings){if(hi>o.y&&lo<o.y+o.h){let next=[];for(let [a,b] of spans){if(o.x+o.w/2<=a||o.x-o.w/2>=b)next.push([a,b]);else{if(o.x-o.w/2>a)next.push([a,o.x-o.w/2]);if(o.x+o.w/2<b)next.push([o.x+o.w/2,b]);}}spans=next;}}
      for(const [a,b] of spans)if(b-a>.003)box([b-a,hi-lo,.105],[(a+b)/2,(lo+hi)/2,0],mat,g,0,'Revestimiento');
    }
    box([length,.09,.13],[0,.045,-.02],mats.trim,g);
    for(const o of openings){const y=o.y+o.h/2;
      for(let side of [-1,1])box([.055,o.h+.10,.135],[o.x+side*(o.w/2+.027),y,0],mats.trim,g,.007,'Marco');
      box([o.w+.12,.055,.135],[o.x,o.y+o.h+.028,0],mats.trim,g,.007);
      if(o.y>.1){box([o.w+.12,.07,.16],[o.x,o.y-.035,0],mats.trim,g,.005);box([o.w,o.h,.02],[o.x,y,0],mats.window,g);box([o.w,.025,.035],[o.x,y,0],mats.metal,g);}
    }
  }
  walls.west.position.set(-1.75,0,0);walls.west.rotation.y=Math.PI/2;
  wall(walls.west,5.6,[{x:-2.0,y:1.91,w:.64,h:.5},{x:0,y:1.91,w:.64,h:.5},{x:1.98,y:1.91,w:.64,h:.5}]);
  walls.east.position.set(1.75,0,0);walls.east.rotation.y=-Math.PI/2;
  wall(walls.east,5.6,[{x:1.42,y:.03,w:1.55,h:2.13}]);
  walls.north.position.set(0,0,-2.85);wall(walls.north,3.6,[{x:0,y:1.57,w:1.35,h:.59}]);
  walls.south.position.set(0,0,2.85);wall(walls.south,3.6,[{x:.86,y:0,w:.76,h:2.12}],mats.plaster,false);
  // Entry curtain: pleated geometry with the floral palette seen in the photos.
  const curtain=group('Cortina floral',walls.east);
  const curtainGeo=new T.PlaneGeometry(1.58,2.06,48,16),pos=curtainGeo.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin((pos.getX(i)+.79)*Math.PI*18)*.027);
  curtainGeo.computeVertexNormals();mesh(curtainGeo,mats.floral,[1.42,1.13,.08],curtain);
  rod([.53,2.27,.11],[2.32,2.27,.11],.017,mats.metal,curtain);
  for(let x=.66;x<2.22;x+=.17){const ring=mesh(new T.TorusGeometry(.028,.007,6,12),mats.metal,[x,2.23,.1],curtain);ring.rotation.y=Math.PI/2;}
  // Timber ceiling and exposed beams. It is removable independently of walls.
  for(let j=0;j<21;j++)box([3.56,.065,5.7/21-.004],[0,H+.095,-2.85+(j+.5)*5.7/21],mats.lightWood,roof);
  for(let j=0;j<9;j++)box([3.56,.16,.095],[0,H-.015,-2.7+j*.675],mats.trim,roof);
  // Bed, quilt, floral headboard and bedside tables.
  const bed=group('Cama matrimonial',furniture);
  box([1.45,.25,1.98],[0,.24,-1.70],mats.trim,bed,.035);
  box([1.43,.22,1.96],[0,.45,-1.70],mats.white,bed,.07);
  box([1.49,.11,2.00],[0,.585,-1.68],mats.quilt,bed,.048,'Acolchado beige');
  for(let side of [-1,1]){box([.075,.33,1.83],[side*.755,.39,-1.60],mats.quilt,bed,.02);box([.14,.16,.14],[side*.59,.08,-2.47],mats.trim,bed,.012);box([.14,.16,.14],[side*.59,.08,-.93],mats.trim,bed,.012);}
  box([1.47,.36,.055],[0,.40,-.672],mats.quilt,bed,.02);
  box([1.50,.96,.10],[0,.72,-2.705],mats.floral,bed,.055,'Cabecera floral');
  for(let x of [-.38,.38]){const pillow=box([.63,.16,.39],[x,.71,-2.28],mats.quilt,bed,.075);pillow.rotation.y=x*.1;}
  for(let side of [-1,1]){
    const stand=group(side<0?'Mesa de luz izquierda':'Mesa de luz derecha',furniture);
    box([.40,.042,.38],[side*1.09,.46,-2.43],mats.lightWood,stand,.02);box([.39,.15,.35],[side*1.09,.35,-2.43],new T.MeshStandardMaterial({color:0x738272,roughness:.75}),stand,.015);
    for(let dx of [-.14,.14])for(let dz of [-.13,.13])box([.024,.30,.024],[side*1.09+dx,.15,-2.43+dz],mats.trim,stand,.006);
    const lamp=group('Lámpara de mesa',stand);cylinder(.058,.075,.025,[side*1.09,.497,-2.43],mats.gold,lamp);rod([side*1.09,.51,-2.43],[side*1.09,.76,-2.43],.01,mats.gold,lamp);cylinder(.044,.07,.12,[side*1.09,.79,-2.43],mats.plaster,lamp);
  }
  const towels=group('Toallas sobre la cama',bed);for(let i=0;i<3;i++)box([.43-i*.055,.025,.32-i*.025],[.32,.674+i*.027,-.99],mats.towel,towels,.011);
  box([.09,.018,.06],[.32,.769,-.98],new T.MeshStandardMaterial({color:0xde94bd,roughness:.6}),towels,.006);
  // Grey armless futon: wooden base, angled upholstered back, charcoal cushions.
  const sofa=group('Sofá gris',furniture);sofa.position.set(-1.20,0,.49);
  for(let x of [-.30,.30])for(let z of [-.79,.79])box([.065,.18,.065],[x,.09,z],mats.trim,sofa,.012);
  box([.81,.12,1.92],[0,.21,0],mats.black,sofa,.025);
  box([.72,.18,1.84],[.045,.38,0],mats.sofa,sofa,.08);
  const back=box([.17,.60,1.83],[-.33,.71,0],mats.sofa,sofa,.065);back.rotation.z=-.17;
  for(let z of [-.63,.63]){let p=box([.48,.14,.32],[.04,.52,z],mats.pillow,sofa,.06);p.rotation.y=z*.25;p.rotation.z=.12;}
  // Wooden chest coffee table: raised panels, iron studs and lower rail.
  const chest=group('Mesa baúl',furniture);chest.position.set(-.05,0,.51);
  box([.67,.032,1.00],[0,.48,0],mats.lightWood,chest,.012);box([.59,.29,.89],[0,.305,0],mats.wood,chest,.014);
  for(let x of [-.26,.26])for(let z of [-.39,.39])box([.07,.22,.07],[x,.11,z],mats.trim,chest,.012);
  for(let z of [-.455,.455]){box([.46,.15,.018],[0,.315,z],mats.trim,chest,.005);box([.39,.108,.022],[0,.315,z*1.024],mats.lightWood,chest,.004);for(let x of [-.253,.253])for(let y of [.23,.39])ball([.013,.013,.007],[x,y,z*1.04],mats.black,chest);}
  for(let x of [-.306,.306]){box([.025,.22,.72],[x,.32,0],mats.trim,chest,.005);for(let z of [-.25,0,.25])box([.027,.15,.15],[x*1.03,.32,z],mats.wood,chest,.004);}
  box([.20,.002,.28],[.06,.502,.20],mats.white,chest);
  const basket=cylinder(.065,.06,.10,[-.12,.55,-.04],mats.lightWood,chest,32);for(let j=0;j<22;j++){let a=j*Math.PI/11;rod([-.12+Math.cos(a)*.064,.505,-.04+Math.sin(a)*.064],[-.12+Math.cos(a)*.066,.60,-.04+Math.sin(a)*.066],.0025,mats.trim,chest);}cylinder(.053,.053,.003,[-.12,.604,-.04],mats.trim,chest);
  // Bar cabinet, two metal stools, place settings and compact appliances.
  const bar=group('Barra negra',furniture);bar.position.set(-.05,0,2.08);
  box([.64,.045,1.18],[0,.985,0],mats.black,bar,.008);for(let x of [-.30,.30])box([.035,.95,1.15],[x,.49,0],mats.black,bar);
  box([.60,.035,1.12],[0,.05,0],mats.black,bar);for(let y of [.38,.70])box([.60,.025,.39],[0,y,-.36],mats.black,bar);
  box([.60,.92,.027],[0,.49,.56],mats.black,bar);
  const lime=new T.MeshStandardMaterial({color:0xa7bf65,roughness:.8});
  for(let z of [-.38,0,.38]){cylinder(.195,.195,.004,[0,1.011,z],lime,bar,32);cylinder(.121,.12,.014,[0,1.019,z],mats.white,bar,32);cylinder(.028,.041,.12,[.06,1.09,z+.03],mats.glass,bar,20);rod([-.09,1.04,z-.04],[.08,1.04,z-.10],.008,new T.MeshStandardMaterial({color:0xb73828}),bar);}
  cylinder(.05,.035,.06,[0,.746,-.39],mats.white,bar);
  for(let x of [-.58,.58]){const stool=group('Banqueta de metal',furniture);stool.position.set(x-.05,0,2.13);
    for(let dx of [-.15,.15])for(let dz of [-.16,.16])rod([dx,.025,dz],[dx*.82,.69,dz*.82],.014,mats.black,stool);
    box([.34,.065,.35],[0,.715,0],mats.sofa,stool,.027);
    const backx=x<0?-.15:.15;for(let z of [-.14,.14])rod([backx,.68,z],[backx,1.03,z],.011,mats.black,stool);for(let y of [.86,.96])rod([backx,y,-.14],[backx,y,.14],.01,mats.black,stool);for(let z of [-.15,.15])rod([-.15,.29,z],[.15,.29,z],.012,mats.black,stool);
  }
  const fridge=group('Frigobar y microondas',furniture);fridge.position.set(-1.31,0,2.38);
  box([.55,.90,.55],[0,.46,0],mats.black,fridge,.025);box([.535,.85,.035],[0,.46,-.292],mats.black,fridge,.018);box([.035,.15,.025],[.21,.71,-.32],mats.grey,fridge,.01);
  box([.50,.29,.37],[0,1.07,-.01],mats.black,fridge,.015);box([.36,.205,.006],[-.044,1.073,-.201],new T.MeshStandardMaterial({color:0x243133,metalness:.35,roughness:.2}),fridge,.01);box([.026,.15,.025],[.159,1.07,-.22],mats.metal,fridge,.009);
  for(let y of [1.02,1.09]){const dial=cylinder(.022,.022,.01,[.211,y,-.201],mats.grey,fridge);dial.rotation.x=Math.PI/2;}
  const kettle=group('Jarra eléctrica',fridge);cylinder(.08,.095,.23,[0,1.355,-.005],mats.metal,kettle);cylinder(.082,.082,.028,[0,1.483,-.005],mats.black,kettle);cylinder(.10,.10,.02,[0,1.228,-.005],mats.black,kettle);tube([[.074,1.47,0],[.13,1.44,0],[.14,1.30,0],[.077,1.28,0]],.016,mats.black,kettle);
  // Television and air conditioner sit on the wall opposite the sofa.
  const media=group('TV y aire acondicionado',walls.east);
  box([.78,.46,.055],[-.34,1.64,.095],mats.black,media,.012,'Televisión');
  const screen=new T.MeshBasicMaterial({map:tex.tv,toneMapped:false});mesh(new T.PlaneGeometry(.736,.414),screen,[-.34,1.64,.126],media);
  tube([[-.14,1.42,.075],[-.12,1.16,.073],[-.09,.72,.073],[-.06,.36,.073],[.12,.28,.073],[.20,.39,.073]],.004,mats.black,media);
  box([.78,.255,.20],[-2.05,2.29,.11],mats.white,media,.048,'Aire acondicionado');box([.62,.036,.03],[-2.05,2.20,.23],mats.grey,media,.004);
  // Ceiling pendants stay with the removable roof.
  for(let z of [1.68,2.34]){rod([-.14,H,-z+4],[-.14,2.14,-z+4],.003,mats.metal,roof);cylinder(.046,.046,.22,[-.14,2.04,-z+4],mats.glass,roof);cylinder(.018,.018,.17,[-.14,2.04,-z+4],mats.white,roof);}
  // Bathroom: narrow wet room, patterned tiles, glass corner shelf and black basin.
  box([1.67,.15,1.80],[.925,-.095,3.70],mats.grey,bath,.015);
  const stone=new T.MeshStandardMaterial({color:0xa5a298,roughness:.9});
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)box([.512,.026,.543],[.15+(i+.5)*1.55/3,.01,2.85+(j+.5)*1.65/3],stone,bath);
  function tileWall(g,w,h=2.1){
    const tm=tex.tiles.clone();tm.repeat.set(w/.6,h/.6);tm.needsUpdate=true;const mat=new T.MeshStandardMaterial({map:tm,roughness:.55,side:T.DoubleSide});
    box([w,H,.09],[0,H/2,0],mats.plaster,g);mesh(new T.PlaneGeometry(w,h),mat,[0,h/2,.052],g);mesh(new T.PlaneGeometry(w,h),mat,[0,h/2,-.052],g).rotation.y=Math.PI;
  }
  walls.bathWest.position.set(.10,0,3.70);walls.bathWest.rotation.y=Math.PI/2;tileWall(walls.bathWest,1.70);
  walls.bathEast.position.set(1.75,0,3.70);walls.bathEast.rotation.y=-Math.PI/2;tileWall(walls.bathEast,1.70);
  walls.bathSouth.position.set(.925,0,4.56);tileWall(walls.bathSouth,1.74);
  // Tile face on the room divider, split around the bathroom door.
  const bathFront=group('Azulejos junto a la puerta',walls.south);const tileMat=new T.MeshStandardMaterial({map:tex.tiles,roughness:.5});
  for(const [a,b] of [[.15,.48],[1.24,1.70]])box([b-a,2.10,.015],[(a+b)/2,1.05,.064],tileMat,bathFront);
  const door=group('Puerta del baño',furniture);door.position.set(.46,0,2.84);door.rotation.y=-1.05;box([.73,2.08,.043],[.365,1.04,0],mats.wood,door,.008);box([.018,.18,.015],[.665,1.00,-.025],mats.black,door,.004);rod([.66,1.04,-.04],[.55,1.04,-.04],.012,mats.black,door);
  // Fixtures remain independent so the open model still shows their placement.
  const fixtures=group('Equipamiento del baño',bath);
  box([.48,.12,.43],[1.36,.14,3.21],mats.white,fixtures,.06);
  ball([.205,.205,.29],[1.35,.30,3.29],mats.white,fixtures);box([.41,.07,.53],[1.35,.44,3.26],mats.white,fixtures,.15,'Inodoro');box([.40,.34,.16],[1.35,.57,2.96],mats.black,fixtures,.025,'Mochila negra');
  const shelf=mesh(new T.CylinderGeometry(.39,.39,.018,32,1,false,0,Math.PI/2),mats.glass,[.20,.83,4.47],fixtures);shelf.rotation.y=Math.PI/2;
  const basinPts=[new T.Vector2(.022,0),new T.Vector2(.055,.008),new T.Vector2(.12,.045),new T.Vector2(.18,.12),new T.Vector2(.18,.135),new T.Vector2(.163,.135),new T.Vector2(.10,.049),new T.Vector2(.03,.018)];mesh(new T.LatheGeometry(basinPts,32),mats.basin,[.43,.84,4.18],fixtures);cylinder(.021,.021,.004,[.43,.86,4.18],mats.metal,fixtures);
  tube([[.27,.83,4.22],[.27,1.08,4.22],[.33,1.13,4.22],[.39,1.10,4.22]],.011,mats.metal,fixtures);
  const mirror=group('Espejo rústico',fixtures);box([.045,.78,.63],[.185,1.63,3.84],mats.trim,mirror,.009);box([.011,.66,.51],[.216,1.63,3.84],new T.MeshStandardMaterial({color:0xa8bbbc,metalness:.82,roughness:.12}),mirror,.006);
  for(let z of [3.55,4.13])rod([.23,1.25,z],[.23,2.01,z],.009,mats.gold,mirror);for(let y of [1.26,2.00])rod([.23,y,3.55],[.23,y,4.13],.009,mats.gold,mirror);
  box([.54,.65,.27],[.98,2.17,4.34],mats.white,fixtures,.065,'Calefón');box([.27,.21,.014],[.98,2.14,4.196],mats.grey,fixtures,.02);cylinder(.025,.025,.025,[.98,2.13,4.18],mats.white,fixtures).rotation.x=Math.PI/2;
  for(let x of [.84,1.11])tube([[x,1.86,4.32],[x,1.70,4.32],[x+.04,1.63,4.47]],.009,mats.metal,fixtures);
  rod([.87,.99,4.46],[1.09,.99,4.46],.024,mats.metal,fixtures);tube([[1.01,.99,4.43],[1.21,.70,4.39],[1.52,.88,4.39],[1.49,1.83,4.39]],.008,mats.metal,fixtures);rod([1.49,1.76,4.38],[1.50,1.96,4.35],.017,mats.metal,fixtures);ball([.043,.07,.020],[1.50,1.98,4.34],mats.metal,fixtures);
  cylinder(.135,.105,.30,[.40,.17,3.54],new T.MeshStandardMaterial({color:0x426471,roughness:.5}),fixtures);cylinder(.137,.137,.028,[.40,.332,3.54],mats.grey,fixtures);
  box([.13,.008,.13],[1.13,.028,3.69],mats.metal,fixtures);for(let i=0;i<5;i++)box([.005,.002,.10],[1.09+i*.02,.034,3.69],mats.black,fixtures);
  for(let j=0;j<7;j++)box([1.64,.06,.24],[.925,H+.085,2.86+(j+.5)*1.70/7],mats.lightWood,roof);
  const matRug=new T.MeshStandardMaterial({map:tex.rug,roughness:1});box([.60,.012,.36],[.84,.043,2.59],matRug,furniture,.008);
  // Wall sockets and switch plates are retained in the appropriate wall groups.
  for(const [g,x,y] of [[walls.east,.40,.35],[walls.east,-1.15,.30],[walls.west,-2.1,1.19]]){box([.055,.085,.012],[x,y,.070],mats.white,g,.004);for(let dx of [-.012,.012])box([.004,.009,.003],[x+dx,y,.078],mats.black,g);}
  root.traverse(o=>{if(o.isMesh&&o.material.transparent)o.castShadow=false;});
  return {root,roof,walls,groups,dimensions:DIMENSIONS};
}
