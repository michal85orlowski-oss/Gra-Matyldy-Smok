import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y, HUNTER_SHOT_COOLDOWN, PLAYER_SPEED, DRAGON_SPEED, PLASMA_COOLDOWN } from './game/constants.js';
import { applyDragonDamage, freshDragonHealth, isDragonDefeated } from './game/combat.js';
import { loadLevels } from './game/levelLoader.js';

const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const keys = new Set();
let levels = [];
let game = null;
let lastTime = 0;
const drawings = {};
const dragonMouthOffset = { x: 46, y: -6 };
const BOAT_SINK_DURATION = 1400;
const SHIP_SINK_DURATION = 2400;
const drawingPaths = {
  taming: '/assets/source-drawings/2.jfif',
  captured: '/assets/source-drawings/6.jfif',
  freedDragon: '/assets/source-drawings/4.jfif',
  iceDragon: '/assets/source-drawings/8.jfif',
  characters: '/assets/sprites/matylda-characters-keyed-v1.png'
};

// Gotowy atlas zawiera cztery poprawione postacie na różowym tle technicznym.
const characterFrames = {
  boy: [210, 145, 235, 420],
  dragon: [560, 145, 605, 405],
  hunter: [195, 685, 340, 435],
  launcher: [650, 785, 435, 355]
};

const palette = {
  meadow: { sky: '#87d4f4', sky2: '#d7f3fc', hill: '#87bf73', ground: '#69a657', ground2: '#438743' },
  forest: { sky: '#75c9f1', sky2: '#caeffa', hill: '#70ae75', ground: '#4d9255', ground2: '#2f7043' },
  mountain: { sky: '#80c6e8', sky2: '#daf1f5', hill: '#91a3a3', ground: '#57955a', ground2: '#367348' },
  camp: { sky: '#efbb82', sky2: '#f8e5bf', hill: '#9f866f', ground: '#736147', ground2: '#4d4a3b' },
  ocean: { sky: '#8bd6f2', sky2: '#d5f5fb', hill: '#80c8cf', ground: '#1688ae', ground2: '#096b96' },
  ice: { sky: '#acdff1', sky2: '#e9faff', hill: '#b6deeb', ground: '#8bc9d7', ground2: '#5aa8bc' }
};

function roundRect(x, y, width, height, radius, fill, stroke = null, lineWidth = 2) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  if (fill) { context.fillStyle = fill; context.fill(); }
  if (stroke) { context.strokeStyle = stroke; context.lineWidth = lineWidth; context.stroke(); }
}

function text(value, x, y, size, color = '#244457', align = 'left') {
  context.fillStyle = color;
  context.font = `800 ${size}px "Baloo 2", "Trebuchet MS", sans-serif`;
  context.textAlign = align;
  context.fillText(value, x, y);
}

function createGame(levelIndex) {
  const level = levels[levelIndex];
  const target = level.target ? { ...level.target, maxHits: level.target.hits } : null;
  game = {
    levelIndex, level, status: 'playing', startedAt: performance.now(), elapsed: 0,
    player: { x: 90, y: level.mode === 'ground' ? GROUND_Y - 47 : 270, vy: 0, egg: false },
    health: freshDragonHealth(), invulnerableUntil: 0, lastPlasmaAt: -PLASMA_COOLDOWN,
    plasma: [], projectiles: [], sinkingBoats: [], target, message: level.objective, messageUntil: 5000,
    hunters: level.hunters.map((x, index) => ({ x, homeX: x, phase: index * 1.4, lastShotAt: -index * 650, active: true })),
    launchers: level.launchers.map((x, index) => ({ x, lastShotAt: -1500 - index * 900, active: true })),
    pulse: 0, targetHitFlash: 0, eggSparkle: 0, captured: false
  };
  hideOverlay();
}

