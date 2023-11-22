export default function createPopup (listTitle, listItems) {
    let html = `<p><strong>${listTitle}</strong></p><dl>`;

    for (const [key, value] of Object.entries(listItems)) {
        html += `<dt>${key}</dt><dd>${value}</dd>`;
    }

    return html += '</dl>';
}