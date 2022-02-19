import { useState } from 'react'
import styles from './pfp.module.css'
import * as loadImage from "blueimp-load-image/js/load-image"
import {Modal} from "../modules/web3modal"
import Script from 'next/Script'
export default function Pfp() {
    const [skies, setSkies] = useState([]);
    const [skySelected, selectSky] = useState({});
    const [avatar, setAvatar] = useState({});
    const clickSky = function(e) {
        selectSky(e.target.src)
        document.getElementById("mergeBottom").src=e.target.src
    }
    const fetchSkies = function (e=null,addy) {
        addy=addy??e.target.value
        if(addy.length<42){
            return;
        }
        getSkies(addy).then(res => {
            var items = [];
            res.result.forEach(sky => {
                sky.meta = JSON.parse(sky.metadata)
                items.push(
                    <>
                        {/* <p key={sky.token_address+ " "+ sky.token_id}>{sky.token_address},{sky.name}</p> */}
                        <img onClick={clickSky} key={sky.token_address + " " + sky.token_id + "img"} className={styles.img} src={sky.meta.image} />
                    </>
                )
            })
            setSkies(items);
        }).catch(()=>{
            setSkies([]);
        })
    }
    return (<>
        <Script src="https://unpkg.com/merge-images"/>
        <div className="row">
            <div className="col">
                <h3>choose a sky and upload any front image to generate pfp</h3>
                <img key="mergeBottom" crossOrigin="anonymous" className={styles.merger} id="mergeBottom"/>
                <img key="mergeTop" crossOrigin="anonymous" className={styles.merger} id="mergeTop"/>
                <button className={styles.download} onClick={merge}>Download</button>
            </div>
            <div className="col">{skies.length<1?<Modal addyUpdate={fetchSkies}/>:skies}</div>
            <div className="col">
                <input type="file" onChange={imgUpload} />
                <img className="userInputImg" />
            </div>
        </div>

    </>)
}

async function imgUpload(e) {
    let imgElem = document.querySelector(".userInputImg");
    const resizedImage = await loadImage(e.target.files[0], null, {

        //resizing image using blue-load-image module

        maxWidth: 1500,
        maxHeight: 1500,
        canvas: true
    });
    imgElem.src = URL.createObjectURL(e.target.files[0]);
    // img.src = URL.createObjectURL(file);
    var reader  = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onloadend = function (e) {
        var myImage = new Image(); // Creates image object
        myImage.src = e.target.result; // Assigns converted image to image object
        myImage.onload = function(ev) {
           var myCanvas = document.createElement("canvas"); // Creates a canvas object
           var myContext = myCanvas.getContext("2d"); // Creates a contect object
           myCanvas.width = myImage.width; // Assigns image's width to canvas
           myCanvas.height = myImage.height; // Assigns image's height to canvas
           myContext.drawImage(myImage,0,0); // Draws the image on canvas
           myCanvas.toBlob(blobThingy) // Assigns image base64 string in jpeg format to a variable
        }
    }
    async function blobThingy(inputBlob) {
        const formData = new FormData();

        //api call
        formData.append("image_file", inputBlob);

        const response = await fetch("https://sdk.photoroom.com/v1/segment", {
            method: "POST",
            headers: {
                "x-api-key": "9279be760a8ff8678dc4bfe2b9b4022982d0b33b"
            },
            body: formData
        });
        const outputBlob = await response.blob();

        //output image
        let conImage= document.getElementById("mergeTop")
        conImage.style.width = "250px";
        conImage.style.height = "250px";
        conImage.src = URL.createObjectURL(outputBlob);
    };
}

async function getSkies(owner) {
    const url = `https://deep-index.moralis.io/api/v2/${owner}/nft?chain=eth&format=decimal&token_addresses=0x506543b7f2dce30e235714446dc9bd634efae8a1`
    let data = await fetch(url, {
        headers: {
            "x-api-key": "BLb9B8jPDsvp0anB4OLrYWXAloe53ywQMQNyqMA8IlNVCQuJv0Npa4CsFJenLJJ5"
        }
    }).catch(e=>{
        throw new Error
    })
    if (data.ok) {
        return await data.json()
    }
}

async function merge(){
    let size=1028;
    let canvas = document.createElement("canvas");
    canvas.height= size;
    canvas.width= size;
    let ctx = canvas.getContext('2d');
    let img = document.getElementById('mergeTop');
    let img2 = document.getElementById('mergeBottom');
    ctx.drawImage(img2, 0, 0,img2.naturalHeight,img2.naturalWidth,0,0,size,size);
    ctx.drawImage(img, 0, 0,img.naturalHeight,img.naturalWidth,0,0,size,size);
    let link = document.createElement("a");
    link.download="pfp";
    link.href= canvas.toDataURL();
    link.click()
}