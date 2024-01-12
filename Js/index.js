var songs = [];
var currentSong = new Audio();
var currentSongCurrrentDuration = "00:00";
var currentSongTotalDuration = "00:00";
var play = document.querySelector(".play");
var previous = document.querySelector(".pre");
var next = document.querySelector(".next");
var shuffle = document.querySelector(".shuffle>img");
var repeat = document.querySelector(".repeat>img");
var currentFolder = "";
var shuffleValue = false;
var repeatValue = false;

// function for current song durations
const setDuration = () => {
    let currentDuration = document.querySelector(".currentDuration");
    currentDuration.innerHTML = currentSongCurrrentDuration;

    let totalDuration = document.querySelector(".totalDuration");
    totalDuration.innerHTML = currentSongTotalDuration;
}

// function to update seekbar
const setSeekbar = (currentTime, totalTime) => {
    let seekbarCircle = document.querySelector(".circle");
    seekbarCircle.style.left = `${(currentTime / totalTime) * 100}%`;
}

// function to set song name 
const setSongName = (name) => {
    let songName = document.querySelector(".song").querySelector("h4");
    songName.innerHTML = name;
}

// function to fetch songs 
async function getSongs(folder) {
    let a = await fetch(`/Songs/${folder}/`);
    let response = await a.text();
    let newDiv = document.createElement("div");
    newDiv.innerHTML = response;
    let as = newDiv.getElementsByTagName("a");
    let songs = [];
    for (let a in as) {
        if (as[a].href?.includes(".mp3")) {
            songs.push(as[a].href);
        }
    }
    return songs;
}

