"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_vitals_1 = require("web-vitals");
function getSelector(node, maxLen = 100) {
    let sel = '';
    try {
        while (node && node.nodeType !== 9) {
            const part = node.id ? '#' + node.id : node.nodeName.toLowerCase() + ((node.className && node.className.length) ?
                '.' + Array.from(node.classList.values()).join('.') : '');
            if (sel.length + part.length > maxLen - 1)
                return sel || part;
            sel = sel ? part + '>' + sel : part;
            if (node.id)
                break;
            node = node.parentNode;
        }
    }
    catch (err) {
        // Do nothing...
    }
    return sel;
}
function getLargestLayoutShiftEntry(entries) {
    return entries.reduce((a, b) => a && a.value > b.value ? a : b);
}
function getLargestLayoutShiftSource(sources) {
    return sources.reduce((a, b) => {
        return a.node && a.previousRect.width * a.previousRect.height >
            b.previousRect.width * b.previousRect.height ? a : b;
    });
}
function wasFIDBeforeDCL(fidEntry) {
    const navEntry = performance.getEntriesByType('navigation')[0];
    return navEntry && fidEntry.startTime < navEntry.domContentLoadedEventStart;
}
function getFIDDebugTarget(entries) {
    return entries[0].target;
}
function getFIDEventType(entries) {
    return entries[0].name;
}
function getDebugInfo(name, entries = []) {
    // In some cases there won't be any entries (e.g. if CLS is 0,
    // or for LCP after a bfcache restore), so we have to check first.
    if (entries.length) {
        if (name === 'LCP') {
            const lastEntry = entries[entries.length - 1];
            return {
                debug_target: getSelector(lastEntry.element),
                event_time: lastEntry.startTime,
            };
        }
        else if (name === 'FID') {
            const firstEntry = entries[0];
            return {
                debug_target: getSelector(firstEntry.target),
                debug_event: firstEntry.name,
                debug_timing: wasFIDBeforeDCL(firstEntry) ? 'pre_dcl' : 'post_dcl',
                event_time: firstEntry.startTime,
            };
        }
        else if (name === 'CLS') {
            const largestEntry = getLargestLayoutShiftEntry(entries);
            if (largestEntry && largestEntry.sources && largestEntry.sources.length) {
                const largestSource = getLargestLayoutShiftSource(largestEntry.sources);
                if (largestSource) {
                    return {
                        debug_target: getSelector(largestSource.node),
                        event_time: largestEntry.startTime,
                    };
                }
            }
        }
    }
    // Return default/empty params in case there are no entries.
    return {
        debug_target: '(not set)',
    };
}
function sendToGoogleAnalytics({ name, delta, value, id, entries }) {
    window.gtag('event', name, Object.assign({ 
        // Built-in params:
        value: delta, 
        // Custom params:
        metric_id: id, metric_value: value, metric_delta: delta }, getDebugInfo(name, entries)));
}
(0, web_vitals_1.getLCP)(sendToGoogleAnalytics);
(0, web_vitals_1.getFID)(sendToGoogleAnalytics);
(0, web_vitals_1.getCLS)(sendToGoogleAnalytics);
