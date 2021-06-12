let body = document.querySelector('body');
let video = document.querySelector('video');
let recBtn = document.querySelector('#record');
let capBtn = document.querySelector('#capture');
let constraints = {video:true};
let mediaRecorder;
let chunks = [];
let isRecording = false;
let gallery = document.querySelector('.gallery');

let filters = document.querySelectorAll('.filter');
let filter=''

let zoomIn = document.querySelector('.zoom-in');
let zoomOut = document.querySelector('.zoom-out');
let minZoom =1;
let maxZoom = 3;
let currZoom = 1;

for( let i=0; i<filters.length; ++i){
    // console.log('hey');
    filters[i].addEventListener('click', function(e){
        filter = e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filter);
    })
}

function applyFilter( filterColor){
    let filterDiv = document.createElement('div');
    filterDiv.classList.add('filterDiv');
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function removeFilter()
{
    let filterDiv = document.querySelector('.filterDiv');
    if(filterDiv)
        filterDiv.remove();
}

zoomIn.addEventListener('click', function(){
    if(currZoom < maxZoom)
    {
        currZoom += 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
})

zoomOut.addEventListener('click', function(){
    if(currZoom>minZoom){
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
})

recBtn.addEventListener( 'click', function(){
    let innerBtn = document.querySelector('.innercircle.record');
    if(isRecording){
        mediaRecorder.stop();
        isRecording = false;
        innerBtn.style.animation = '';
    }
    else{
        mediaRecorder.start();
        filter='';
        removeFilter();
        currZoom=1;
        video.style.transform = `scale(${currZoom})`;

        isRecording = true;
        innerBtn.style.animation = 'record infinite 1s'
    }
} )

capBtn.addEventListener('click', function(){
    let innerBtn = document.querySelector('.innercircle.capture');
    innerBtn.style.animation = 'capture 0.3s';

    setTimeout(function(){
    innerBtn.style.animation = '';
    }, 500 )
    capture();
})

//navigator is object of browser
//mediaDevices is child Object of navigator
navigator.mediaDevices
    .getUserMedia(constraints)
    //getUserMedia return a promise

    .then(function(mediaStream){
        video.srcObject = mediaStream;
        mediaRecorder = new MediaRecorder(mediaStream);

        mediaRecorder.addEventListener('dataavailable', function(e){
            chunks.push(e.data);
        });

        mediaRecorder.addEventListener('stop', function(){
            let blob = new Blob(chunks, {type: 'video/mp4'});
            addMedia( 'video', blob );
            // chunks=[];

            // let url = URL.createObjectURL(blob);
            // let a = document.createElement("a");
            // a.href = url;
            // a.download = 'video.mp4';
            // a.click();
            // a.remove();
        })
})

function capture()
{
    let c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    let ctx = c.getContext('2d');

    ctx.translate( c.width/2, c.height/2 );
    ctx.scale(currZoom, currZoom);
    ctx.translate( -c.width/2, -c.height/2 );

    ctx.drawImage(video, 0, 0);

    if(filter != ''){
        ctx.fillStyle = filter;
        ctx.fillRect(0, 0, c.width, c.height);
    }
    // let a = document.createElement('a');
    // a.download = 'image.jpg';
    // a.href = c.toDataURL();
    addMedia('img', c.toDataURL());
    // a.click();
    // a.remove();
}

gallery.addEventListener('click', function(){
    location.assign('gallery.html');    
})