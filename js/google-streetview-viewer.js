/**
 * Google Maps 360° / Street View Walkthrough Viewer Component
 *
 * Provides an interactive Street View walkthrough experience using Google Maps Platform
 * official APIs (Maps JavaScript API StreetViewPanorama or Maps Embed API).
 *
 * Usage:
 *   const viewer = new GoogleStreetViewWalkthrough({
 *     containerId: 'streetview-container',
 *     latitude: 10.8209446,
 *     longitude: 76.8118097,
 *     heading: 179.12,
 *     pitch: 0,
 *     fov: 75,
 *     googleMapsUrl: 'https://www.google.com/maps/@10.8209446,76.8118097,3a...',
 *     apiKey: window.GOOGLE_MAPS_API_KEY || ''
 *   });
 */

class GoogleStreetViewWalkthrough {
  constructor(options = {}) {
    this.containerId = options.containerId || 'streetview-container';
    this.latitude = options.latitude || 10.8209446;
    this.longitude = options.longitude || 76.8118097;
    this.heading = options.heading !== undefined ? options.heading : 179.12;
    this.pitch = options.pitch !== undefined ? options.pitch : 0;
    this.fov = options.fov || 75;
    this.googleMapsUrl = options.googleMapsUrl || 'https://www.google.com/maps/@10.8209446,76.8118097,3a,75y,179.12h,86.17t/data=!3m8!1e1!3m6!1sCIABIhAxgiiDkVySYleKfYLIizXI!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFP8RcPJzERyzdX1ciqtM_7EQP3xT-yc_SasBPzcGBqdiaGZk0vmMxLnq4W4e6Pf-o8qS1gicsykZp0P6UY0l4LGfE9yAvGAysv39abn93ZsaQ9UitMoVL6MUYi3r_8PE6nWxaNYYTtud2TDJS0%3Dw900-h600-k-no-pi3.8343052273591383-ya4.122231998164352-ro0-fo100!7i11904!8i5952?entry=ttu';
    this.apiKey = options.apiKey || window.GOOGLE_MAPS_API_KEY || (window.ENV && window.ENV.GOOGLE_MAPS_API_KEY) || '';
    this.mode = options.mode || 'auto';
    this.panorama = null;
    this.isLoaded = false;

    this.init();
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.renderContainer(container);
  }

