const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    speedX: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.2
}));

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#08090c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    requestAnimationFrame(animate);
}

animate();

/* ===== ПЛЕЙЛИСТ // АУДИО ИЗ ПАПКИ music/ ===== */

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
    {
        title: 'Brigeburner',
        subtitle: 'Bad thigs OST',
        src: 'music/Bad Things OST - Bridgeburner - 14-2208107384.mp3'
    },
    
    {
        title: 'Тёмные коридоры',
        subtitle: 'Bad thigs OST',
        src: 'music/dark_corridors.mp3'
    },
    
    {
        title: 'Тёмные коридоры',
        subtitle: 'Bad thigs OST',
        src: 'music/dark_corridors.mp3'
    },
    
    {
        title: 'Наше воспоминание',
        subtitle: 'Bad thigs OST',
        src: 'music/our_memory.mp3'
    }
];

let currentTrackIndex = 0;
let playbackRequest = 0;
let isSeeking = false;

function formatTrackNumber(number) {
    return String(number).padStart(2, '0');
}

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) {
        return '00:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderPlaylist() {
    playlistTracks.replaceChildren();

    tracks.forEach((track, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'playlist-track';
        button.setAttribute('aria-label', `Включить: ${track.title}`);

        const number = document.createElement('span');
        number.className = 'playlist-track-number';
        number.textContent = formatTrackNumber(index + 1);

        const info = document.createElement('span');
        info.className = 'playlist-track-info';

        const title = document.createElement('span');
        title.className = 'playlist-track-title';
        title.textContent = track.title;

        const subtitle = document.createElement('span');
        subtitle.className = 'playlist-track-subtitle';
        subtitle.textContent = track.subtitle;

        const icon = document.createElement('span');
        icon.className = 'playlist-track-icon';
        icon.textContent = '►';
        icon.setAttribute('aria-hidden', 'true');

        info.append(title, subtitle);
        button.append(number, info, icon);

        button.addEventListener('click', () => {
            if (index === currentTrackIndex) {
                toggleAudio();
            } else {
                selectTrack(index, true);
            }
        });

        playlistTracks.append(button);
    });

    updatePlaylist();
}

function updatePlaylist() {
    const playing = !audio.paused && !audio.ended;

    currentTrackEl.textContent = tracks[currentTrackIndex].title;

    trackCounter.textContent =
        `${formatTrackNumber(currentTrackIndex + 1)} / ` +
        formatTrackNumber(tracks.length);

    audioBtn.textContent = playing ? '❚❚ ПАУЗА' : '► ВКЛЮЧИТЬ';

    audioBtn.style.borderColor = playing
        ? 'var(--accent-cyan)'
        : 'var(--accent-red)';

    audioBtn.style.color = playing
        ? 'var(--accent-cyan)'
        : 'var(--accent-red)';

    playlistStatus.textContent = playing
        ? 'ВОСПРОИЗВЕДЕНИЕ'
        : 'ОЖИДАНИЕ';

    playlistStatus.classList.toggle('is-playing', playing);

    Array.from(playlistTracks.children).forEach((button, index) => {
        const active = index === currentTrackIndex;

        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'true' : 'false');

        button.querySelector('.playlist-track-icon').textContent =
            active && playing ? '❚❚' : '►';
    });
}

function updateProgress() {
    if (isSeeking) {
        return;
    }

    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    } else {
        progressBar.value = 0;
    }

    currentTimeEl.textContent = formatTime(audio.currentTime);
    trackDurationEl.textContent = formatTime(audio.duration);
}

async function playCurrentTrack() {
    const requestId = ++playbackRequest;

    try {
        await audio.play();

        if (requestId === playbackRequest) {
            updatePlaylist();
        }
    } catch (error) {
        if (
            requestId !== playbackRequest ||
            error.name === 'AbortError'
        ) {
            return;
        }

        updatePlaylist();
        playlistStatus.textContent = 'ОШИБКА АУДИО';

        console.error('Ошибка воспроизведения:', error);

        alert(
            `Не удалось включить трек «${tracks[currentTrackIndex].title}». ` +
            `Проверь файл "${tracks[currentTrackIndex].src}" в папке music.`
        );
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

    if (autoplay) {
        playCurrentTrack();
    }
}

function toggleAudio() {
    if (audio.paused) {
        playCurrentTrack();
    } else {
        playbackRequest++;
        audio.pause();
        updatePlaylist();
    }
}

audioBtn.addEventListener('click', toggleAudio);

prevTrackBtn.addEventListener('click', () => {
    selectTrack(currentTrackIndex - 1, true);
});

nextTrackBtn.addEventListener('click', () => {
    selectTrack(currentTrackIndex + 1, true);
});

/* --- Перемотка --- */
progressBar.addEventListener('input', () => {
    if (!audio.duration) {
        return;
    }

    isSeeking = true;
    currentTimeEl.textContent =
        formatTime((progressBar.value / 100) * audio.duration);
});

progressBar.addEventListener('change', () => {
    if (!audio.duration) {
        isSeeking = false;
        return;
    }

    audio.currentTime = (progressBar.value / 100) * audio.duration;
    isSeeking = false;
    updateProgress();
});

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', updateProgress);

audio.addEventListener('play', updatePlaylist);
audio.addEventListener('pause', updatePlaylist);

audio.addEventListener('ended', () => {
    selectTrack(currentTrackIndex + 1, true);
});

renderPlaylist();
selectTrack(0);

/* ===== ТЕРМИНАЛ // ТАЙПИНГ ===== */

const messages = [
    '> Сканирование данных... Объект: Анюта.',
    '> Статус: Лучший напарник в Bad Things.',
    '> Сообщение: С тобой играть в 1000 раз круче, чем с любым NPC (даже с Иваном)! Спасибо, что ты есть ✨'
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
