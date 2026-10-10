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
        title: 'Evening',
        subtitle: 'Bad thigs OST',
        src: 'music/Bad Things OST - Evening - 17-2208109511.mp3'
    },
    
    {
        title: 'Fighter',
        subtitle: 'Bad thigs OST',
        src: 'music/Bad Things OST - Fighter - 3-2208102146.mp3'
    },

        {
        title: 'Ivans Song',
        subtitle: 'Bad thigs OST',
        src: 'music/Bad Things OST - Ivans Song - 18-2208110267.mp3'
    },

        {
        title: 'Malignant',
        subtitle: 'Bad thigs OST',
        src: 'music/Bad Things OST - Malignant - 7-2208105479.mp3'
    },

        {
        title: 'Lockers',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_0f49dhvetmp5e71vmdwBad_Things_OST_Lockers_4_2208103838.mp3'
    },

        {
        title: 'Saint Augustine',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_1s1_6savtmpele7xx3_Bad_Things_OST_Saint_Augustine_8.mp3'
    },

            {
        title: 'Shortwave',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_2ex3_80qtmpdzc5bezyBad_Things_OST_Shortwave_2_2208101723.mp3'
    },

            {
        title: 'watch out, here i',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_572apvo_tmpm50tria2Bad_Things_OST_watch_out,_here_i.mp3'
    },

            {
        title: 'there it goes',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_6zl4b13ctmpx0nw48p_Bad_Things_OST_there_it_goes_6_2208104267.mp3'
    },

            {
        title: 'No More Running',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_8m3_r0bttmpinneju2zBad_Things_OST_No_More_Running_15.mp3'
    },

            {
        title: 'made by Andrew',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_9f8l6t44tmphvasxgj7Bad_Things_OST_made_by_Andrew_13.mp3'
    },

            {
        title: 'Bloody Knuckles',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_drtpgy7ctmpwuyj8okbBad_Things_OST_Bloody_Knuckles_12.mp3'
    },

            {
        title: 'aaaaaannnnnndrreeeeewwwww',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_gydiju2xtmp4bes8vaaBad_Things_OST_aaaaaannnnnndrreeeeewwwww.mp3'
    },

            {
        title: 'X80_16',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_hcgz7mytmpl0964eygBad_Things_OST_X80_16_2208109250.mp3'
    },

            {
        title: 'Picking Scabs',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_mbrzv1notmp05_7mj29Bad_Things_OST_Picking_Scabs_1_2208101420.mp3'
    },

            {
        title: 'there it is',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_tnruc1b9tmpt9iv1uz8Bad_Things_OST_there_it_is_5_2208104021.mp3'
    },

            {
        title: 'Hes Here',
        subtitle: 'Bad thigs OST',
        src: 'music/tmpscdl_yuoopwi3tmpd2fk1hcqBad_Things_OST_Hes_Here_9_2208105896.mp3'
    },

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