  renderContainer(container) {
    container.innerHTML = `
      <div class="gmp-streetview-card">
        <div class="gmp-streetview-header">
          <div class="gmp-streetview-title">
            <span class="gmp-live-badge"><span class="gmp-pulse-dot"></span> 360° WALKTHROUGH</span>
            <strong>Eden Ayurveda Hospital</strong>
            <span class="gmp-location-sub">· Walayar, Palakkad</span>
          </div>
          <div class="gmp-streetview-actions">
            <button class="gmp-btn-fullscreen" id="${this.containerId}-fs-btn" title="Toggle Fullscreen">⛶</button>
            <a href="${this.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="gmp-btn-maps">
              Open in Google Maps ↗
            </a>
          </div>
        </div>

        <div class="gmp-streetview-viewport" id="${this.containerId}-viewport">
          <!-- Fallback / Start Cover -->
          <div class="gmp-streetview-cover" id="${this.containerId}-cover">
            <div class="gmp-cover-backdrop" style="background-image: url('images/hero_sanctuary.jpg');"></div>
            <div class="gmp-cover-content">
              <div class="gmp-cover-badge">📍 Walayar Campus — NH544 Highway Entrance</div>
              <h3 class="gmp-cover-heading">Explore Eden Ayurveda Hospital in 360°</h3>
              <p class="gmp-cover-desc">
                Step inside the property using Google Maps Street View. Walk through the hospital entrance, pharmacy, and grounds.
              </p>
              <button class="gmp-btn-launch" id="${this.containerId}-launch-btn">
                <span>🌐</span> Launch Interactive Walkthrough
              </button>
              <div class="gmp-cover-subtext">
                <a href="${this.googleMapsUrl}" target="_blank" rel="noopener noreferrer">
                  Or open interactive walkthrough directly in Google Maps app ↗
                </a>
              </div>
            </div>
          </div>

          <!-- Active Street View Holder -->
          <div class="gmp-streetview-render" id="${this.containerId}-render" style="display:none;width:100%;height:100%;"></div>
        </div>
      </div>
    `;

    // Attach Launch Button Listener
    const launchBtn = document.getElementById(`${this.containerId}-launch-btn`);
    if (launchBtn) {
      launchBtn.addEventListener('click', () => this.loadStreetView());
    }

    // Attach Fullscreen Button Listener
    const fsBtn = document.getElementById(`${this.containerId}-fs-btn`);
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }
  }

  loadStreetView() {
    const cover = document.getElementById(`${this.containerId}-cover`);
    const renderEl = document.getElementById(`${this.containerId}-render`);
    const launchBtn = document.getElementById(`${this.containerId}-launch-btn`);

    if (launchBtn) {
      launchBtn.innerHTML = '<span>⏳</span> Loading Google Street View...';
      launchBtn.disabled = true;
    }

    if (this.apiKey) {
      this.loadViaJsApi(renderEl, cover);
    } else {
      this.loadViaEmbed(renderEl, cover);
    }
  }

  loadViaJsApi(renderEl, cover) {
    renderEl.style.display = 'block';

    if (window.google && window.google.maps) {
      this.initJsPanorama(renderEl, cover);
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(this.apiKey)}&solution_id=gmp_git_agentskills_v1`;
      script.async = true;
      script.defer = true;
      script.onload = () => this.initJsPanorama(renderEl, cover);
      script.onerror = () => this.loadViaEmbed(renderEl, cover);
      document.head.appendChild(script);
    }
  }

  initJsPanorama(renderEl, cover) {
    try {
      this.panorama = new google.maps.StreetViewPanorama(renderEl, {
        position: { lat: this.latitude, lng: this.longitude },
        pov: { heading: this.heading, pitch: this.pitch },
        zoom: 1,
        addressControl: true,
        showRoadLabels: true,
        fullscreenControl: true,
        motionTracking: true,
        motionTrackingControl: true,
        linksControl: true, // Enables Google's native navigation chevrons to walk between connected panoramas
        panControl: true,
        enableCloseButton: false
      });

      this.panorama.addListener('status_changed', () => {
        if (this.panorama.getStatus() === google.maps.StreetViewStatus.OK) {
          if (cover) cover.style.display = 'none';
          this.isLoaded = true;
        } else {
          this.loadViaEmbed(renderEl, cover);
        }
      });
    } catch (e) {
      console.warn('Google Maps JS StreetView initialization error, falling back to embed:', e);
      this.loadViaEmbed(renderEl, cover);
    }
  }

  loadViaEmbed(renderEl, cover) {
    renderEl.style.display = 'block';

    if (this.apiKey) {
      const embedUrl = `https://www.google.com/maps/embed/v1/streetview?key=${encodeURIComponent(this.apiKey)}&location=${this.latitude},${this.longitude}&heading=${this.heading}&pitch=${this.pitch}&fov=${this.fov}&solution_id=gmp_git_agentskills_v1`;
      renderEl.innerHTML = `
        <iframe
          title="Google Maps 360 Street View Walkthrough"
          src="${embedUrl}"
          style="width:100%;height:100%;border:none;"
          allowfullscreen
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
      `;
      if (cover) cover.style.display = 'none';
      this.isLoaded = true;
    } else {
      if (cover) {
        cover.innerHTML = `
          <div class="gmp-cover-backdrop" style="background-image: url('images/hero_sanctuary.jpg');"></div>
          <div class="gmp-cover-content">
            <div class="gmp-cover-badge">📍 Eden Ayurveda Hospital · Walayar, Palakkad</div>
            <h3 class="gmp-cover-heading">360° Virtual Property Walkthrough</h3>
            <p class="gmp-cover-desc">
              Experience the full 360° interactive walkthrough of the Walayar hospital campus, entrance, and facilities directly on Google Maps.
            </p>
            <a href="${this.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="gmp-btn-launch" style="text-decoration:none;display:inline-flex;">
              <span>🌐</span> Open 360° Walkthrough in Google Maps ↗
            </a>
            <div class="gmp-cover-subtext" style="margin-top:1.2rem;font-size:0.78rem;color:var(--text-muted);">
              Opens Google Maps Street View with full property navigation controls
            </div>
          </div>
        `;
      }
    }
  }

  toggleFullscreen() {
    const card = document.getElementById(this.containerId);
    if (!card) return;

    if (!document.fullscreenElement) {
      if (card.requestFullscreen) {
        card.requestFullscreen();
      } else if (card.webkitRequestFullscreen) {
        card.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleStreetViewWalkthrough;
} else {
  window.GoogleStreetViewWalkthrough = GoogleStreetViewWalkthrough;
}
