/**
 * Shared diagram viewer logic for AR Labs architecture diagrams.
 * Provides zoom/pan via @panzoom/panzoom with fit-to-view centering.
 *
 * Usage:
 *   import { initDiagramViewer } from './diagram-viewer.js';
 *   initDiagramViewer({
 *     containerId: 'diagram-container',
 *     contentId: 'diagram-content',
 *     zoomInId: 'zoom-in',
 *     zoomOutId: 'zoom-out',
 *     zoomResetId: 'zoom-reset',
 *   });
 *
 * For multi-view pages (toggle between diagrams):
 *   import { initMultiDiagramViewer } from './diagram-viewer.js';
 *   initMultiDiagramViewer({
 *     containerId: 'diagram-container',
 *     views: [
 *       { key: 'voice', contentId: 'voice-content', viewId: 'voice-view', btnId: 'btn-voice' },
 *       { key: 'brain', contentId: 'brain-content', viewId: 'brain-view', btnId: 'btn-brain' },
 *     ],
 *     defaultView: 'voice',
 *     zoomInId: 'zoom-in',
 *     zoomOutId: 'zoom-out',
 *     zoomResetId: 'zoom-reset',
 *   });
 */

var ZOOM_STEP = 0.03;  // wheel-zoom sensitivity (lower = slower)

function centerAndFit(instance, container, target, animate) {
  // Reset to scale 1 to measure true content size
  instance.zoom(1, { animate: false });
  instance.pan(0, 0, { animate: false });

  // Force reflow
  void target.offsetHeight;

  // Measure the SVG directly for accurate dimensions
  var svg = target.querySelector('svg');
  var contentW, contentH;
  if (svg) {
    var bbox = svg.getBoundingClientRect();
    // At scale 1, getBoundingClientRect gives true rendered size
    contentW = bbox.width + 48; // account for padding
    contentH = bbox.height + 48;
  } else {
    contentW = target.offsetWidth;
    contentH = target.offsetHeight;
  }

  var containerW = container.clientWidth;
  var containerH = container.clientHeight;

  // Fit to WIDTH, never enlarging past 100%. Tall diagrams stay readable (you
  // scroll down) instead of shrinking to fit the height; wide diagrams fit width.
  var fitScale = Math.min((containerW - 8) / contentW, 1);
  var scaledW = contentW * fitScale;
  var scaledH = contentH * fitScale;
  var panX = Math.max((containerW - scaledW) / 2, 0);                  // centre horizontally
  var panY = scaledH <= containerH ? (containerH - scaledH) / 2 : 16;  // centre if it fits, else anchor near top

  instance.zoom(fitScale, { animate: false });
  instance.pan(panX, panY, { animate: animate });
}

function attachWheelZoom(container, getInstance) {
  container.addEventListener('wheel', function (e) {
    var inst = getInstance();
    if (!inst) return;
    e.preventDefault();

    // Hold Shift to PAN (scroll the diagram) instead of zoom — handy for long
    // top-to-bottom diagrams. Plain wheel still zooms. Shift maps the wheel onto
    // the vertical axis (some browsers report Shift+wheel as deltaX), while a
    // trackpad's two-axis delta pans in both directions.
    if (e.shiftKey) {
      var dx, dy;
      if (e.deltaY !== 0) {
        // trackpad / normal wheel: pan on both reported axes
        dx = -e.deltaX;
        dy = -e.deltaY;
      } else {
        // mouse wheel + Shift (browser remaps deltaY -> deltaX): scroll vertically
        dx = 0;
        dy = -e.deltaX;
      }
      inst.pan(dx, dy, { relative: true, animate: false });
      return;
    }

    var scale = inst.getScale();
    var step = scale * ZOOM_STEP;
    var toScale = e.deltaY < 0 ? scale + step : scale - step;
    // Zoom around the cursor, not the content's transform origin — plain
    // zoom() anchors at the element centre, which feels like zooming around
    // an arbitrary far-away point on large canvases.
    inst.zoomToPoint(toScale, e, { animate: false });
  }, { passive: false });
}

