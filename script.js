const audio = document.getElementById('bgAudio');
const audioBtn = document.getElementById('audioToggle');
const currentTrackEl = document.getElementById('currentTrack');
const playlistStatus = document.getElementById('playlistStatus');
const playlistTracks = document.getElementById('playlistTracks');
const trackCounter = document.getElementById('trackCounter');
const prevTrackBtn = document.getElementById('prevTrack');
const nextTrackBtn = document.getElementById('nextTrack');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const trackDurationEl = document.getElementById('trackDuration');

const tracks = [
    { title: 'Bridgeburner', subtitle: 'Bad Things OST', src: 'music/Bad Things OST - Bridgeburner - 14-2208107384.mp3' },
    { title: 'Evening', subtitle: 'Bad Things OST', src: 'music/Bad Things OST - Evening - 17-2208109511.mp3' },
    { title: 'Fighter', subtitle: 'Bad Things OST', src: 'music/Bad Things OST - Fighter - 3-2208102146.mp3' },
    { title: 'Ivans Song', subtitle: 'Bad Things OST', src: 'music/Bad Things OST - Ivans Song - 18-2208110267.mp3' },
    { title: 'Malignant', subtitle: 'Bad Things OST', src: 'music/Bad Things OST - Malignant - 7-2208105479.mp3' },
    { title: 'Lockers', subtitle: 'Bad Things OST', src: 'music/tmpscdl_0f49dhvetmp5e71vmdwBad_Things_OST_Lockers_4_2208103838.mp3' },
    { title: 'Saint Augustine', subtitle: 'Bad Things OST', src: 'music/tmpscdl_1s1_6savtmpele7xx3_Bad_Things_OST_Saint_Augustine_8.mp3' },
    { title: 'Shortwave', subtitle: 'Bad Things OST', src: 'music/tmpscdl_2ex3_80qtmpdzc5bezyBad_Things_OST_Shortwave_2_2208101723.mp3' },
    { title: 'watch out, here i', subtitle: 'Bad Things OST', src: 'music/tmpscdl_572apvo_tmpm50tria2Bad_Things_OST_watch_out,_here_i.mp3' },
    { title: 'there it goes', subtitle: 'Bad Things OST', src: 'music/tmpscdl_6zl4b13ctmpx0nw48p_Bad_Things_OST_there_it_goes_6_2208104267.mp3' },
    { title: 'No More Running', subtitle: 'Bad Things OST', src: 'music/tmpscdl_8m3_r0bttmpinneju2zBad_Things_OST_No_More_Running_15.mp3' },
    { title: 'made by Andrew', subtitle: 'Bad Things OST', src: 'music/tmpscdl_9f8l6t44tmphvasxgj7Bad_Things_OST_made_by_Andrew_13.mp3' },
    { title: 'Bloody Knuckles', subtitle: 'Bad Things OST', src: 'music/tmpscdl_drtpgy7ctmpwuyj8okbBad_Things_OST_Bloody_Knuckles_12.mp3' },
    { title: 'aaaaaannnnnndrreeeeewwwww', subtitle: 'Bad Things OST', src: 'music/tmpscdl_gydiju2xtmp4bes8vaaBad_Things_OST_aaaaaannnnnndrreeeeewwwww.mp3' },
    { title: 'X80', subtitle: 'Bad Things OST', src: 'music/tmpscdl_hcgz7mytmpl0964eygBad_Things_OST_X80_16_2208109250.mp3' },
    { title: 'Picking Scabs', subtitle: 'Bad Things OST', src: 'music/tmpscdl_mbrzv1notmp05_7mj29Bad_Things_OST_Picking_Scabs_1_2208101420.mp3' },
    { title: 'there it is', subtitle: 'Bad Things OST', src: 'music/tmpscdl_tnruc1b9tmpt9iv1uz8Bad_Things_OST_there_it_is_5_2208104021.mp3' },
    { title: 'Hes Here', subtitle: 'Bad Things OST', src: 'music/tmpscdl_yuoopwi3tmpd2fk1hcqBad_Things_OST_Hes_Here_9_2208105896.mp3' }
];

