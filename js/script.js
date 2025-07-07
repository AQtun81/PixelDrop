const root = document.querySelector(':root');
const body = document.querySelector('body');
const image_input = document.querySelector("#image_input");
const image_preview = document.querySelector("#image_preview");
const palette_input = document.querySelector("#palette_input");
const info_bar = document.querySelector("#info_bar");
const sidebar = document.querySelector("#sidebar");
let activeImage;
let activePalette;
let processing = false;
let queue = false;

/* IMAGE FUNCTIONS
---------------------------------------------------------------------*/

async function processActiveImage() {
    if (!activeImage) return;
    if (processing) {
        queue = true;
        return;
    }
    processing = true;
    window.cs.computeImage();
}

async function updateCanvas(data, width, height) {
    const canvas = document.getElementById('image_preview');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // Convert .NET byte[] to JS Uint8Array
    const bytes = new Uint8ClampedArray(data);
    const imageData = new ImageData(bytes, width, height);

    ctx.putImageData(imageData, 0, 0);
}

/* FILE INPUT EVENTS
---------------------------------------------------------------------*/

image_input.addEventListener("change", () => imageChange())

async function imageChange(e) {
    if (image_input.files.length === 0) return;

    console.log("Image Change");
    image_input.previousElementSibling.innerText = image_input.files[0].name;
    activeImage = image_input.files[0];
    const buffer = await activeImage.arrayBuffer();
    const byteBuffer = new Uint8Array(buffer);

    window.cs.sendImage(byteBuffer);
    window.cs.computeImage();
}

palette_input.addEventListener("change", () => paletteChange())

async function paletteChange() {
    if (palette_input.files.length === 0) return;

    console.log("Palette Change");
    palette_input.previousElementSibling.innerText = palette_input.files[0].name;
    activePalette = palette_input.files[0];
    const buffer = await activePalette.arrayBuffer();
    const byteBuffer = new Uint8Array(buffer);

    window.cs.sendPalette(byteBuffer);
    window.cs.computeImage();
}


/* SLIDERS
---------------------------------------------------------------------*/

let ranges = document.querySelectorAll("#sidebar label");

for (let i = 0; i < ranges.length; i++) {
    ranges[i].addEventListener("contextmenu", (e) => {e.preventDefault(); resetRangeValue(ranges[i])});
}

function resetRangeValue(element) {
    // change element value
    let input = element.querySelector("input");
    input.value = input.attributes.default.value;

    // apply changes to the image
    let event = new Event('input');
    input.dispatchEvent(event);
}

function updateRange(element, fn) {
    let parent = element.parentElement;
    parent.attributes.value.value = element.value;
    fn(element.value);
    processActiveImage();
}

/* OTHER
---------------------------------------------------------------------*/

window.addEventListener("resize", onResize);

function onResize() {
    const padding = 15;
    let zoomStep = (sidebar.offsetHeight + info_bar.offsetHeight) / 2 + padding;
    body.style.zoom = `${Math.max(Math.floor(window.innerHeight / zoomStep) / 2, 0.5)}`;
}

function saveImage() {
    image_preview.toBlob((blob) => {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.href = url;
        let fileName = activeImage.name;
        fileName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
        link.download = `${fileName}_modified.png`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    })
}