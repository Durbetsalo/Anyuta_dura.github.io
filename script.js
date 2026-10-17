// ==========================================
// 1. АУДИОПЛЕЕР & ПЛЕЙЛИСТ
// ==========================================
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

    Array.from(playlistTracks.children).forEach((button, index) => {
        const active = index === currentTrackIndex;
        button.classList.toggle('active', active);
        button.querySelector('.playlist-track-icon').textContent = active && playing ? '❚❚' : '►';
    });
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

// ==========================================
// 2. СЕКРЕТ И ТЕРМИНАЛ
// ==========================================
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

// ==========================================
// 3. CANVAS: 2D ПЫЛЬ -> 3D СИНГУЛЯРНОСТЬ
// ==========================================
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let width, height, hw, hh;
let holeMode = false;
let holeTransition = 0; // 0..1 плавное нарастание черной дыры

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    hw = width / 2;
    hh = height / 2;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Базовые частицы фонового режима
const baseParticles = Array.from({ length: 50 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 0.5,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: (Math.random() - 0.5) * 0.4,
    opacity: Math.random() * 0.5 + 0.2
}));

// Конфигурация 3D Сингулярности (из black_hole)
const isMobile = window.innerWidth < 768;
const DISK_PARTICLES = isMobile ? 1800 : 3800;
const SPHERE_PARTICLES = isMobile ? 400 : 900;
const TOTAL_BH_PARTICLES = DISK_PARTICLES + SPHERE_PARTICLES;
const HORIZON_RADIUS = isMobile ? 65 : 85;

// Символы аккреционного диска (Bad Things / Grunge / Cyber)
const bhChars = "†★✖◈ᛟ◬☠⛓01!?".split('');
const bhCharsLen = bhChars.length;

const fontCache = new Array(61);
for (let i = 0; i <= 60; i++) {
    fontCache[i] = `bold ${i}px 'Consolas', 'Courier New', monospace`;
}

// Палитра сайта: Циан, Неоновый красный, Белый, Пурпурный
function getAccretionColor(dist) {
    if (dist < 35) return '#ff3b5c';      // внутренний горячий обод
    if (dist < 110) return '#00f0ff';     // основной циан
    if (dist < 180) return '#ffffff';     // фотонные всплески
    return '#8b5cf6';                     // дальнее гравитационное свечение
}

const bhParticles = [];
const bhRenderPool = new Array(TOTAL_BH_PARTICLES);
for (let i = 0; i < TOTAL_BH_PARTICLES; i++) {
    bhRenderPool[i] = { x: 0, y: 0, z: 0, char: '', color: '', alpha: 1, font: '' };
}

// Генерация диска
for (let i = 0; i < DISK_PARTICLES; i++) {
    const r = HORIZON_RADIUS + 12 + Math.random() * (isMobile ? 240 : 380);
    const dist = r - HORIZON_RADIUS;
    bhParticles.push({
        r: r,
        dist: dist,
        angle: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * Math.max(0, (400 - r) / 25) * 14,
        speed: Math.sqrt(280 / r),
        char: bhChars[(Math.random() * bhCharsLen) | 0],
        type: 0,
        color: getAccretionColor(dist)
    });
}

// Генерация сферы горизонта событий
for (let i = 0; i < SPHERE_PARTICLES; i++) {
    bhParticles.push({
        r: HORIZON_RADIUS + Math.random() * 8,
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(2 * Math.random() - 1),
        char: bhChars[(Math.random() * bhCharsLen) | 0],
        type: 1,
        color: '#ff3b5c'
    });
}

// Вращение мышью / тачем
let targetRotX = 0.35, targetRotY = 0.6;
let rotX = 0.35, rotY = 0.6;
let isDragging = false;
let prevX = 0, prevY = 0;

