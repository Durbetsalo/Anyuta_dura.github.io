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

function toggleAudio() {
    if (audio.paused) {
        audio.play()
            .then(() => {
                audioBtn.innerText = '❚❚ ПАУЗА';
                audioBtn.style.borderColor = 'var(--accent-cyan)';
                audioBtn.style.color = 'var(--accent-cyan)';
            })
            .catch(err => {
                console.error('Ошибка воспроизведения:', err);
                alert(
                    "Не удалось включить музыку. Проверь, что файл " +
                    "'roof_music.mp3' находится в папке с сайтом."
                );
            });
    } else {
        audio.pause();
        audioBtn.innerText = '► ВКЛЮЧИТЬ МУЗЫКУ';
        audioBtn.style.borderColor = 'var(--accent-red)';
        audioBtn.style.color = 'var(--accent-red)';
    }
}

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
