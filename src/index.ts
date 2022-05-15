import {getCLS, getFID, getLCP} from 'web-vitals'

  function getSelector(node: { nodeType: number; id: string; nodeName: string; className: string | any[]; classList: any[]; parentNode: any; }, maxLen = 100): string {
   let sel = '';
   try {
     while (node && node.nodeType !== 9) {
       const part = node.id ? '#' + node.id : node.nodeName.toLowerCase() + (
         (node.className && node.className.length) ?
         '.' + Array.from(node.classList.values()).join('.') : '');
       if (sel.length + part.length > maxLen - 1) return sel || part;
       sel = sel ? part + '>' + sel : part;
       if (node.id) break;
       node = node.parentNode;
     }
   } catch (err) {
     // Do nothing...
   }
   return sel;
  }

  function getLargestLayoutShiftEntry(entries: any[]) {
   return entries.reduce((a: { value: number; }, b: { value: number; }) => a && a.value > b.value ? a : b);
  }

  function getLargestLayoutShiftSource(sources: any[]) {
   return sources.reduce((a: { node: any; previousRect: { width: number; height: number; }; }, b: { previousRect: { width: number; height: number; }; }) => {
     return a.node && a.previousRect.width * a.previousRect.height >
         b.previousRect.width * b.previousRect.height ? a : b;
   });
  }

  function wasFIDBeforeDCL(fidEntry: any) {
   const navEntry:any = performance.getEntriesByType('navigation')[0];
   return navEntry && fidEntry.startTime < navEntry.domContentLoadedEventStart;
  }

  function getFIDDebugTarget(entries: { target: any; }[]) {
    return entries[0].target;
  }

  function getFIDEventType(entries: { name: any; }[]) {
    return entries[0].name;
  }

  function getDebugInfo(name: string, entries = []) {
    // In some cases there won't be any entries (e.g. if CLS is 0,
    // or for LCP after a bfcache restore), so we have to check first.
    if (entries.length) {
      if (name === 'LCP') {
        const lastEntry :any = entries[entries.length - 1];
        return {
          debug_target: getSelector(lastEntry.element),
          event_time: lastEntry.startTime,
        };
      } else if (name === 'FID') {
        const firstEntry:any = entries[0];
        return {
          debug_target: getSelector(firstEntry.target),
          debug_event: firstEntry.name,
          debug_timing: wasFIDBeforeDCL(firstEntry) ? 'pre_dcl' : 'post_dcl',
          event_time: firstEntry.startTime,
        };
      } else if (name === 'CLS') {
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

  
  function sendToGoogleAnalytics({ name, delta, value, id, entries }: any){
    (<any>window).gtag('event', name, {
      // Built-in params:
      value: delta, // Use `delta` so the value can be summed.
      // Custom params:
      metric_id: id, // Needed to aggregate events.
      metric_value: value, // Value for querying in BQ
      metric_delta: delta, // Delta for querying in BQ
      // Send the returned values from getDebugInfo() as custom parameters
        ...getDebugInfo(name, entries)
    });
  }

  // getLCP(console.log);
  // getFID(console.log);
  // getCLS(console.log);
  getLCP(sendToGoogleAnalytics);
  getFID(sendToGoogleAnalytics);
  getCLS(sendToGoogleAnalytics);