let currentTrackIndex = 0;
let playbackRequest = 0;
let isSeeking = false;

function formatTrackNumber(n) { return String(n).padStart(2, '0'); }
function formatTime(s) {
    if (!isFinite(s) || s < 0) return '00:00';
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function renderPlaylist() {
    playlistTracks.replaceChildren();
    tracks.forEach((track, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'playlist-track';
        btn.innerHTML = `
            <span class="playlist-track-number">${formatTrackNumber(index + 1)}</span>
            <span class="playlist-track-info">
                <span class="playlist-track-title">${track.title}</span>
                <span class="playlist-track-subtitle">${track.subtitle}</span>
            </span>
            <span class="playlist-track-icon">►</span>
        `;
        btn.addEventListener('click', () => {
            if (index === currentTrackIndex) toggleAudio();
            else selectTrack(index, true);
        });
        playlistTracks.append(btn);
    });
    updatePlaylist();
}

function updatePlaylist() {
    const playing = !audio.paused && !audio.ended;
    currentTrackEl.textContent = tracks[currentTrackIndex].title;
    trackCounter.textContent = `${formatTrackNumber(currentTrackIndex + 1)} / ${formatTrackNumber(tracks.length)}`;
    audioBtn.textContent = playing ? '❚❚ ПАУЗА' : '► ВКЛЮЧИТЬ';
    audioBtn.style.borderColor = playing ? 'var(--accent-cyan)' : 'var(--accent-red)';
    audioBtn.style.color = playing ? 'var(--accent-cyan)' : 'var(--accent-red)';
    playlistStatus.textContent = playing ? 'ВОСПРОИЗВЕДЕНИЕ' : 'ОЖИДАНИЕ';
    playlistStatus.classList.toggle('is-playing', playing);

    const children = playlistTracks.children;
    for (let i = 0; i < children.length; i++) {
        const active = i === currentTrackIndex;
        children[i].classList.toggle('active', active);
        children[i].querySelector('.playlist-track-icon').textContent = active && playing ? '❚❚' : '►';
    }
}

function updateProgress() {
    if (isSeeking) return;
    progressBar.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    trackDurationEl.textContent = formatTime(audio.duration);
}

async function playCurrentTrack() {
    const req = ++playbackRequest;
    try {
        await audio.play();
        if (req === playbackRequest) updatePlaylist();
    } catch (e) {
        if (req !== playbackRequest || e.name === 'AbortError') return;
        updatePlaylist();
        playlistStatus.textContent = 'ОШИБКА АУДИО';
    }
}

function selectTrack(index, autoplay = false) {
    playbackRequest++;
    audio.pause();
    currentTrackIndex = (index + tracks.length) % tracks.length;
    audio.src = tracks[currentTrackIndex].src;
    audio.load();
    progressBar.value = 0;
    currentTimeEl.textContent = '00:00';
    trackDurationEl.textContent = '00:00';
    updatePlaylist();
    if (autoplay) playCurrentTrack();
}

function toggleAudio() {
    if (audio.paused) playCurrentTrack();
    else { playbackRequest++; audio.pause(); updatePlaylist(); }
}

audioBtn.addEventListener('click', toggleAudio);
prevTrackBtn.addEventListener('click', () => selectTrack(currentTrackIndex - 1, true));
nextTrackBtn.addEventListener('click', () => selectTrack(currentTrackIndex + 1, true));
progressBar.addEventListener('input', () => {
    if (!audio.duration) return;
    isSeeking = true;
    currentTimeEl.textContent = formatTime((progressBar.value / 100) * audio.duration);
});
progressBar.addEventListener('change', () => {
    if (!audio.duration) { isSeeking = false; return; }
    audio.currentTime = (progressBar.value / 100) * audio.duration;
    isSeeking = false;
    updateProgress();
});
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', updateProgress);
audio.addEventListener('play', updatePlaylist);
audio.addEventListener('pause', updatePlaylist);
audio.addEventListener('ended', () => selectTrack(currentTrackIndex + 1, true));

renderPlaylist();
selectTrack(0);

const messages = [
    '> Сканирование данных... найдена Анюта',
    '> Мне с тобой очень хорошо',
    '> спасибо за все, свинка'
];
let msgIdx = 0;
let typingTimeout;

function revealSecret() {
    const el = document.getElementById('typewriter');
    clearTimeout(typingTimeout);
    el.textContent = '';
    let charIndex = 0;
    const fullText = messages[msgIdx % messages.length];
    msgIdx++;

    function typeChar() {
        if (charIndex < fullText.length) {
            el.textContent += fullText.charAt(charIndex);
            charIndex++;
            typingTimeout = setTimeout(typeChar, 35);
        }
    }
    typeChar();
}

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let width, height, hw, hh;
let cosmicMode = null;
let holeTransition = 0;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    hw = width * 0.5;
    hh = height * 0.5;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const ambientParticles = Array.from({ length: 42 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 0.6,
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: (Math.random() - 0.5) * 0.35,
    opacity: Math.random() * 0.4 + 0.15
}));

