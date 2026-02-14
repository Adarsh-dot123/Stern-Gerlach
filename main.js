const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sourceX = 100;
const collimatorX = 250;
const magnetX = canvas.width / 2;
const screenX = canvas.width - 150;

let particles = [];
let upCount = 0;
let downCount = 0;

/* ---------------- */

function updateStats(){
  document.getElementById("upCount").textContent = upCount;
  document.getElementById("downCount").textContent = downCount;

  const total = upCount + downCount || 1;

  document.getElementById("upBar").style.height =
    (upCount / total) * 100 + "%";

  document.getElementById("downBar").style.height =
    (downCount / total) * 100 + "%";
}

/* ---------------- */
/* BALANCED MEASUREMENT */
/* ---------------- */

function measureSpin(p, axis){

  // If already aligned with axis, keep same state
  if(p.axis === axis) return p.state;

  const diff = upCount - downCount;

  // If difference already +1, force down
  if(diff >= 1) return "down";

  // If difference already -1, force up
  if(diff <= -1) return "up";

  // Otherwise choose randomly
  return Math.random() < 0.5 ? "up" : "down";
}


/* ---------------- */

function createParticle(){
  return {
    x: sourceX,
    y: canvas.height / 2,
    vx: 3,
    vy: 0,
    axis: "z",
    state: Math.random() < 0.5 ? "up" : "down",
    measured: false,
    trail: []
  };
}

/* ---------------- */

document.getElementById("fireOne").onclick = () => {
  particles.push(createParticle());
};

document.getElementById("fireMany").onclick = () => {
  for(let i = 0; i < 50; i++){
    particles.push(createParticle());
  }
};

document.getElementById("reset").onclick = () => {
  particles = [];
  upCount = 0;
  downCount = 0;
  updateStats();
};

/* ---------------- */

function label(text, x, y){
  ctx.fillStyle = "white";
  ctx.font = "18px Segoe UI";
  ctx.fillText(text, x, y);
}

function drawSource(){
  ctx.fillStyle = "white";
  ctx.fillRect(sourceX - 20, canvas.height/2 - 35, 20, 70);
  label("Source", sourceX - 40, canvas.height/2 - 50);
}

function drawCollimators(){
  ctx.fillStyle = "gray";

  ctx.fillRect(collimatorX, canvas.height/2 - 80, 12, 40);
  ctx.fillRect(collimatorX, canvas.height/2 + 40, 12, 40);

  label("Collimator", collimatorX - 30, canvas.height/2 - 100);
}

function drawMagnet(){
  ctx.fillStyle = "red";
  ctx.fillRect(magnetX - 40, canvas.height/2 - 90, 80, 90);

  ctx.fillStyle = "blue";
  ctx.fillRect(magnetX - 40, canvas.height/2, 80, 90);

  label("Magnet", magnetX - 25, canvas.height/2 - 110);
}

function drawScreen(){
  ctx.fillStyle = "green";
  ctx.fillRect(screenX, canvas.height/2 - 170, 20, 340);
  label("Detector", screenX - 30, canvas.height/2 - 190);
}

/* ---------------- */

function animate(){
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const axis = document.getElementById("axis").value;

  drawSource();
  drawCollimators();
  drawMagnet();
  drawScreen();

  particles.forEach(p => {

    p.trail.push({x:p.x, y:p.y});
    if(p.trail.length > 35) p.trail.shift();

    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    p.trail.forEach((t,i)=>{
      if(i===0) ctx.moveTo(t.x,t.y);
      else ctx.lineTo(t.x,t.y);
    });
    ctx.stroke();

    p.x += p.vx;
    p.y += p.vy;

    if(p.x > magnetX && !p.measured){

      const result = measureSpin(p, axis);

      p.axis = axis;
      p.state = result;
      p.measured = true;

      if(result === "up"){
        p.vy = -2;
        upCount++;
      } else {
        p.vy = 2;
        downCount++;
      }

      updateStats();
    }

    let color = "white";
    if(p.measured){
      color = p.state === "up" ? "cyan" : "magenta";
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
    ctx.fill();

  });
}

animate();

/* ---------------- */

window.addEventListener("resize", ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