async function getAlbums() {
    let a = await fetch(`/Songs/`);
    let response = await a.text();
    let newDiv = document.createElement("div");
    newDiv.innerHTML = response;
    let as = newDiv.getElementsByTagName("a");
    let albums = [];
    for (let a in as) {
        if (as[a].href?.includes("/Songs/") && !as[a].href?.includes(".htaccess")) {
            albums.push(as[a].title);

            let folder = as[a].title;
            let b = await fetch(`/Songs/${folder}/info.json`);
            let response = await b.json();

            let cardContainer = document.querySelector(".card-container");
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${response.datasetName}" class="card">
            <img src="Img/${response.imageName}" alt="">
            <h4>${response.albumName}</h4>
            <p>${response.description}</p>
            <div class="playbtn"><img src="Img/play.png" alt=""></div>
        </div>`
        }
    }
}

// Play the music 
const playMusic = (track, isTrue) => {
    // let audio = new Audio("/Songs/"+track+".mp3");
    currentSong.src = `Songs/${currentFolder}/` + track + ".mp3";
    if (isTrue) {
        currentSong.play();
        play.firstChild.src = "Img/pause.png";
    }
    if (!isTrue) {
        let seekbarCircle = document.querySelector(".circle");
        seekbarCircle.style.left = `0%`;
    }

    // setting the total duration
    currentSong.addEventListener("loadeddata", () => {
        // The duration variable now holds the duration (in seconds) of the audio clip
        let duration = currentSong.duration;
        const minutes = Math.floor(duration / 60) < 10 ? "0" + Math.floor(duration / 60) : Math.floor(duration / 60);
        const seconds = (duration - minutes * 60).toFixed(0) < 10 ? "0" + (duration - minutes * 60).toFixed(0) : (duration - minutes * 60).toFixed(0);
        currentSongTotalDuration = `${minutes}:${seconds}`;
        // console.log(currentSongTotalDuration);
        setDuration();
    });

    // setting the current duration
    currentSong.addEventListener("timeupdate", () => {
        let totalTime = currentSong.duration;
        let currentTime = currentSong.currentTime;
        const minutes = Math.floor(currentTime / 60) < 10 ? "0" + Math.floor(currentTime / 60) : Math.floor(currentTime / 60);
        const seconds = (currentTime - minutes * 60).toFixed(0) < 10 ? "0" + (currentTime - minutes * 60).toFixed(0) : (currentTime - minutes * 60).toFixed(0);
        currentSongCurrrentDuration = `${minutes}:${seconds}`;
        // console.log(currentSongCurrrentDuration);
        setDuration();
        setSeekbar(currentTime, totalTime);
    })
    setSongName(track);
}

async function setPlaylist(currentFolder, isPlay = false) {

    // Get the list of all songs 
    songs = await getSongs(currentFolder);
    playMusic(songs[0].split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", ""), isPlay);
    // show all the songs in the playlist
    let songUl = document.getElementById("songs").querySelector("ul");
    songUl.innerHTML = "";
    for (let index = 0; index < songs.length; index++) {
        const element = songs[index];
        songUl.innerHTML = songUl.innerHTML + `<li>
 <div class="flex align-center">
     <img class="invert" src="Img/music.png" alt="">
     <h5>${element.split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", "")}</h5>
 </div>
 <div class="flex align-center">
     <img class="invert" src="Img/play.png" alt="">
 </div>
 </li>`;
    }


    // Play the music on clicking a song from play list 
    Array.from(document.querySelector(".songs").getElementsByTagName("li")).forEach((e) => {
        // console.log(e.querySelector('h5').innerHTML);
        e.addEventListener("click", () => {
            playMusic(e.querySelector('h5').innerHTML, true);
        })
    })
}

async function setImage(folder) {
    let b = await fetch(`/Songs/${folder}/info.json`);
    let response = await b.json();
    document.querySelector(".song>img").attributes.src.nodeValue = `Img/${response.imageName}`;
}

async function main() {

    currentFolder = "favorites";
    await setPlaylist(currentFolder);

    // Display all the Playlist Card (Albums) on the page 
    await getAlbums();

    // setting image playbar
    await setImage(currentFolder);

    // Attach eventlistners to Play , Previous and Next button 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.firstChild.src = "Img/pause.png";
        }
        else {
            currentSong.pause();
            play.firstChild.src = "Img/play.png";
        }
    })

    // Add eventListeners to previous and next
    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src);
        if (currentSong.paused) {
            playMusic(songs[shuffleValue ? Math.floor((songs.length - 1) * Math.random()) : currentIndex == 0 ? 0 : currentIndex - 1].split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", ""), false);
        }
        else {
            playMusic(songs[shuffleValue ? Math.floor((songs.length - 1) * Math.random()) : currentIndex == 0 ? 0 : currentIndex - 1].split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", ""), true);
        }
    })
    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src);
        if (currentSong.paused) {
            playMusic(songs[shuffleValue ? Math.floor((songs.length - 1) * Math.random()) : currentIndex + 1 == songs.length ? currentIndex : currentIndex + 1].split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", ""), false);
        }
        else {
            playMusic(songs[shuffleValue ? Math.floor((songs.length - 1) * Math.random()) : currentIndex + 1 == songs.length ? currentIndex : currentIndex + 1].split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", ""), true);
        }
    })

    // Add eventListeners to Shuffle and Repeat
    shuffle.addEventListener("click", (e) => {
        if (shuffle.attributes.src.nodeValue == "Img/shuffle.png") {
            e.target.src = "Img/shuffle-on.png";
            e.target.parentNode.className = "shuffle";
            shuffleValue = true;
        }
        else {
            e.target.src = "Img/shuffle.png";
            e.target.parentNode.className = "shuffle invert";
            shuffleValue = false;
        }
    })

    repeat.addEventListener("click", (e) => {
        if (repeat.attributes.src.nodeValue == "Img/repeat.png") {
            e.target.src = "Img/repeat-on.png";
            e.target.parentNode.className = "repeat";
            repeatValue = true;
        }
        else {
            e.target.src = "Img/repeat.png";
            e.target.parentNode.className = "repeat invert";
            repeatValue = false;
        }
    })

    // Attach an eventListener to seekbar
    let seekbar = document.querySelector(".seekbar");
    let seekbarCircle = document.querySelector(".circle");
    seekbar.addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        seekbarCircle.style.left = `${percent}%`;
        currentSong.currentTime = (percent / 100) * currentSong.duration;
        const minutes = Math.floor(currentSong.currentTime / 60) < 10 ? "0" + Math.floor(currentSong.currentTime / 60) : Math.floor(currentSong.currentTime / 60);
        const seconds = (currentSong.currentTime - minutes * 60).toFixed(0) < 10 ? "0" + (currentSong.currentTime - minutes * 60).toFixed(0) : (currentSong.currentTime - minutes * 60).toFixed(0);
        currentSongCurrrentDuration = `${minutes}:${seconds}`;
        setDuration()
    })

    // Attach eventListener to menu 
    let menu = document.querySelector(".nav-menu").querySelector("img");
    let left = document.querySelector(".left");
    menu.addEventListener("click", () => {
        if (menu.attributes.src.nodeValue == "Img/menu.png") {
            left.style.left = "0";
            menu.style.marginLeft = "190px";
            menu.src = "Img/cross.png";
        }
        else {
            left.style.left = "-280px";
            menu.style.marginLeft = "0";
            menu.src = "Img/menu.png";

        }
    })

    // Attach eventListener to volume range
    let volume = document.querySelector(".volume");
    volume.addEventListener("change", (e) => {
        currentSong.volume = e.target.valueAsNumber / 100;
    })

    // Attach eventListener to mute the track
    let volumeImg = document.querySelector(".song-features> img");
    volumeImg.addEventListener("click", (e) => {
        // console.log(e.target)
        if (volumeImg.attributes.src.nodeValue == "Img/volume.png") {
            e.target.src = "Img/mute.png";
            currentSong.volume = 0;
            volume.value = 0;
        }
        else {
            e.target.src = "Img/volume.png"
            currentSong.volume = 0.3;
            volume.value = 30;
        }
    })

    // AutoPlay next song after finishing current song
    currentSong.addEventListener("ended", () => {
        let currentIndex = songs.indexOf(currentSong.src);
        if (repeatValue) {
            playMusic(songs[currentIndex].split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", ""), true);
        }
        else {
            playMusic(songs[shuffleValue ? Math.floor((songs.length - 1) * Math.random()) : currentIndex + 1 == songs.length ? currentIndex : currentIndex + 1].split(`Songs/${currentFolder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", ""), true);
        }

    })

    // Load the playlist whenever the card is clicked
    let card = document.getElementsByClassName("card");
    Array.from(card).forEach((item) => {
        item.addEventListener("click", async (e) => {
            currentFolder = e.currentTarget.dataset.folder;
            await setPlaylist(currentFolder, true);
            await setImage(currentFolder);
        })
    })

}
main()
