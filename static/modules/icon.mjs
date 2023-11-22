export default function createIcon (
        modifierName, spriteName, {transformValue = ''} = {}) {
    const options = {
        className: 'marker',
        html: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        iconSize: [32, 32], 
        iconAnchor: [16, 16]
    };
    const svg = options.html;
    
    svg.classList.add(
        'svg', 'marker__svg', `marker__svg--${modifierName}`);
    svg.innerHTML = `<use href="static/spritesheet.svg#${spriteName}" />`;
    svg.style.transform = transformValue;

    return L.divIcon(options);
};