function showOverlay(kind) {
  if (kind === 'menu') {
    overlay.innerHTML = `<div class="panel"><h1>JEŹDCY SMOKÓW<br>NA KOŃCU ŚWIATA</h1><p>Wyrusz z chłopcem i małym smokiem na kolorową wyprawę. Nauczcie się latać, omijajcie łowców i uratujcie Smoka Alfa.</p><button class="play-button" data-action="start">ZACZYNAMY!</button><p class="tiny">Strzałki: ruch i lot &nbsp; • &nbsp; Spacja: plazma</p></div>`;
  } else if (kind === 'taming') {
    overlay.innerHTML = `<div class="panel story-panel"><div class="taming-image-frame"><img class="taming-image" src="${drawingPaths.taming}" alt="Rysunek Matyldy przedstawiający oswajanie smoka" /></div><h2>Z jaja wykluł się smok!</h2><p>Chłopiec oswoił małego smoka. Od teraz będą razem uczyć się latać.</p><button class="play-button" data-action="next">PIERWSZY LOT</button></div>`;
  } else if (kind === 'gameover') {
    overlay.innerHTML = game.captured
      ? `<div class="panel story-panel"><img src="${drawingPaths.captured}" alt="Rysunek Matyldy przedstawiający smoka schwytanego w sieć" /><h2>Smok został schwytany w sieć!</h2><p>Łowcy złapali smoka, ale możecie spróbować jeszcze raz od początku planszy.</p><button class="play-button" data-action="restart">SPRÓBUJ PONOWNIE</button></div>`
      : `<div class="panel"><h1>OCH!</h1><h2>Smok potrzebuje odpoczynku</h2><p>Trzecie trafienie zakończyło tę próbę. Na początku planszy smok znów będzie miał trzy serduszka.</p><button class="play-button" data-action="restart">SPRÓBUJ PONOWNIE</button></div>`;
  } else if (kind === 'freedDragon') {
    overlay.innerHTML = `<div class="panel story-panel"><img src="${drawingPaths.freedDragon}" alt="Rysunek Matyldy przedstawiający uratowanego smoka odlatującego z otwartej klatki" /><h1>SMOK JEST WOLNY!</h1><p>Plazma otworzyła klatkę. Uratowany smok odlatuje, a wasi bohaterowie ruszają w dalszą drogę.</p><button class="play-button" data-action="next">DALEJ</button></div>`;
  } else if (kind === 'complete') {
    const next = game.levelIndex + 1;
    overlay.innerHTML = `<div class="panel"><h1>BRAWO!</h1><h2>${game.level.title}</h2><p>Udało się! Czas na dalszą część przygody.</p><button class="play-button" data-action="next">PLANSZA ${next + 1}</button></div>`;
  } else if (kind === 'victory') {
    overlay.innerHTML = `<div class="panel story-panel"><img src="${drawingPaths.iceDragon}" alt="Rysunek Matyldy przedstawiający uwolnionego Lodowego Smoka Alfa" /><h1>SMOK ALFA<br>WOLNY!</h1><p>Lodowiec pękł, a Lodowy Smok Alfa odzyskał wolność. To koniec wielkiej wyprawy!</p><button class="play-button" data-action="menu">ZAGRAJ JESZCZE RAZ</button></div>`;
  }
}

function hideOverlay() { overlay.innerHTML = ''; }

overlay.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  if (action === 'start') createGame(0);
  if (action === 'restart') createGame(game.levelIndex);
  if (action === 'next') createGame(game.levelIndex + 1);
  if (action === 'menu') showOverlay('menu');
});

function keyName(event) { return event.code === 'Space' ? 'Space' : event.key; }
window.addEventListener('keydown', (event) => {
  const key = keyName(event);
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(key)) event.preventDefault();
  keys.add(key);
});
window.addEventListener('keyup', (event) => keys.delete(keyName(event)));
document.querySelectorAll('[data-control]').forEach((button) => {
  const key = button.dataset.control;
  const down = (event) => { event.preventDefault(); keys.add(key); };
  const up = (event) => { event.preventDefault(); keys.delete(key); };
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointerleave', up);
  button.addEventListener('pointercancel', up);
});

function firePlasma(now) {
  if (game.level.mode !== 'flight') return;
  if (now - game.lastPlasmaAt < PLASMA_COOLDOWN) return;
  game.lastPlasmaAt = now;
  const p = game.player;
  const angle = Math.PI / 4;
  game.plasma.push({ x: p.x + dragonMouthOffset.x, y: p.y + dragonMouthOffset.y, vx: Math.cos(angle) * 500, vy: Math.sin(angle) * 500, age: 0 });
}

function spawnProjectile(source, type = 'arrow') {
  const originY = type === 'arrow' ? GROUND_Y - 35 : GROUND_Y - 46;
  const speed = type === 'arrow' ? 180 : 205;
  const direction = game.player.x >= source.x ? 1 : -1;
  game.projectiles.push({ x: source.x, y: originY, vx: direction * speed * 0.707, vy: -speed * 0.707, type, age: 0 });
}

function hitDragon(now, amount = 1, fatal = false) {
  if (game.status !== 'playing' || now < game.invulnerableUntil) return;
  if (fatal) game.captured = true;
  game.health = fatal ? 0 : applyDragonDamage(game.health, amount);
  game.invulnerableUntil = now + 850;
  game.message = fatal ? 'Sieć schwytała smoka!' : 'Aj! Zielona strzała trafiła smoka!';
  game.messageUntil = game.elapsed + 1600;
  if (isDragonDefeated(game.health)) {
    game.status = 'gameover';
    window.setTimeout(() => showOverlay('gameover'), 450);
  }
}

