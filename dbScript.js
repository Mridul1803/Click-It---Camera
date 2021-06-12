let dbAccess;
let req = indexedDB.open('Camera', 1);

req.addEventListener('success', function(){
    dbAccess = req.result;
})

req.addEventListener('upgradeneeded', function(){
    let db = req.result;
    db.createObjectStore('gallery', {keyPath:'mId'});
})

req.addEventListener('error', function(){
    alert('Error');
})

function addMedia( type, media){
    let tx = dbAccess.transaction('gallery', 'readwrite');
    let galleryOS = tx.objectStore('gallery');
    let data = {
        mId: Date.now(),
        type,
        media,
    };
    galleryOS.add(data);
}

function viewMedia(){

    let container = document.querySelector('.media-container');
    let tx = dbAccess.transaction('gallery', 'readonly');
    let galleryOS = tx.objectStore('gallery');
    let req = galleryOS.openCursor();

    req.addEventListener('success', function(){
        let cursor = req.result;

        if(cursor){
            let mediaCard = document.createElement('div');
            mediaCard.classList.add('media-card');
            mediaCard.innerHTML = `<div class='img-container'></div>
                                    <div class='button-container'>
                                        <div class='download button'>Download</div>
                                        <div class='delete button' data-id=${cursor.value.mId} >Delete</div>
                                    </div>`;

            let downloadBtn = mediaCard.children[1].children[0];
            let deleteBtn = mediaCard.children[1].children[1];

            deleteBtn.addEventListener('click', function(e){

                let mid = e.currentTarget.getAttribute('data-id');
                //removal from UI
                e.currentTarget.parentElement.parentElement.remove();

                //removal from DB
                deleteMediafromDB(mid);
            })

            if( cursor.value.type == 'img' )
            {
                let img = document.createElement('img');
                img.src = cursor.value.media;
                img.classList.add('media');
                
                let imgContainer = mediaCard.children[0];
                imgContainer.appendChild(img);

                downloadBtn.addEventListener('click', function(){
                    let a = document.createElement('a');
                    a.download = 'image.jpg';
                    a.href = img.src;
                    a.click();
                    a.remove();
                } )
            }
            else
            {
                let video = document.createElement('video');
                video.classList.add('media');
                // console.log( window.URL.createObjectURL(cursor.value.media) );
                video.src = window.URL.createObjectURL(cursor.value.media);
                let vidContainer = mediaCard.children[0];
                
                video.addEventListener('mouseenter', function(){
                    video.play();
                    this.currentTime = 0;
                })

                video.addEventListener('mouseleave', function(){
                    video.pause();
                })
                video.controls = true;
                video.loop = true;

                vidContainer.appendChild(video);

                downloadBtn.addEventListener('click', function(){
                    let a = document.createElement("a");
                    a.href = video.src;
                    a.download = 'video.mp4';
                    a.click();
                    a.remove();
                })
            }
        
        container.appendChild(mediaCard);            
        cursor.continue();    
        }    
    })
}

function deleteMediafromDB(mId)
{
    let tx = dbAccess.transaction('gallery', 'readwrite');
    let galleryOS = tx.objectStore('gallery');
    galleryOS.delete(Number(mId));
}