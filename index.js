class Video {
    constructor(elm) {
        this.element = elm;
        this.video = elm.querySelector('.video');
        this.playPuaseButton = elm.querySelector('.video-controls__button_pause');
        this.controls = elm.querySelector('.video-controls');
        this.brightnessInput = elm.querySelector('.brightness-input');
        this.contrastInput = elm.querySelector('.contrast-input');

        this.volumeBar = elm.querySelector('.video-controls__volume');
        this.volumeNum = elm.querySelector('.volume-num');
        this.audioCtx = null;

        this.init();
    }

    init() {
        this.playPuaseButton.addEventListener('click', this.playPause.bind(this));

        this.video.addEventListener('click', (e) => {
            this.element.style.zIndex = 9;
            this.element.classList.add('video-item_fullscreen');

            this.video.muted = false;
            this.volumeAnalyzer();
        });

        this.element.querySelector('.video-controls__all-cameras').addEventListener('click', (e) => {
            this.video.muted = true;

            this.element.classList.remove('video-item_fullscreen');
            setTimeout(() => {
                this.element.style.zIndex = 1;
            }, 500);
        });

        this.contrastInput.addEventListener('input', this.updateFilter.bind(this));
        this.brightnessInput.addEventListener('input', this.updateFilter.bind(this));
    }

    updateFilter() {
        const contrastValue = this.contrastInput.value;
        const brightnessValue = this.brightnessInput.value;

        this.video.style.filter = `brightness(${brightnessValue}) contrast(${contrastValue})`;
    }

    playPause() {
        if (this.video.paused) {
            this.playPuaseButton.classList.add('video-controls__button_pause');
            this.playPuaseButton.classList.remove('video-controls__button_play');

            this.video.play();
        } else {
            this.playPuaseButton.classList.remove('video-controls__button_pause');
            this.playPuaseButton.classList.add('video-controls__button_play');

            this.video.pause();
        }
    }

    volumeAnalyzer() {
        if (this.audioCtx) return;
        
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const source = this.audioCtx.createMediaElementSource(this.video);
        source.connect(this.audioCtx.destination);

        const analyser = this.audioCtx.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);

        const streamData = new Uint8Array(analyser.frequencyBinCount);

        function getVolume() {
            analyser.getByteFrequencyData(streamData);

            return streamData.reduce((acc, val) => acc + val, 0) / 255 / streamData.length;
        }

        const drawVolumeBar = () => {
            const volume = getVolume();

            this.volumeNum.innerText = volume.toFixed(2);
            this.volumeBar.style.transform = `scaleX(${volume})`;

            requestAnimationFrame(drawVolumeBar);
        }

        drawVolumeBar();
    }
}