const isMobile = window.innerWidth < 768;
const DISK_PARTICLES = isMobile ? 1200 : 2600;
const INNER_WARP_PARTICLES = isMobile ? 180 : 380;
const TOTAL_BH_PARTICLES = DISK_PARTICLES + INNER_WARP_PARTICLES;
const HORIZON_RADIUS = isMobile ? 70 : 92;

const drainChars = "†★✖💔🕷☠⛓🦇!?◈ᛟ".split('');
const drainCharsLen = drainChars.length;

const fontCache = new Array(65);
for (let i = 0; i <= 64; i++) {
    fontCache[i] = `bold ${i}px monospace`;
}

const bhParticles = [];
const bhRenderList = [];

const NUM_ARMS = 3;
const SPIRAL_WINDING = 2.4;

for (let i = 0; i < DISK_PARTICLES; i++) {
    const norm = Math.pow(Math.random(), 1.6);
    const maxDist = isMobile ? 260 : 420;
    const dist = 14 + norm * maxDist;
    const r = HORIZON_RADIUS + dist;
    const armIndex = i % NUM_ARMS;
    const armAngle = armIndex * (Math.PI * 2 / NUM_ARMS);
    const spiralAngle = Math.log(dist + 1) * SPIRAL_WINDING;
    const dispersion = (Math.random() - 0.5) * 0.45;
    const angle = armAngle + spiralAngle + dispersion;
    const flare = dist / maxDist;
    const yDisp = (Math.random() - 0.5) * (8 + flare * 28);

    bhParticles.push({
        r: r,
        dist: dist,
        angle: angle,
        y: yDisp,
        speed: Math.sqrt(340 / r) * 0.022,
        char: drainChars[(Math.random() * drainCharsLen) | 0],
        type: 0,
        baseHue: dist < 45 ? 0 : (dist < 140 ? 1 : (dist < 260 ? 2 : 3))
    });
}

for (let i = 0; i < INNER_WARP_PARTICLES; i++) {
    bhParticles.push({
        r: HORIZON_RADIUS + Math.random() * 4.5,
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(2 * Math.random() - 1),
        speed: 0.045 + Math.random() * 0.02,
        char: drainChars[(Math.random() * drainCharsLen) | 0],
        type: 1
    });
}

for (let i = 0; i < TOTAL_BH_PARTICLES; i++) {
    bhRenderList.push({ x: 0, y: 0, z: 0, char: '', color: '', alpha: 1, font: '' });
}

const PIG_DISK_COUNT = isMobile ? 1100 : 2200;
const PIG_BODY_COUNT = isMobile ? 800 : 1500;
const PIG_JET_COUNT = isMobile ? 260 : 550;
const TOTAL_PIG_PARTICLES = PIG_DISK_COUNT + PIG_BODY_COUNT + PIG_JET_COUNT;