function completeLevel() {
  if (game.status !== 'playing') return;
  game.status = 'complete';
  const scene = game.level.completionScene ?? (game.levelIndex === 0 ? 'taming' : 'complete');
  window.setTimeout(() => showOverlay(scene), 500);
}

function update(dt, now) {
  if (!game || game.status !== 'playing') return;
  game.elapsed += dt;
  game.pulse += dt;
  const p = game.player;
  const movingLeft = keys.has('ArrowLeft');
  const movingRight = keys.has('ArrowRight');
  const movingUp = keys.has('ArrowUp');
  const movingDown = keys.has('ArrowDown');
  if (keys.has('Space')) firePlasma(now);

  if (game.level.mode === 'ground') {
    if (movingLeft) p.x -= PLAYER_SPEED * dt / 1000;
    if (movingRight) p.x += PLAYER_SPEED * dt / 1000;
    if (movingUp && p.y >= GROUND_Y - 47) p.vy = -530;
    p.vy += 1250 * dt / 1000;
    p.y += p.vy * dt / 1000;
    if (p.y > GROUND_Y - 47) { p.y = GROUND_Y - 47; p.vy = 0; }
    p.x = Math.max(28, Math.min(GAME_WIDTH - 42, p.x));
    if (!p.egg && p.x > game.level.eggX - 26) { p.egg = true; game.message = 'Masz jajo! Zanieś je do lasu.'; game.messageUntil = game.elapsed + 2800; game.eggSparkle = game.elapsed + 900; }
    if (p.egg && p.x > game.level.goalX) completeLevel();
  } else {
    const speed = DRAGON_SPEED * dt / 1000;
    if (movingLeft) p.x -= speed;
    if (movingRight) p.x += speed;
    if (movingUp) p.y -= speed;
    if (movingDown) p.y += speed;
    p.x = Math.max(48, Math.min(GAME_WIDTH - 45, p.x));
    p.y = Math.max(85, Math.min(GROUND_Y - 90, p.y));
  }

  game.hunters.forEach((hunter) => {
    if (!hunter.active) return;
    hunter.x = hunter.homeX + Math.sin(game.elapsed / 1000 + hunter.phase) * 20;
    if (game.elapsed - hunter.lastShotAt >= HUNTER_SHOT_COOLDOWN) { hunter.lastShotAt = game.elapsed; spawnProjectile(hunter); }
  });
  game.launchers.forEach((launcher) => {
    if (!launcher.active) return;
    if (game.elapsed - launcher.lastShotAt >= HUNTER_SHOT_COOLDOWN) { launcher.lastShotAt = game.elapsed; spawnProjectile(launcher, 'spear'); }
  });

  if (game.target?.fatalAttack === 'net' && game.target.hits > 0 && game.elapsed > 3500 && Math.floor((game.elapsed - 3500) / 5000) > Math.floor((game.elapsed - 3500 - dt) / 5000)) {
    const target = game.target;
    const dx = p.x - target.x;
    const dy = p.y - target.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    game.projectiles.push({ x: target.x - 28, y: target.y + 12, vx: dx / length * 150, vy: dy / length * 150, type: 'net', age: 0 });
    game.message = 'Statek wystrzelił sieć!'; game.messageUntil = game.elapsed + 1800;
  }

  game.plasma = game.plasma.filter((shot) => {
    shot.x += shot.vx * dt / 1000; shot.y += shot.vy * dt / 1000; shot.age += dt;
    const hunter = game.hunters.find((enemy) => enemy.active && Math.abs(shot.x - enemy.x) < 34 && Math.abs(shot.y - (GROUND_Y - 38)) < 42);
    if (hunter) {
      hunter.active = false;
      if (isWaterLevel()) game.sinkingBoats.push({ x: hunter.x, startedAt: game.elapsed });
      game.message = 'Plazma smoka trafiła łowcę!';
      game.messageUntil = game.elapsed + 1300;
      return false;
    }
    const launcher = game.launchers.find((enemy) => enemy.active && Math.abs(shot.x - enemy.x) < 38 && Math.abs(shot.y - (GROUND_Y - 42)) < 45);
    if (launcher) {
      launcher.active = false;
      game.message = 'Plazma smoka zniszczyła miotacz włóczni!';
      game.messageUntil = game.elapsed + 1300;
      return false;
    }
    if (game.target?.hits > 0 && Math.abs(shot.x - game.target.x) < 54 && Math.abs(shot.y - game.target.y) < 78) {
      game.target.hits -= 1; game.targetHitFlash = game.elapsed + 220;
      if (game.target.hits <= 0 && game.target.type === 'ship') game.target.destroyedAt = game.elapsed;
      game.message = game.target.hits > 0 ? `Cel trafiony! Zostało: ${game.target.hits}` : 'Udało się!';
      game.messageUntil = game.elapsed + 1400;
      return false;
    }
    return shot.x < GAME_WIDTH + 50 && shot.age < 3000;
  });

  game.projectiles = game.projectiles.filter((shot) => {
    shot.x += shot.vx * dt / 1000; shot.y += shot.vy * dt / 1000; shot.age += dt;
    const hitbox = shot.type === 'net' ? 30 : 16;
    if (Math.abs(shot.x - p.x) < hitbox + 28 && Math.abs(shot.y - (p.y + 15)) < hitbox + 23) {
      hitDragon(now, 1, shot.type === 'net'); return false;
    }
    return shot.x > -50 && shot.x < GAME_WIDTH + 50 && shot.y > -50 && shot.y < GAME_HEIGHT + 50 && shot.age < 6500;
  });
  game.sinkingBoats = game.sinkingBoats.filter((boat) => game.elapsed - boat.startedAt < BOAT_SINK_DURATION);
  if (game.level.completion === 'clearEnemies' && allThreatsDefeated()) completeLevel();
}