function createPanzoomInstance(target) {
  return Panzoom(target, {
    maxScale: 10,
    minScale: 0.1,
    startScale: 1,
    animate: true,
    duration: 200,
  });
}

function waitForSvg(target, callback) {
  if (target.querySelector('svg')) {
    callback();
    return;
  }
  var observer = new MutationObserver(function () {
    if (target.querySelector('svg')) {
      observer.disconnect();
      // Small delay for Mermaid to finish layout
      setTimeout(callback, 200);
    }
  });
  observer.observe(target, { childList: true, subtree: true });
  // Fallback
  setTimeout(callback, 3000);
}

/**
 * Single diagram viewer.
 */
function initDiagramViewer(opts) {
  var container = document.getElementById(opts.containerId);
  var target = document.getElementById(opts.contentId);
  if (!container || !target) return;

  waitForSvg(target, function () {
    var instance = createPanzoomInstance(target);
    centerAndFit(instance, container, target, false);

    attachWheelZoom(container, function () { return instance; });

    document.getElementById(opts.zoomInId).addEventListener('click', function () {
      instance.zoomIn();
    });
    document.getElementById(opts.zoomOutId).addEventListener('click', function () {
      instance.zoomOut();
    });
    document.getElementById(opts.zoomResetId).addEventListener('click', function () {
      centerAndFit(instance, container, target, true);
    });

    // Backstop re-fits: the first fit can run before an embedding iframe reaches
    // its final width, leaving the diagram off-centre. Re-fit on full load and
    // once more after layout settles, so the steady-state fit is always correct.
    window.addEventListener('load', function () { centerAndFit(instance, container, target, false); });
    setTimeout(function () { centerAndFit(instance, container, target, false); }, 500);
  });
}

/**
 * Multi-view diagram viewer with toggle.
 */
function initMultiDiagramViewer(opts) {
  var container = document.getElementById(opts.containerId);
  if (!container) return;

  var instances = {};
  var currentView = opts.defaultView;
  var initialized = 0;

  function switchView(key) {
    currentView = key;
    opts.views.forEach(function (v) {
      var viewEl = document.getElementById(v.viewId);
      var btnEl = document.getElementById(v.btnId);
      var isActive = v.key === key;
      viewEl.classList.toggle('active', isActive);
      btnEl.classList.toggle('active', isActive);
    });
    // Re-center after switch
    var data = instances[key];
    if (data) {
      setTimeout(function () {
        centerAndFit(data.instance, container, data.target, true);
      }, 100);
    }
  }

  function onAllReady() {
    // Wheel zoom routes to current view
    attachWheelZoom(container, function () {
      var d = instances[currentView];
      return d ? d.instance : null;
    });

    // Zoom buttons
    document.getElementById(opts.zoomInId).addEventListener('click', function () {
      var d = instances[currentView];
      if (d) d.instance.zoomIn();
    });
    document.getElementById(opts.zoomOutId).addEventListener('click', function () {
      var d = instances[currentView];
      if (d) d.instance.zoomOut();
    });
    document.getElementById(opts.zoomResetId).addEventListener('click', function () {
      var d = instances[currentView];
      if (d) centerAndFit(d.instance, container, d.target, true);
    });

    // Toggle buttons
    opts.views.forEach(function (v) {
      document.getElementById(v.btnId).addEventListener('click', function () {
        switchView(v.key);
      });
    });

    // Initial center on default view
    switchView(currentView);
  }

  opts.views.forEach(function (v) {
    var target = document.getElementById(v.contentId);
    if (!target) return;

    waitForSvg(target, function () {
      var instance = createPanzoomInstance(target);
      instances[v.key] = { instance: instance, target: target };

      // Only center the default view initially
      if (v.key === currentView) {
        centerAndFit(instance, container, target, false);
      }

      initialized++;
      if (initialized === opts.views.length) {
        onAllReady();
      }
    });
  });
}

// Export for use in HTML files
window.DiagramViewer = {
  init: initDiagramViewer,
  initMulti: initMultiDiagramViewer,
};