const pigChars = "★♥♡✧✦🌸🐽✨❀🐾☽*･ﾟ".split('');
const pigCharsLen = pigChars.length;
const pigColors = ['#ffffff', '#00f0ff', '#ffb7c5', '#ff9ebb', '#ff69b4', '#e0bbff', '#d8bfd8'];

const pigParticles = [];
const pigRenderList = [];

for (let i = 0; i < PIG_DISK_COUNT; i++) {
    const norm = Math.pow(Math.random(), 1.4);
    const dist = 35 + norm * (isMobile ? 260 : 420);
    const r = HORIZON_RADIUS * 0.85 + dist;
    const arm = i % 4;
    const angle = (arm * Math.PI * 0.5) + Math.log(dist + 1) * 2.2 + (Math.random() - 0.5) * 0.4;
    const yDisp = (Math.random() - 0.5) * (10 + (dist / 400) * 35);
    pigParticles.push({
        category: 0,
        r: r,
        dist: dist,
        angle: angle,
        y: yDisp,
        speed: Math.sqrt(300 / r) * 0.02,
        char: pigChars[(Math.random() * pigCharsLen) | 0],
        color: pigColors[(Math.random() * pigColors.length) | 0]
    });
}

for (let i = 0; i < PIG_BODY_COUNT; i++) {
    const subType = Math.random();
    let bx = 0, by = 0, bz = 0, bColor = '#ffb7c5', bSize = 10;

    if (subType < 0.6) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const rad = Math.cbrt(Math.random()) * 65;
        bx = rad * Math.sin(ph) * Math.cos(th) * 1.15;
        by = rad * Math.sin(ph) * Math.sin(th) * 0.95;
        bz = rad * Math.cos(ph) * 1.05;
        bColor = (Math.random() > 0.4) ? '#ff9ebb' : '#ffb7c5';
    } else if (subType < 0.76) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const u = Math.random();
        bx = (side * 44) + (Math.random() - 0.5) * 22 * (1 - u);
        by = -48 - u * 30;
        bz = 18 + (Math.random() - 0.5) * 16;
        bColor = '#ff69b4';
    } else if (subType < 0.90) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const rad = Math.cbrt(Math.random()) * 26;
        bx = rad * Math.sin(ph) * Math.cos(th) * 1.25;
        by = 10 + rad * Math.sin(ph) * Math.sin(th) * 0.85;
        bz = 54 + rad * Math.cos(ph) * 0.45;
        bColor = '#ff69b4';
    } else if (subType < 0.96) {
        const side = Math.random() > 0.5 ? 1 : -1;
        bx = side * 8 + (Math.random() - 0.5) * 5;
        by = 10 + (Math.random() - 0.5) * 9;
        bz = 66 + (Math.random() - 0.5) * 3;
        bColor = '#3a001a';
        bSize = 14;
    } else {
        const side = Math.random() > 0.5 ? 1 : -1;
        bx = side * 28 + (Math.random() - 0.5) * 7;
        by = -14 + (Math.random() - 0.5) * 7;
        bz = 56 + (Math.random() - 0.5) * 5;
        bColor = '#020005';
        bSize = 16;
    }

    pigParticles.push({
        category: 1,
        bx: bx,
        by: by,
        bz: bz,
        baseSize: bSize,
        char: pigChars[(Math.random() * pigCharsLen) | 0],
        color: bColor
    });
}

for (let i = 0; i < PIG_JET_COUNT; i++) {
    pigParticles.push({
        category: 2,
        dir: Math.random() > 0.5 ? 1 : -1,
        dist: Math.pow(Math.random(), 1.2) * (isMobile ? 260 : 420),
        speed: 1.6 + Math.random() * 2.8,
        offsetTh: Math.random() * Math.PI * 2,
        char: pigChars[(Math.random() * pigCharsLen) | 0],
        color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#00f0ff' : '#e0bbff')
    });
}