function isWaterLevel() { return game.level.theme === 'ocean' || game.level.theme === 'ice'; }

function allThreatsDefeated() {
  return game.hunters.every((hunter) => !hunter.active)
    && game.launchers.every((launcher) => !launcher.active)
    && game.sinkingBoats.length === 0
    && (!game.target || (game.target.hits <= 0 && (!game.target.destroyedAt || game.elapsed - game.target.destroyedAt >= SHIP_SINK_DURATION)));
}

function drawBackground(theme) {
  const colors = palette[theme];
  const gradient = context.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, colors.sky); gradient.addColorStop(.72, colors.sky2); gradient.addColorStop(1, colors.hill);
  context.fillStyle = gradient; context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  context.fillStyle = '#fff8b4'; context.beginPath(); context.arc(970, 82, 42, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#f2bf5a'; context.beginPath(); context.arc(970, 82, 34, 0, Math.PI * 2); context.fill();
  for (const cloud of [[150, 112], [460, 75], [725, 145]]) drawCloud(...cloud);
  if (theme === 'mountain' || theme === 'camp' || theme === 'ice') drawMountains(theme);
  if (theme === 'ocean' || theme === 'ice') drawWater(colors); else drawLand(colors, theme);
}

function drawCloud(x, y) {
  context.fillStyle = '#fffefa';
  context.beginPath(); context.arc(x, y, 18, Math.PI, 0); context.arc(x + 27, y - 11, 27, Math.PI, 0); context.arc(x + 58, y, 20, Math.PI, 0); context.lineTo(x + 73, y + 16); context.lineTo(x - 14, y + 16); context.closePath(); context.fill();
}

function drawMountains(theme) {
  const base = theme === 'ice' ? '#98cddd' : '#829a9d';
  const snow = theme === 'ice' ? '#effcff' : '#d8e9e6';
  [[80, 385, 170], [350, 370, 230], [680, 390, 200], [950, 365, 250]].forEach(([x, y, h]) => {
    context.fillStyle = base; context.beginPath(); context.moveTo(x - h, GROUND_Y); context.lineTo(x, y - h); context.lineTo(x + h, GROUND_Y); context.closePath(); context.fill();
    context.fillStyle = snow; context.beginPath(); context.moveTo(x, y - h); context.lineTo(x - 35, y - h + 50); context.lineTo(x, y - h + 35); context.lineTo(x + 28, y - h + 70); context.closePath(); context.fill();
  });
}

function drawLand(colors, theme) {
  context.fillStyle = colors.hill; context.beginPath(); context.moveTo(0, 440); for (let x = 0; x <= GAME_WIDTH; x += 80) context.quadraticCurveTo(x + 40, 400 + Math.sin(x) * 25, x + 80, 440); context.lineTo(GAME_WIDTH, GROUND_Y); context.lineTo(0, GROUND_Y); context.fill();
  if (theme !== 'camp') for (let x = 60; x < GAME_WIDTH; x += 130) drawTree(x, GROUND_Y - 5, theme === 'forest' ? 1.2 : .85);
  context.fillStyle = colors.ground; context.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
  context.fillStyle = colors.ground2; context.fillRect(0, GROUND_Y, GAME_WIDTH, 10);
  for (let x = 10; x < GAME_WIDTH; x += 28) { context.strokeStyle = '#b1df78'; context.lineWidth = 2; context.beginPath(); context.moveTo(x, GROUND_Y + 5); context.lineTo(x + 4, GROUND_Y - 2); context.stroke(); }
}

