var canvas = document.getElementById("cube");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.shadowBlur = 0;
ctx.shadowColor = "transparent";

let viewW = 0;
let viewH = 0;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    viewW = window.innerWidth;
    viewH = window.innerHeight;

    canvas.width  = viewW * dpr;
    canvas.height = viewH * dpr;

    canvas.style.width  = viewW + "px";
    canvas.style.height = viewH + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clear(){
    ctx.fillStyle = "#000000ff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

function point({x,y}){
    const s = canvas.width/100;
    ctx.fillStyle = "red";
    ctx.fillRect(x-s/2,y-s/2,s,s);
}
function screen(p){
    return {
    x: (p.x * 0.5 + 0.5) * viewW,
    y: (1 - (p.y * 0.5 + 0.5)) * viewH
    }
}
function project({x,y,z}){
    const aspect = canvas.width / canvas.height;
    return {
        x: (x/z)/aspect,
        y: y/z
    }
}

const FPS = 60;
let dz = 1;
let angle = 0;
let dy = 0;

const vs = [
  { x:  0.25, y:  0.25, z:  0.25 },
  { x: -0.25, y:  0.25, z:  0.25 },
  { x:  -0.25, y: -0.25, z:  0.25 },
  { x: 0.25, y: -0.25, z:  0.25 },

  { x:  0.25, y:  0.25, z: -0.25 },
  { x: -0.25, y:  0.25, z: -0.25 },
  { x:  -0.25, y: -0.25, z: -0.25 },
  { x:  0.25, y: -0.25, z: -0.25 }
];
const fs = [
    [0,1,2,3],
    [4,5,6,7],
    [0,4],
    [1,5],
    [2,6],
    [3,7],
    [0,2],
    [4,6],
    [1,6],
    [0,7],
    [0,5],
    [3,6]
]


function translateZ({x,y,z}, dz){
    return {x,y,z:z+dz};
}
function translateY({x,y,z}, dz){
    return {x,y:y+dz,z};
}
function rotateXZ({x,y,z}, angle){
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: x*c-z*s,
        y,
        z: x*s+z*c
    };
}
function rotateYZ({x,y,z}, angle){
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x,
        y: y*c-z*s,
        z: y*s+z*c
    };
}
function line(p1, p2){
    ctx.lineWidth = 3;
    ctx.strokeStyle = "green";
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function drawText(text) {
    const fontSize = Math.min(viewW, viewH) * 0.1;
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px 'Roboto Slab', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, viewW / 2, viewH / 2);
}

function frame(){
    const dt = 1/FPS;
    dy += (1*dt);
    angle+=(Math.PI*dt)/4;
    clear()

    for(const f of fs){
        for(let i=0; i<f.length; i++){
            const a = vs[f[i]];
            const b = vs[f[(i+1)%f.length]];
            line(
                screen(project(translateZ(translateY(rotateXZ(rotateYZ(a, angle), angle), Math.sin(dy)*0.2),dz))),
                screen(project(translateZ(translateY(rotateXZ(rotateYZ(b, angle), angle) ,Math.sin(dy)*0.2),dz)))
            );
        }
    }
    drawText("SrySine");
    setTimeout(frame, 1000/FPS);
}
setTimeout(frame, 1000/FPS);