function startDrag(x, y) {
    if (!holeMode) return;
    isDragging = true; prevX = x; prevY = y;
}
function moveDrag(x, y) {
    if (isDragging && holeMode) {
        const sens = isMobile ? 0.007 : 0.004;
        targetRotY += (x - prevX) * sens;
        targetRotX += (y - prevY) * sens;
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

let timeOffset = 0;

function animate() {
    requestAnimationFrame(animate);

    if (!holeMode) {
        // Обычный фоновый режим
        ctx.fillStyle = '#08090c';
        ctx.fillRect(0, 0, width, height);

        baseParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        return;
    }

    // РЕЖИМ СИНГУЛЯРНОСТИ (BLACK HOLE)
    if (holeTransition < 1) holeTransition = Math.min(1, holeTransition + 0.015);
    timeOffset += 0.05;

    // Шлейф и темнота космоса
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(5, 4, 10, 0.42)';
    ctx.fillRect(0, 0, width, height);

    // Вращение диска
    rotX += (targetRotX - rotX) * 0.08;
    rotY += (targetRotY - rotY) * 0.08;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    let activeCount = 0;

    for (let i = 0; i < TOTAL_BH_PARTICLES; i++) {
        const p = bhParticles[i];
        let x, y, z;

        if (p.type === 0) {
            p.angle -= p.speed * 0.018;
            x = Math.cos(p.angle) * p.r * holeTransition;
            y = (p.y + Math.sin(timeOffset + p.r * 0.06) * 3) * holeTransition;
            z = Math.sin(p.angle) * p.r * holeTransition;
        } else {
            p.theta -= 0.035;
            x = p.r * Math.sin(p.phi) * Math.cos(p.theta) * holeTransition;
            y = p.r * Math.sin(p.phi) * Math.sin(p.theta) * holeTransition;
            z = p.r * Math.cos(p.phi) * holeTransition;
        }

        // 3D вращение
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const zDist = z2 + 500;
        if (zDist < 10) continue;

        const scale = 800 / zDist;
        const glitch = (Math.random() > 0.992) ? (Math.random() - 0.5) * 16 : 0;
        const screenX = hw + x1 * scale + glitch;
        const screenY = hh + y1 * scale;

        if (screenX < -25 || screenX > width + 25 || screenY < -25 || screenY > height + 25) continue;

        let alpha = scale * 0.85;
        if (alpha > 1) alpha = 1;
        if (p.type === 0 && p.dist > 90) {
            alpha = Math.max(0.05, alpha - (p.dist / 380));
        }

        let fontSize = (13 * scale) | 0;
        if (fontSize < 4) fontSize = 4;
        else if (fontSize > 60) fontSize = 60;

        const item = bhRenderPool[activeCount++];
        item.x = screenX;
        item.y = screenY;
        item.z = z2;
        item.char = (Math.random() > 0.99) ? bhChars[(Math.random() * bhCharsLen) | 0] : p.char;
        item.color = p.color;
        item.alpha = ((alpha * 10) | 0) / 10;
        item.font = fontCache[fontSize];
    }

    const renderList = bhRenderPool.slice(0, activeCount);
    renderList.sort((a, b) => b.z - a.z);

    // Отрисовка центрального горизонта
    const cz1 = 0;
    const centerScale = 800 / 500;
    const centerX = hw;
    const centerY = hh + (0 * cosX - cz1 * sinX) * centerScale;
    const horizonSize = HORIZON_RADIUS * centerScale * holeTransition;

    let lastFont = null, lastColor = null, lastAlpha = null;
    let i = 0;

    // 1. Отрисовка задних частиц (за сингулярностью)
    while (i < activeCount && renderList[i].z > 0) {
        const item = renderList[i];
        if (lastFont !== item.font) { ctx.font = item.font; lastFont = item.font; }
        if (lastColor !== item.color) { ctx.fillStyle = item.color; lastColor = item.color; }
        if (lastAlpha !== item.alpha) { ctx.globalAlpha = item.alpha; lastAlpha = item.alpha; }
        ctx.fillText(item.char, item.x, item.y);
        i++;
    }

    // 2. Внешнее аккреционное свечение
    ctx.globalAlpha = 1;
    const glow = ctx.createRadialGradient(centerX, centerY, horizonSize * 0.4, centerX, centerY, horizonSize * 1.9);
    glow.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    glow.addColorStop(0.3, 'rgba(255, 59, 92, 0.35)');
    glow.addColorStop(0.7, 'rgba(139, 92, 246, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, horizonSize * 1.9, 0, Math.PI * 2);
    ctx.fill();

    // 3. Чёрное ядро сингулярности (абсолютная пустота)
    ctx.fillStyle = '#020205';
    ctx.beginPath();
    ctx.arc(centerX, centerY, horizonSize * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // 4. Тонкое фотонное кольцо
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 5. Отрисовка передних частиц (перед сингулярностью)
    while (i < activeCount) {
        const item = renderList[i];
        if (lastFont !== item.font) { ctx.font = item.font; lastFont = item.font; }
        if (lastColor !== item.color) { ctx.fillStyle = item.color; lastColor = item.color; }
        if (lastAlpha !== item.alpha) { ctx.globalAlpha = item.alpha; lastAlpha = item.alpha; }
        ctx.fillText(item.char, item.x, item.y);
        i++;
    }

    // Случайные фотонные вспышки в космосе
    if (Math.random() > 0.5) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = Math.random() > 0.5 ? '#ff3b5c' : '#00f0ff';
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
}

animate();

// ==========================================
// 4. ТРИГГЕР ЗАСАСЫВАНИЯ
// ==========================================
const secretInput = document.getElementById('secretInput');
let blackHoleTriggered = false;

secretInput.addEventListener('input', () => {
    if (blackHoleTriggered) return;
    if (secretInput.value.trim().toLowerCase() === 'черная дыра') {
        triggerBlackHole();
    }
});

function triggerBlackHole() {
    blackHoleTriggered = true;
    document.body.style.overflow = 'hidden';
    secretInput.disabled = true;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const targets = document.querySelectorAll(
        '.container header, ' +
        '.container .quote-box, ' +
        '.container .card, ' +
        '.container .terminal-box, ' +
        '.container .playlist-widget, ' +
        '.container footer'
    );

    // Кинематографичное затягивание интерфейса в воронку
    targets.forEach(el => {
        const rect = el.getBoundingClientRect();
        const originX = centerX - rect.left;
        const originY = centerY - rect.top;
        const rotations = 360 * (2 + Math.floor(Math.random() * 3));
        const duration = 1.6 + Math.random() * 0.9;
        const delay = Math.random() * 0.4;

        el.classList.add('suck-element');
        el.style.transformOrigin = `${originX}px ${originY}px`;
        el.style.transitionDuration = `${duration}s`;
        el.style.transitionDelay = `${delay}s`;

        requestAnimationFrame(() => {
            el.style.transform = `rotate(${rotations}deg) scale(0)`;
            el.style.opacity = '0';
            el.style.filter = 'brightness(3) blur(4px)';
        });
    });

    // Активируем режим Canvas 3D Чёрной дыры
    setTimeout(() => {
        holeMode = true;

        // Показываем футуристичный HUD статус и подсказку
        const hud = document.createElement('div');
        hud.className = 'singularity-hud';
        hud.innerHTML = `
            <div class="hud-title">EVENT_HORIZON // ANYUTA</div>
            <div class="hud-sub">SINGULARITY ACTIVE // КРУТИ И ЗАЖИМАЙ ЭКРАН</div>
        `;
        document.body.append(hud);
    }, 1400);
}
