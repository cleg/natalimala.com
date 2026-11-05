(() => {
  document.getElementById('year').textContent = new Date().getFullYear();
  const desktop = window.matchMedia('(min-width: 1001px)');
  const svg = document.getElementById('rings');
  function renderRings() {
    if (!desktop.matches || svg.childElementCount) return;
  const ns = 'http://www.w3.org/2000/svg';

  // A seeded generator keeps the hand-tuned, organic composition identical on every visit.
  function seeded(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function waveSettings(random, amount) {
    return [1, 2, 3].map((frequency, index) => ({
      frequency,
      // Broad waves retain a flowing silhouette instead of introducing noisy edges.
      amplitude: amount * ([.82, .34, .12][index]) * (.75 + random() * .5),
      phase: random() * Math.PI * 2
    }));
  }

  function radiusAt(angle, base, waves) {
    return base + waves.reduce((sum, wave) => sum + Math.sin(angle * wave.frequency + wave.phase) * wave.amplitude, 0);
  }

  function pathForRing(config) {
    const random = seeded(config.seed);
    const outerWaves = waveSettings(random, config.irregularity);
    const innerWaves = waveSettings(random, config.irregularity * .72);
    const count = 76;
    const outer = [];
    const inner = [];

    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2;
      const outerRadius = radiusAt(a, config.radius, outerWaves);
      // Inner variations are intentionally separate, creating a naturally changing ribbon width.
      const innerRadius = radiusAt(a, config.radius - config.thickness, innerWaves) - Math.sin(a * 2 + .5) * config.thickness * .18;
      outer.push([config.cx + Math.cos(a) * outerRadius, config.cy + Math.sin(a) * outerRadius]);
      inner.push([config.cx + Math.cos(a) * innerRadius, config.cy + Math.sin(a) * innerRadius]);
    }

    const smoothClosed = (points) => {
      const start = [(points[points.length - 1][0] + points[0][0]) / 2, (points[points.length - 1][1] + points[0][1]) / 2];
      const curves = points.map((point, i) => {
        const next = points[(i + 1) % points.length];
        const midpoint = [(point[0] + next[0]) / 2, (point[1] + next[1]) / 2];
        return `Q ${point[0].toFixed(1)} ${point[1].toFixed(1)} ${midpoint[0].toFixed(1)} ${midpoint[1].toFixed(1)}`;
      }).join(' ');
      return `M ${start[0].toFixed(1)} ${start[1].toFixed(1)} ${curves}`;
    };

    return `${smoothClosed(outer)} Z ${smoothClosed([...inner].reverse())} Z`;
  }

  const defs = document.createElementNS(ns, 'defs');
  svg.appendChild(defs);
  const rings = [
    // Each centre is deliberately well beyond the 1600 x 900 hero viewBox.
    { seed: 194, cx: 2560, cy: -810, radius: 1980, thickness: 178, irregularity: 174, gradient: ['#E6B9B5', '#D59C9F', '#CE929B'], opacity: .34, rotation: -22, className: 'ring--one' },
    { seed: 802, cx: -880, cy: 1830, radius: 2050, thickness: 180, irregularity: 148, gradient: ['#C67F8B', '#D3929D', '#E2ADB1'], opacity: .68, rotation: 92, className: 'ring--two' },
    { seed: 316, cx: 3050, cy: 1080, radius: 1760, thickness: 220, irregularity: 196, gradient: ['#E7BEB5', '#DFABAD', '#D69DA5'], opacity: .22, rotation: 142, className: 'ring--three' }
  ];

  rings.forEach((config, index) => {
    const gradient = document.createElementNS(ns, 'linearGradient');
    gradient.id = `ring-gradient-${index}`;
    gradient.setAttribute('x1', '0%'); gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%'); gradient.setAttribute('y2', '100%');
    config.gradient.forEach((color, stopIndex) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', `${(stopIndex / (config.gradient.length - 1)) * 100}%`);
      stop.setAttribute('stop-color', color);
      defs.appendChild(gradient).appendChild(stop);
    });
    const group = document.createElementNS(ns, 'g');
    group.setAttribute('class', `ring ${config.className}`);
    const positionedGroup = document.createElementNS(ns, 'g');
    // Keep the design rotation separate from the CSS-animated transform.
    positionedGroup.setAttribute('transform', `rotate(${config.rotation} ${config.cx} ${config.cy})`);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', pathForRing(config));
    path.setAttribute('fill', `url(#${gradient.id})`);
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('opacity', config.opacity);
    positionedGroup.appendChild(path);
    group.appendChild(positionedGroup);
    svg.appendChild(group);
  });

  }
  renderRings();
  desktop.addEventListener('change', renderRings);
})();


// Track intent only: never send contact URLs, addresses, or message contents.
(() => {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-analytics-event]');
    if (!link || typeof window.gtag !== 'function') return;

    const parameters = { transport_type: 'beacon' };
    if (link.dataset.analyticsSource) {
      parameters.cta_location = link.dataset.analyticsSource;
    }
    if (link.dataset.analyticsMethod) {
      parameters.contact_method = link.dataset.analyticsMethod;
    }
    window.gtag('event', link.dataset.analyticsEvent, parameters);
  });
})();