for (let i = 0; i < TOTAL_PIG_PARTICLES; i++) {
    pigRenderList.push({ x: 0, y: 0, z: 0, char: '', color: '', alpha: 1, font: '' });
}

const orbitPhrasesText = [
    "Анюта хрюша",
    "милейшая свинка",
    "самая лучшая хрюшка",
    "моя свинка",
    "хрю-хрю",
    "космическая свинка ♥",
    "хрюшка Анюта",
    "любимая свинка",
    "хрю-хрю ✨"
];

const orbitPhrases = orbitPhrasesText.map((text, idx) => ({
    text: text,
    r: 160 + (idx * 34) + (Math.random() * 20),
    angle: (idx * (Math.PI * 2 / orbitPhrasesText.length)) + Math.random() * 0.4,
    speed: 0.007 + ((idx % 3) * 0.003),
    yDisp: (Math.random() - 0.5) * 80,
    color: ['#ffb7c5', '#ff9ebb', '#e0bbff', '#b3f5ff', '#ffffff', '#ffd1dc'][idx % 6]
}));

let targetRotX = 0.38, targetRotY = 0.52;
let rotX = 0.38, rotY = 0.52;
let isDragging = false;
let prevX = 0, prevY = 0;

function startDrag(x, y) {
    if (!cosmicMode) return;
    isDragging = true; prevX = x; prevY = y;
}
function moveDrag(x, y) {
    if (isDragging && cosmicMode) {
        const sens = isMobile ? 0.0055 : 0.0035;
        targetRotY += (x - prevX) * sens;
        targetRotX += (y - prevY) * sens;
        targetRotX = Math.max(-1.4, Math.min(1.4, targetRotX));
        prevX = x; prevY = y;
    }
}
function stopDrag() { isDragging = false; }

