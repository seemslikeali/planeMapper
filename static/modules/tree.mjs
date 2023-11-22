export function findNode (tree, label) {
    if (tree.label === label) {
        return tree;
    } else if (Object.hasOwn(tree, 'children')) {
        const subtrees = tree.children;
        
        for (const subtree of subtrees) {
            const node = findNode(subtree, label);

            if (node) return node;
        }
    }

    return null;
}

export default function addNode (tree, label, {layer = null} = {}) {
    const children = tree.children;
    const child = children.find(obj => obj.label === label);

    if (child) {
        if (Object.hasOwn(child, 'layer')) {
            const childLayer = child.layer;

            childLayer.setLatLng(layer.getLatLng());
            childLayer.setIcon(layer.getIcon());
        }
    } else {
        if (layer) {
            children.push({label: label, layer: layer});
        } else {
            children.push({
                label: label,
                selectAllCheckbox: true,
                collapsed: true,
                children: []
            });
        }
    }
}

export function removeNode (tree, label) {
    if (tree) {
        /*
        const children = tree.children;
        const child = children.find(obj => obj.label === label);

        if (child) {
            if (Object.hasOwn(child, 'layer')) {
                if (map) {
                    map.eachLayer(function(layer){
                        if (layer === child.layer) {
                            map.removeLayer(layer);
                        }
                    });
                }
            }
        }*/

        tree.children = tree.children.filter(obj => obj.label !== label);
    }
}