function drawWater(colors) {
  context.fillStyle = colors.ground; context.fillRect(0, 452, GAME_WIDTH, GAME_HEIGHT - 452);
  for (let y = 470; y < GAME_HEIGHT; y += 28) for (let x = (y % 56); x < GAME_WIDTH; x += 78) { context.strokeStyle = '#a9e7ee'; context.lineWidth = 3; context.beginPath(); context.arc(x, y, 18, Math.PI, 0); context.stroke(); }
}

function drawTree(x, y, scale = 1) {
  context.fillStyle = '#875a39'; roundRect(x - 7 * scale, y - 58 * scale, 14 * scale, 63 * scale, 6, '#875a39');
  context.fillStyle = '#397b49'; context.beginPath(); context.arc(x, y - 72 * scale, 31 * scale, 0, Math.PI * 2); context.arc(x - 23 * scale, y - 52 * scale, 25 * scale, 0, Math.PI * 2); context.arc(x + 24 * scale, y - 51 * scale, 26 * scale, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#6db55a'; context.beginPath(); context.arc(x - 9 * scale, y - 76 * scale, 18 * scale, 0, Math.PI * 2); context.fill();
}

function drawBoy(x, y, egg = false) {
  context.save(); context.translate(x, y);
  context.fillStyle = '#f6b37e'; context.beginPath(); context.arc(0, -26, 12, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#563f35'; context.beginPath(); context.arc(-1, -32, 12, Math.PI + .15, Math.PI * 2 - .2); context.fill();
  roundRect(-11, -14, 22, 25, 8, '#ec7152', '#244457');
  context.strokeStyle = '#244457'; context.lineWidth = 5; context.lineCap = 'round'; context.beginPath(); context.moveTo(-6, 10); context.lineTo(-7, 24); context.moveTo(6, 10); context.lineTo(7, 24); context.stroke();
  if (egg) { context.fillStyle = '#f3e9bd'; context.beginPath(); context.ellipse(18, 1, 10, 14, .25, 0, Math.PI * 2); context.fill(); context.strokeStyle = '#d79575'; context.stroke(); }
  context.restore();
}

function drawDragon(x, y, blink) {
  if (drawCharacter('dragon', x - 48, y - 34, 96, 64, blink)) return;
  context.save(); context.translate(x, y);
  context.globalAlpha = blink ? .45 : 1;
  context.fillStyle = '#ef7662'; context.beginPath(); context.ellipse(-8, 4, 35, 24, 0, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#da5b54'; context.beginPath(); context.moveTo(-27, -3); context.lineTo(-63, -37); context.lineTo(-43, 14); context.closePath(); context.fill(); context.beginPath(); context.moveTo(-4, -10); context.lineTo(-20, -48); context.lineTo(20, -11); context.closePath(); context.fill();
  context.fillStyle = '#f5ba63'; context.beginPath(); context.ellipse(-1, 10, 21, 14, 0, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#ef7662'; context.beginPath(); context.arc(28, -7, 18, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#fff'; context.beginPath(); context.arc(34, -11, 5, 0, Math.PI * 2); context.fill(); context.fillStyle = '#274556'; context.beginPath(); context.arc(35, -11, 2, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#a94948'; context.lineWidth = 4; context.lineCap = 'round'; context.beginPath(); context.moveTo(-30, 16); context.lineTo(-43, 33); context.moveTo(9, 19); context.lineTo(1, 35); context.stroke();
  context.fillStyle = '#ef7662'; context.beginPath(); context.moveTo(-35, 6); context.lineTo(-70, 14); context.lineTo(-42, 21); context.closePath(); context.fill();
  drawBoy(-6, -30); context.restore();
}

function drawDrawingCrop(name, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height, faded = false) {
  const image = drawings[name];
  // Obraz źródłowy ma naturalWidth, a po usunięciu różowego tła jest Canvasem
  // z właściwością width. Oba warianty są prawidłowymi źródłami drawImage.
  if (!image || !(image.naturalWidth || image.width)) return false;
  context.save();
  context.globalAlpha = faded ? .5 : 1;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
  return true;
}

function drawCharacter(character, x, y, width, height, faded = false, flipped = false) {
  if (!flipped) return drawDrawingCrop('characters', ...characterFrames[character], x, y, width, height, faded);
  const image = drawings.characters;
  if (!image || !(image.naturalWidth || image.width)) return false;
  context.save();
  context.globalAlpha = faded ? .5 : 1;
  context.translate(x + width / 2, y + height / 2);
  context.scale(-1, 1);
  context.drawImage(image, ...characterFrames[character], -width / 2, -height / 2, width, height);
  context.restore();
  return true;
}

function drawBoyFromDrawing(x, y) {
  if (drawCharacter('boy', x - 16, y - 10, 32, 57)) {
    if (game.player.egg) drawCarriedEgg(x, y);
    return;
  }
  drawBoy(x, y, game.player.egg);
}

function drawCarriedEgg(x, y) {
  context.save();
  context.translate(x + 14, y + 22);
  context.rotate(-.18);
  context.fillStyle = '#f7ebbd'; context.beginPath(); context.ellipse(0, 0, 5.5, 8, 0, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#9e7158'; context.lineWidth = 2; context.stroke();
  context.fillStyle = '#9b6c9c'; context.beginPath(); context.arc(-1.5, -2, 1.25, 0, Math.PI * 2); context.arc(2, 2.5, 1.15, 0, Math.PI * 2); context.fill();
  context.restore();
}

function drawHunter(x) {
  context.save(); context.translate(x, GROUND_Y - 8);
  context.strokeStyle = '#274556'; context.lineWidth = 3; context.fillStyle = '#77a65c'; context.beginPath(); context.arc(0, -41, 12, 0, Math.PI * 2); context.fill(); context.stroke();
  roundRect(-10, -30, 20, 25, 5, '#d38b4f', '#274556'); context.strokeStyle = '#274556'; context.lineWidth = 4; context.beginPath(); context.moveTo(-5, -5); context.lineTo(-8, 4); context.moveTo(5, -5); context.lineTo(8, 4); context.stroke();
  context.strokeStyle = '#6b4e38'; context.lineWidth = 3; context.beginPath(); context.arc(13, -24, 15, -1.4, 1.5); context.stroke(); context.restore();
}

function drawHunterFromDrawing(x, onWater = false) {
  if (onWater) drawHunterBoat(x);
  if (drawCharacter('hunter', x - 15, GROUND_Y - 39, 30, 39, false, game.player.x < x)) return;
  drawHunter(x);
}

function drawLauncher(x) {
  if (drawCharacter('launcher', x - 20, GROUND_Y - 32, 40, 32, false, game.player.x < x)) return;
  context.save(); context.translate(x, GROUND_Y); roundRect(-26, -34, 52, 34, 6, '#9a6c42', '#4e3b2e', 3); context.fillStyle = '#c9965a'; context.fillRect(-5, -56, 10, 28); context.strokeStyle = '#4e3b2e'; context.lineWidth = 4; context.beginPath(); context.moveTo(-38, -36); context.lineTo(31, -65); context.stroke(); context.restore();
}

function drawHunterBoat(x) {
  const bob = Math.sin(game.elapsed / 520 + x / 75) * 3;
  const deckY = GROUND_Y - 4 + bob;
  context.save();
  context.translate(x, deckY);
  context.fillStyle = '#8a593d';
  context.beginPath(); context.moveTo(-52, 0); context.lineTo(53, 0); context.lineTo(37, 25); context.lineTo(-37, 25); context.closePath(); context.fill();
  context.strokeStyle = '#4f352b'; context.lineWidth = 3; context.stroke();
  context.fillStyle = '#c89054'; context.fillRect(-43, -7, 86, 9);
  context.strokeStyle = '#e4c17a'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(-37, 9); context.lineTo(34, 9); context.moveTo(-24, 18); context.lineTo(23, 18); context.stroke();
  context.restore();
}

function drawSinkingBoat(boat) {
  const progress = Math.min(1, (game.elapsed - boat.startedAt) / BOAT_SINK_DURATION);
  const deckY = GROUND_Y - 4 + progress * 52;
  context.save();
  context.translate(boat.x, deckY);
  context.rotate(progress * .34);
  context.globalAlpha = 1 - progress * .45;
  context.fillStyle = '#8a593d';
  context.beginPath(); context.moveTo(-52, 0); context.lineTo(53, 0); context.lineTo(37, 25); context.lineTo(-37, 25); context.closePath(); context.fill();
  context.strokeStyle = '#4f352b'; context.lineWidth = 3; context.stroke();
  context.fillStyle = '#c89054'; context.fillRect(-43, -7, 86, 9);
  if (progress < .7) drawFlames(0, -14, 13);
  context.restore();
}

function drawFlames(x, y, size) {
  const flicker = Math.sin(game.elapsed / 90 + x) * size * .16;
  context.fillStyle = '#ef633d';
  context.beginPath(); context.moveTo(x - size, y + size); context.quadraticCurveTo(x - size * .8, y - size, x, y - size * 1.45 + flicker); context.quadraticCurveTo(x + size * .9, y - size * .45, x + size, y + size); context.closePath(); context.fill();
  context.fillStyle = '#ffd15d';
  context.beginPath(); context.moveTo(x - size * .4, y + size * .7); context.quadraticCurveTo(x - size * .2, y - size * .35, x + size * .15, y - size * .72 + flicker); context.quadraticCurveTo(x + size * .58, y - size * .05, x + size * .42, y + size * .7); context.closePath(); context.fill();
}

function drawCity() {
  const buildings = [
    [310, 440, 70, 105, '#e9a768', '#c96754'],
    [385, 403, 90, 142, '#f3c568', '#d97756'],
    [480, 425, 80, 120, '#83b9c4', '#4e8498'],
    [565, 388, 98, 157, '#df9272', '#b75c54'],
    [668, 430, 65, 115, '#e9c586', '#b98454']
  ];
  buildings.forEach(([x, y, width, height, wall, roof]) => {
    roundRect(x, y, width, height, 5, wall, '#6a4d45', 2);
    context.fillStyle = roof; context.beginPath(); context.moveTo(x - 9, y + 4); context.lineTo(x + width / 2, y - 39); context.lineTo(x + width + 9, y + 4); context.closePath(); context.fill();
    context.strokeStyle = '#6a4d45'; context.lineWidth = 2; context.stroke();
    context.fillStyle = '#fff3bd';
    for (let windowY = y + 20; windowY < y + height - 25; windowY += 31) {
      for (let windowX = x + 14; windowX < x + width - 12; windowX += 27) context.fillRect(windowX, windowY, 13, 16);
    }
    context.fillStyle = '#80523d'; context.fillRect(x + width / 2 - 10, y + height - 31, 20, 31);
  });
  text('MIASTO', 520, 354, 18, '#fffbea', 'center');
}

function drawTarget(target) {
  const flash = game.targetHitFlash > game.elapsed;
  if (target.type === 'cage') {
    roundRect(target.x - 38, target.y - 52, 76, 70, 7, flash ? '#fff3a6' : '#8d765c', '#443b34', 4);
    context.strokeStyle = '#ddd1b9'; context.lineWidth = 4; for (let x = -25; x <= 25; x += 16) { context.beginPath(); context.moveTo(target.x + x, target.y - 47); context.lineTo(target.x + x, target.y + 15); context.stroke(); }
    context.fillStyle = '#8dd4c6'; context.beginPath(); context.ellipse(target.x, target.y - 7, 20, 15, 0, 0, Math.PI * 2); context.fill();
  } else if (target.type === 'ship') {
    const sinking = target.destroyedAt ? Math.min(1, (game.elapsed - target.destroyedAt) / SHIP_SINK_DURATION) : 0;
    const burning = target.hits <= 2 || sinking > 0;
    context.save();
    context.translate(0, sinking * 118);
    context.translate(target.x, target.y + 25);
    context.rotate(sinking * .22);
    context.translate(-target.x, -target.y - 25);
    context.fillStyle = flash ? '#f69f56' : '#754e3d'; context.beginPath(); context.moveTo(target.x - 74, target.y + 23); context.lineTo(target.x + 65, target.y + 23); context.lineTo(target.x + 42, target.y + 48); context.lineTo(target.x - 48, target.y + 48); context.closePath(); context.fill();
    context.fillStyle = '#e9d8ae'; context.beginPath(); context.moveTo(target.x - 5, target.y + 21); context.lineTo(target.x - 5, target.y - 78); context.lineTo(target.x + 55, target.y - 7); context.closePath(); context.fill(); context.strokeStyle = '#5c4237'; context.lineWidth = 5; context.beginPath(); context.moveTo(target.x - 5, target.y + 25); context.lineTo(target.x - 5, target.y - 82); context.stroke();
    if (burning) { drawFlames(target.x - 24, target.y + 13, 17); drawFlames(target.x + 19, target.y + 19, 13); }
    context.restore();
  } else {
    context.fillStyle = flash ? '#f5ffff' : '#c3eff6'; context.beginPath(); context.moveTo(target.x - 60, target.y + 45); context.lineTo(target.x - 42, target.y - 54); context.lineTo(target.x, target.y - 94); context.lineTo(target.x + 54, target.y - 45); context.lineTo(target.x + 72, target.y + 45); context.closePath(); context.fill(); context.strokeStyle = '#71b6cc'; context.lineWidth = 4; context.stroke();
    context.fillStyle = '#d7f8ff'; context.beginPath(); context.ellipse(target.x, target.y - 10, 27, 33, 0, 0, Math.PI * 2); context.fill(); context.fillStyle = '#587fa5'; context.beginPath(); context.arc(target.x + 9, target.y - 18, 4, 0, Math.PI * 2); context.fill();
  }
}

function drawProjectiles() {
  game.plasma.forEach((shot) => { context.fillStyle = '#7c3a90'; context.beginPath(); context.ellipse(shot.x, shot.y, 13, 8, Math.PI / 4, 0, Math.PI * 2); context.fill(); context.fillStyle = '#b16cc2'; context.beginPath(); context.arc(shot.x, shot.y, 4, 0, Math.PI * 2); context.fill(); });
  game.projectiles.forEach((shot) => {
    context.save(); context.translate(shot.x, shot.y); context.rotate(Math.atan2(shot.vy, shot.vx));
    if (shot.type === 'net') { context.strokeStyle = '#24212a'; context.lineWidth = 3; context.strokeRect(-16, -16, 32, 32); context.beginPath(); context.moveTo(-16, -16); context.lineTo(16, 16); context.moveTo(16, -16); context.lineTo(-16, 16); context.stroke(); }
    else { context.strokeStyle = '#50c96d'; context.lineWidth = shot.type === 'spear' ? 5 : 3; context.beginPath(); context.moveTo(-12, 0); context.lineTo(13, 0); context.stroke(); context.fillStyle = '#48b762'; context.beginPath(); context.moveTo(15, 0); context.lineTo(8, -5); context.lineTo(8, 5); context.closePath(); context.fill(); }
    context.restore();
  });
}

function drawHud() {
  roundRect(22, 20, 245, 57, 16, '#fffdf0e8');
  text(`PLANSZA ${game.level.id}/6`, 39, 43, 17, '#3d7185');
  for (let i = 0; i < 3; i++) { context.fillStyle = i < game.health ? '#ef6b5b' : '#d5d9d4'; context.font = '27px sans-serif'; context.fillText('♥', 40 + i * 29, 68); }
  if (game.target) { roundRect(835, 20, 261, 57, 16, '#fffdf0e8'); text('CEL', 853, 43, 15, '#3d7185'); text(`${game.target.hits}/${game.target.maxHits}`, 853, 68, 22, '#ef6b4c'); }
  if (game.messageUntil > game.elapsed) { roundRect(340, 18, 440, 40, 16, '#ffffffdb'); text(game.message, 560, 44, 16, '#275468', 'center'); }
}

function draw() {
  if (!game) { context.fillStyle = '#8bd6f2'; context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT); return; }
  drawBackground(game.level.theme);
  if (game.level.mode === 'ground') {
    drawCity();
    if (!game.player.egg) {
      context.fillStyle = '#f4e5b8'; context.beginPath(); context.ellipse(game.level.eggX, GROUND_Y - 19, 13, 19, 0, 0, Math.PI * 2); context.fill(); context.strokeStyle = '#d69874'; context.stroke();
    }
    drawTree(990, GROUND_Y - 5, 1.5); text('LAS', 990, GROUND_Y - 132, 16, '#fffbea', 'center'); drawBoyFromDrawing(game.player.x, game.player.y);
  } else {
    const onWater = game.level.theme === 'ocean' || game.level.theme === 'ice';
    game.hunters.filter((hunter) => hunter.active).forEach((hunter) => drawHunterFromDrawing(hunter.x, onWater)); game.sinkingBoats.forEach(drawSinkingBoat); game.launchers.filter((launcher) => launcher.active).forEach((launcher) => drawLauncher(launcher.x)); if (game.target) drawTarget(game.target); drawDragon(game.player.x, game.player.y, performance.now() < game.invulnerableUntil);
  }
  drawProjectiles(); drawHud();
}

function loop(now) { const dt = Math.min(34, now - lastTime || 16); lastTime = now; update(dt, now); draw(); requestAnimationFrame(loop); }

function preloadDrawings() {
  Object.entries(drawingPaths).forEach(([name, path]) => {
    const image = new Image();
    image.onload = () => { drawings[name] = name === 'characters' ? removeChromaKey(image) : image; };
    image.src = path;
  });
}

function removeChromaKey(image) {
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = image.naturalWidth;
  spriteCanvas.height = image.naturalHeight;
  const spriteContext = spriteCanvas.getContext('2d');
  spriteContext.drawImage(image, 0, 0);
  const pixels = spriteContext.getImageData(0, 0, spriteCanvas.width, spriteCanvas.height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const red = pixels.data[index];
    const green = pixels.data[index + 1];
    const blue = pixels.data[index + 2];
    const pinkness = (red + blue) / 2 - green;
    if (red > 175 && blue > 145 && pinkness > 115) pixels.data[index + 3] = 0;
  }
  spriteContext.putImageData(pixels, 0, 0);
  return spriteCanvas;
}

preloadDrawings();

loadLevels().then((loadedLevels) => { levels = loadedLevels; showOverlay('menu'); requestAnimationFrame(loop); }).catch(() => { overlay.innerHTML = '<div class="panel"><h2>Nie udało się uruchomić gry.</h2><p>Odśwież stronę i spróbuj ponownie.</p></div>'; });