window.addEventListener('mousedown', e => startDrag(e.clientX, e.clientY));
window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
window.addEventListener('mouseup', stopDrag);
window.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
window.addEventListener('touchmove', e => moveDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
window.addEventListener('touchend', stopDrag);

function getDopplerColor(baseHue, vzNorm) {
    if (vzNorm > 0.45) return '#ffffff';
    if (vzNorm > 0.15) return '#00ffff';
    if (vzNorm > -0.15) {
        if (baseHue === 0) return '#00ffff';
        if (baseHue === 1) return '#ccff00';
        return '#ff00ff';
    }
    if (vzNorm > -0.45) return '#ff007f';
    return '#8a2be2';
}

let glitchCooldown = 0;
let glitchSlice = null;

function triggerMicroGlitch() {
    if (Math.random() < 0.012 && glitchCooldown <= 0) {
        glitchCooldown = 6;
        glitchSlice = {
            y: Math.random() * height,
            h: 15 + Math.random() * 40,
            shift: (Math.random() - 0.5) * 16
        };
    }
    if (glitchCooldown > 0) {
        glitchCooldown--;
        if (glitchCooldown === 0) glitchSlice = null;
    }
}

let time = 0;

function animate() {
    requestAnimationFrame(animate);

    if (!cosmicMode) {
        ctx.fillStyle = '#08090c';
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < ambientParticles.length; i++) {
            const p = ambientParticles[i];
            p.x += p.speedX; p.y += p.speedY;
            if (p.x < 0) p.x = width; else if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; else if (p.y > height) p.y = 0;
            ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        return;
    }

    if (holeTransition < 1) holeTransition = Math.min(1, holeTransition + 0.012);
    time += 0.02;

    rotX += (targetRotX - rotX) * 0.06;
    rotY += (targetRotY - rotY) * 0.06;

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    if (cosmicMode === 'blackhole') {
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(4, 0, 8, 0.45)';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let activeCount = 0;

        for (let i = 0; i < TOTAL_BH_PARTICLES; i++) {
            const p = bhParticles[i];
            let x, y, z, vx = 0, vz = 0;

            if (p.type === 0) {
                p.angle -= p.speed;
                x = Math.cos(p.angle) * p.r * holeTransition;
                y = (p.y + Math.sin(time * 2 + p.r * 0.04) * 2.5) * holeTransition;
                z = Math.sin(p.angle) * p.r * holeTransition;
                vx = -Math.sin(p.angle);
                vz = Math.cos(p.angle);
            } else {
                p.theta -= p.speed;
                x = p.r * Math.sin(p.phi) * Math.cos(p.theta) * holeTransition;
                y = p.r * Math.sin(p.phi) * Math.sin(p.theta) * holeTransition;
                z = p.r * Math.cos(p.phi) * holeTransition;
                vx = -Math.sin(p.theta);
                vz = Math.cos(p.theta);
            }

            const x1 = x * cosY - z * sinY;
            const z1 = x * sinY + z * cosY;
            const y1 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX;

            const zDist = z2 + 520;
            if (zDist < 15) continue;

            const scale = 800 / zDist;
            const screenX = hw + x1 * scale;
            const screenY = hh + y1 * scale;

            if (screenX < -30 || screenX > width + 30 || screenY < -30 || screenY > height + 30) continue;

            const vRotZ = (vx * sinY + vz * cosY) * cosX;
            let alpha = (scale * 0.7 + (vRotZ * 0.35)) * (p.type === 0 ? 0.9 : 0.6);
            if (p.type === 0 && p.dist > 100) {
                alpha *= Math.max(0.08, 1 - (p.dist / (isMobile ? 260 : 420)));
            }
            alpha = Math.max(0.05, Math.min(1, alpha));

            let fontSize = (12 * scale) | 0;
            fontSize = fontSize < 4 ? 4 : (fontSize > 60 ? 60 : fontSize);

            const item = bhRenderList[activeCount++];
            item.x = screenX;
            item.y = screenY;
            item.z = z2;
            item.char = (Math.random() > 0.994) ? drainChars[(Math.random() * drainCharsLen) | 0] : p.char;
            item.color = (p.type === 1) ? '#00ffff' : getDopplerColor(p.baseHue, vRotZ);
            item.alpha = ((alpha * 10) | 0) / 10;
            item.font = fontCache[fontSize];
        }

        bhRenderList.length = activeCount;
        bhRenderList.sort((a, b) => b.z - a.z);

        const centerScale = 800 / 520;
        const horizonSize = HORIZON_RADIUS * centerScale * holeTransition;

        let lastFont = null, lastColor = null, lastAlpha = null;
        let i = 0;

        while (i < activeCount && bhRenderList[i].z > 0) {
            const item = bhRenderList[i];
            if (lastFont !== item.font) { ctx.font = item.font; lastFont = item.font; }
            if (lastColor !== item.color) { ctx.fillStyle = item.color; lastColor = item.color; }
            if (lastAlpha !== item.alpha) { ctx.globalAlpha = item.alpha; lastAlpha = item.alpha; }
            ctx.fillText(item.char, item.x, item.y);
            i++;
        }

        ctx.globalAlpha = 1;
        const halo = ctx.createRadialGradient(hw, hh, horizonSize * 0.92, hw, hh, horizonSize * 1.35);
        halo.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
        halo.addColorStop(0.35, 'rgba(255, 0, 255, 0.2)');
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(hw, hh, horizonSize * 1.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#020005';
        ctx.beginPath();
        ctx.arc(hw, hh, horizonSize * 0.98, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 0;
        ctx.stroke();

        while (i < activeCount) {
            const item = bhRenderList[i];
            if (lastFont !== item.font) { ctx.font = item.font; lastFont = item.font; }
            if (lastColor !== item.color) { ctx.fillStyle = item.color; lastColor = item.color; }
            if (lastAlpha !== item.alpha) { ctx.globalAlpha = item.alpha; lastAlpha = item.alpha; }
            ctx.fillText(item.char, item.x, item.y);
            i++;
        }

        triggerMicroGlitch();
        if (glitchSlice) {
            const sliceData = ctx.getImageData(0, glitchSlice.y, width, glitchSlice.h);
            ctx.putImageData(sliceData, glitchSlice.shift, glitchSlice.y);
        }
    } else if (cosmicMode === 'pigquasar') {
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(10, 2, 14, 0.38)';
        ctx.fillRect(0, 0, width, height);

        const nebGrad = ctx.createRadialGradient(hw, hh, 40, hw, hh, Math.max(hw, hh));
        nebGrad.addColorStop(0, 'rgba(255, 105, 180, 0.12)');
        nebGrad.addColorStop(0.35, 'rgba(186, 85, 211, 0.08)');
        nebGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.04)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let activeCount = 0;
        const breathe = (1 + Math.sin(time * 3) * 0.04) * holeTransition;
        const maxJetDist = isMobile ? 260 : 420;

        for (let i = 0; i < TOTAL_PIG_PARTICLES; i++) {
            const p = pigParticles[i];
            let x = 0, y = 0, z = 0, fontSize = 11;

            if (p.category === 0) {
                p.angle -= p.speed;
                x = Math.cos(p.angle) * p.r * holeTransition;
                y = (p.y + Math.sin(time * 2.2 + p.r * 0.03) * 3) * holeTransition;
                z = Math.sin(p.angle) * p.r * holeTransition;
            } else if (p.category === 1) {
                x = p.bx * breathe;
                y = p.by * breathe;
                z = p.bz * breathe;
                fontSize = p.baseSize;
            } else {
                p.dist += p.speed;
                if (p.dist > maxJetDist) p.dist = 20;
                const curSpread = (p.dist / 420) * 36;
                const jAng = p.offsetTh + time * 1.5;
                x = Math.cos(jAng) * curSpread * holeTransition;
                y = p.dir * p.dist * holeTransition;
                z = Math.sin(jAng) * curSpread * holeTransition;
            }

            const x1 = x * cosY - z * sinY;
            const z1 = x * sinY + z * cosY;
            const y1 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX;

            const zDist = z2 + 520;
            if (zDist < 15) continue;

            const scale = 800 / zDist;
            const screenX = hw + x1 * scale;
            const screenY = hh + y1 * scale;

            if (screenX < -30 || screenX > width + 30 || screenY < -30 || screenY > height + 30) continue;

            let alpha = scale * 0.75;
            if (p.category === 0 && p.dist > 120) {
                alpha *= Math.max(0.1, 1 - (p.dist / maxJetDist));
            } else if (p.category === 2) {
                alpha *= (1 - p.dist / 420) * 1.2;
            }
            alpha = Math.max(0.08, Math.min(1, alpha));

            let scaledFontSize = (fontSize * scale) | 0;
            scaledFontSize = scaledFontSize < 4 ? 4 : (scaledFontSize > 60 ? 60 : scaledFontSize);

            const item = pigRenderList[activeCount++];
            item.x = screenX;
            item.y = screenY;
            item.z = z2;
            item.char = (Math.random() > 0.995) ? pigChars[(Math.random() * pigCharsLen) | 0] : p.char;
            item.color = p.color;
            item.alpha = ((alpha * 10) | 0) / 10;
            item.font = fontCache[scaledFontSize];
        }

        pigRenderList.length = activeCount;
        pigRenderList.sort((a, b) => b.z - a.z);

        let lastFont = null, lastColor = null, lastAlpha = null;
        for (let i = 0; i < activeCount; i++) {
            const item = pigRenderList[i];
            if (lastFont !== item.font) { ctx.font = item.font; lastFont = item.font; }
            if (lastColor !== item.color) { ctx.fillStyle = item.color; lastColor = item.color; }
            if (lastAlpha !== item.alpha) { ctx.globalAlpha = item.alpha; lastAlpha = item.alpha; }
            ctx.fillText(item.char, item.x, item.y);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < orbitPhrases.length; i++) {
            const ph = orbitPhrases[i];
            ph.angle -= ph.speed;
            const px = Math.cos(ph.angle) * ph.r * holeTransition;
            const py = (ph.yDisp + Math.sin(time + ph.r) * 12) * holeTransition;
            const pz = Math.sin(ph.angle) * ph.r * holeTransition;

            const px1 = px * cosY - pz * sinY;
            const pz1 = px * sinY + pz * cosY;
            const py1 = py * cosX - pz1 * sinX;
            const pz2 = py * sinX + pz1 * cosX;

            const pzDist = pz2 + 520;
            if (pzDist < 20) continue;

            const pScale = 800 / pzDist;
            const sX = hw + px1 * pScale;
            const sY = hh + py1 * pScale;

            if (sX < -150 || sX > width + 150 || sY < -50 || sY > height + 50) continue;

            let pFontSize = (13 * pScale) | 0;
            pFontSize = pFontSize < 8 ? 8 : (pFontSize > 22 ? 22 : pFontSize);

            ctx.font = `bold ${pFontSize}px monospace`;
            ctx.fillStyle = ph.color;
            ctx.globalAlpha = Math.max(0.15, Math.min(1, pScale * 0.85));
            ctx.fillText(ph.text, sX, sY);
        }

        ctx.globalAlpha = 1;
    }
}

animate();

const secretInput = document.getElementById('secretInput');
let cosmicTriggered = false;

secretInput.addEventListener('input', () => {
    if (cosmicTriggered) return;
    const val = secretInput.value.trim().toLowerCase();
    if (val === 'черная дыра') {
        triggerCosmicEvent('blackhole');
    } else if (val === 'ты свинка') {
        triggerCosmicEvent('pigquasar');
    }
});

function triggerCosmicEvent(mode) {
    cosmicTriggered = true;
    document.body.style.overflow = 'hidden';
    secretInput.disabled = true;

    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;

    const targets = document.querySelectorAll(
        '.container header, ' +
        '.container .quote-box, ' +
        '.container .card, ' +
        '.container .terminal-box, ' +
        '.container .playlist-widget, ' +
        '.container footer'
    );

    for (let i = 0; i < targets.length; i++) {
        const el = targets[i];
        const rect = el.getBoundingClientRect();
        const originX = centerX - rect.left;
        const originY = centerY - rect.top;
        const rotations = 360 * (2 + Math.floor(Math.random() * 2));
        const duration = 1.5 + Math.random() * 0.7;
        const delay = Math.random() * 0.3;

        el.classList.add('suck-element');
        el.style.transformOrigin = `${originX}px ${originY}px`;
        el.style.transitionDuration = `${duration}s`;
        el.style.transitionDelay = `${delay}s`;

        requestAnimationFrame(() => {
            el.style.transform = `rotate(${rotations}deg) scale(0)`;
            el.style.opacity = '0';
            el.style.filter = 'brightness(2.5) blur(3px)';
        });
    }

    setTimeout(() => {
        cosmicMode = mode;

        if (mode === 'blackhole') {
            const hud = document.createElement('div');
            hud.className = 'drain-hud';
            hud.innerHTML = `
                <div class="drain-badge">ты глянь какая черная дыра</div>
                <div class="drain-title">твои глаза и улыбка намного красивее этой черной дыры</div>
                <div class="drain-hint">дизайн вдохновлен из научной статьи</div>
            `;
            document.body.append(hud);
        } else if (mode === 'pigquasar') {
            const hud = document.createElement('div');
            hud.className = 'pig-hud';
            hud.innerHTML = `
                <div class="pig-badge">✦ КОСМИЧЕСКИЙ КВАЗАР ✦</div>
                <div class="pig-title">хрю хрю Аня</div>
                <div class="pig-hint">хрю-хрю сквозь пространство и время</div>
            `;
            document.body.append(hud);
        }
    }, 1300);
}
