export default function createFilterForm ({ 
        className = 'leaflet-control-layers', 
        buttonId = 'map-filters-button', 
        formId = 'map-filters', 
        formToken = 'map-filters--hidden', 
        token = 'leaflet-control-layers--disabled' } = {}) {
    document.getElementById(buttonId).addEventListener('click', () => {
        document.getElementById(formId).classList.toggle(formToken);
        
        (elements => {
            for (const element of elements) {
                element.classList.toggle(token);
            }
        })(document.getElementsByClassName(className));
    });
}

function createFilter (callback, elementId) {
    document.getElementById(elementId).addEventListener('change', (event) => {
        localStorage.setItem(elementId, event.target.value);

        callback();
    });
}

export function createFilters (callback, ...elementIds) {
    for (const id of elementIds) {
        createFilter (callback, id);
    }
}

function addOption (elementId, text) {
    const select = document.getElementById(elementId);
    const options = select.options;
    let exists = false;

    for (const option of options) {
        if (option.value === text) exists = true;
    }

    if (!exists) {
        const option = new Option(text, text);

        option.setAttribute('name', text);

        if (option.value === localStorage.getItem(elementId)) {
            option.setAttribute('selected', true);
        }

        select.add(option);
    }
}

export function addOptions (elementId, ...strings) {
    for (const s of strings) {
        addOption(elementId, s);
    }
}

export function isEligible (key, value, { value2 = '' } = {}) {
    const filter = localStorage.getItem(key);

    if (filter) {
        if (!value2) {
            if (value === filter) return true;
        } else {
            if (value === filter) {
                addMatch(key, value2);

                return true;
            } else if (value2 === filter) {
                addMatch(key, value);

                return true;
            }
        }
    } else {
        return true;
    }

    return false;
}

function addMatch (key, value) {
    const matchesKey = key + '-matches';
    const matches = JSON.parse(localStorage.getItem(matchesKey));

    if (!matches.includes(value)) {
        matches.push(value);

        localStorage.setItem(matchesKey, JSON.stringify(matches));
    }
}

export function isMatch (key, value) {
    const matchesKey = key + '-matches';
    const matches = JSON.parse(localStorage.getItem(matchesKey));  
    
    for (const match of matches) {
        if (value === match) return true;
    }

    return false;
}

export function resetMatches (...keys) {
    for (const key of keys) {
        localStorage.setItem(key + '-matches', JSON.stringify([]));
    }
}