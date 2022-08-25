/**
 * 1.Render songs
 * 2.Scroll top
 * 3.Play / pause / seek
 * 3.CD rotate
 * 4.next/prev
 * 5.random
 * 6.
 */
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'Hau_Player'

const playlist = $('.playlist')
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const progress = $('#progress')

const playBtn = $('.btn-toggle-play')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const ramdomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const player = $('.player')

const arrRandom =[]

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom:false,
    isRepeat:false,
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || { },
    songs:[
            {
                name: 'vaicaunoicokhiennguoithaydoi',
                singer: 'Grey-D',
                path: '/MusicPlayer/music/song1.mp3',
                image: '/MusicPlayer/img/png1.png'
            },
            {
                name: 'Chạy khỏi thế giới này',
                singer: 'Da LAB, Phương Ly',
                path: '/MusicPlayer/music/song2.mp3',
                image: '/MusicPlayer/img/png2.png'
            },
            {
                name: 'Ngã tư không đèn',
                singer: 'Trang, Khoa Vũ',
                path: '/MusicPlayer/music/song3.mp3',
                image: '/MusicPlayer/img/png2.png'
            },
            {
                name: 'Xích thêm chút nữa',
                singer: 'tlinh, MCK',
                path: '/MusicPlayer/music/song4.mp3',
                image: '/MusicPlayer/img/png4.png'
            },
            {
                name: 'Tìm',
                singer: 'Min',
                path: '/MusicPlayer/music/song5.mp3',
                image: '/MusicPlayer/img/png5.png'
            },
            {
                name: 'ThichThich',
                singer: ' Phương Ly',
                path: '/MusicPlayer/music/song6.mp3',
                image: '/MusicPlayer/img/png2.png'
            },
            {
                name: 'Hương mùa hè',
                singer: 'Suni Hạ Linh, Hoàng Dũng',
                path: '/MusicPlayer/music/song7.mp3',
                image: '/MusicPlayer/img/png4.png'
            },
    ],
    setConfig: function(key,value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render:function(){
        const htmls = this.songs.map((song,index) =>{
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        });
        playlist.innerHTML = htmls.join('\n')
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent : function(){
        const _this = this;
        const cdWidth = cd.offsetWidth

        //Xử lí cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration:10000,//10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        //Xử lí phóng to thu nhỏ
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newcdWidth = cdWidth - scrollTop

            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0 ;
            cd.style.opacity = newcdWidth/cdWidth;
        }
        //Xử lí khi play
        playBtn.onclick = function(){
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        
        //Khi tiến độ bài hát thay đổinext
        audio.ontimeupdate = function(){
                const progreePercent = Math.floor(audio.currentTime/audio.duration*100)
                progress.value = progreePercent                
        }
        //tua bài hát
        progress.oninput = function(){
            const seekTime = progress.value/100 * audio.duration
            audio.currentTime = seekTime
        }        
        //Xử lí khi next,prev,random
        prevBtn.onclick = function(){
            _this.prevSong()
            audio.play();
        }
        nextBtn.onclick = function(){
            _this.nextSong()
            audio.play();
            
        }
        ramdomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            ramdomBtn.classList.toggle('active',_this.isRandom)
        }
        //xử lí next khi hết bài
        audio.onended = function(){
            if(!_this.isRepeat){
                _this.nextSong()
            }
            audio.play();
        }
        //xử lí lập lại 1 song
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }
        //lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.LoadCurrentSong();
                    _this.render();
                    _this.scrollToActiveSong();
                    audio.play();
                }
            }
        }
    },
    LoadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    nextSong : function(){
        if(this.isRandom){
            this.playRandomSong()
        }
        else{
            this.currentIndex++;
            if(this.currentIndex>=this.songs.length){
                this.currentIndex = 0;
            }   
        }             
        this.LoadCurrentSong();
        this.render();
        this.scrollToActiveSong()
    },
    prevSong : function(){
        this.currentIndex--;
        if(this.currentIndex<0){
            this.currentIndex = this.songs.length-1;
        }
        this.LoadCurrentSong();
        this.render();
        this.scrollToActiveSong()
    },
    playRandomSong:function(){
        arrRandom.push(this.currentIndex);
        if(arrRandom.length===this.songs.length){
            arrRandom.splice(0,arrRandom.length+1)
        }
        do{
            this.currentIndex = Math.floor(Math.random() * this.songs.length)
        }while(arrRandom.includes(this.currentIndex))
    },
    loadConfig:function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        repeatBtn.classList.toggle('active',this.isRepeat)
        ramdomBtn.classList.toggle('active',this.isRandom)
    },
    scrollToActiveSong : function(){
        if(this.currentIndex===0){
            setTimeout(()=>{
                $('.song.active').scrollIntoView({
                    behavior:'smooth',
                    block:'end'
                })
                
            },250)
        }else{
            setTimeout(()=>{
                $('.song.active').scrollIntoView({
                    behavior:'smooth',
                    block:'nearest'
                })
                
            },250)
        }
    },
    start : function(){
        //gắn cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()
        //Lắng nghe và xử lý các sự kiện (DOM event)
        this.handleEvent()
        //Tải thông tin bài hát hát đầu tiên vào UI khi chạy ứng dụng
        this.LoadCurrentSong()
        //Render playlist
        this.render()
    }
}

app.start()
