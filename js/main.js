import { dotnet } from '../_framework/dotnet.js'

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

setModuleImports('main.js', {
    UpdateCanvas: (data, width, height) => { updateCanvas(data, width, height); },
    SetInnerText: (elementId, text) => { document.getElementById(elementId).innerHTML = text; }
});

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);

window.cs = {
    setPixelate:            (value) => exports.PixelDrop.SetPixelate(value),
    setBlur:                (value) => exports.PixelDrop.SetBlur(value),
    setBrightness:          (value) => exports.PixelDrop.SetBrightness(value),
    setContrast:            (value) => exports.PixelDrop.SetContrast(value),
    setSaturation:          (value) => exports.PixelDrop.SetSaturation(value),
    setHue:                 (value) => exports.PixelDrop.SetHue(value),
    setPaletteReduction:    (value) => exports.PixelDrop.SetPaletteReduction(value),
    computeImage:           (value) => exports.PixelDrop.ComputeImage(value),
    sendImage:              (value) => exports.PixelDrop.GetImage(value),
    sendPalette:            (value) => exports.PixelDrop.GetPalette(value)
};

await dotnet.run();