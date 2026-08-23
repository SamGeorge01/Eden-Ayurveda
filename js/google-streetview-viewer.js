/**
 * Google Maps 360° / Street View Walkthrough Viewer Component
 *
 * Embeds Google's official Street View 360° Walkthrough directly inside the website,
 * enabling users to drag, zoom, look around in 360°, and walk through connected panoramas
 * using Google's native on-screen navigation arrows without leaving the page.
 */

class GoogleStreetViewWalkthrough {
  constructor(options = {}) {
    this.containerId = options.containerId || 'streetview-container';
    this.latitude = options.latitude || 10.8209446;
    this.longitude = options.longitude || 76.8118097;
    this.heading = options.heading !== undefined ? options.heading : 175;
    this.pitch = options.pitch !== undefined ? options.pitch : 0;
    // 0.25 provides the full wide-angle unzoomed view matching Google Maps default
    this.fov = options.fov || 0.25;
    this.panoId = options.panoId || 'CIABIhAxgiiDkVySYleKfYLIizXI';
    this.googleMapsUrl = options.googleMapsUrl || 'https://www.google.com/maps/@10.8209446,76.8118097,3a,75y,175h,90t/data=!3m8!1e1!3m6!1sCIABIhAxgiiDkVySYleKfYLIizXI!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FAFP8RcPJzERyzdX1ciqtM_7EQP3xT-yc_SasBPzcGBqdiaGZk0vmMxLnq4W4e6Pf-o8qS1gicsykZp0P6UY0l4LGfE9yAvGAysv39abn93ZsaQ9UitMoVL6MUYi3r_8PE6nWxaNYYTtud2TDJS0%3Dw900-h600-k-no-pi0-ya0-ro0-fo100!7i11904!8i5952?entry=ttu';
    
    // Construct Google Maps native embed URL with wide-angle FOV
    this.embedUrl = options.embedUrl || `https://www.google.com/maps/embed?pb=!4v1724427000000!6m8!1m7!1s${this.panoId}!2m2!1d${this.latitude}!2d${this.longitude}!3f${this.heading}!4f${this.pitch}!5f${this.fov}`;

    this.init();
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.render(container);
  }

  render(container) {
    container.innerHTML = `
      <div class="gmp-streetview-card" id="${this.containerId}-card">
        <div class="gmp-streetview-header">
          <div class="gmp-streetview-title">
            <span class="gmp-live-badge"><span class="gmp-pulse-dot"></span> LIVE 360° WALKTHROUGH</span>
            <strong>Eden Ayurveda Hospital & Pharmacy</strong>
            <span class="gmp-location-sub">· Walayar, Palakkad</span>
          </div>
          <div class="gmp-streetview-actions">
            <button class="gmp-btn-fullscreen" id="${this.containerId}-fs-btn" title="Toggle Fullscreen">⛶ Fullscreen</button>
            <a href="${this.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="gmp-btn-maps">
              Open in Maps App ↗
            </a>
          </div>
        </div>

        <div class="gmp-streetview-viewport" id="${this.containerId}-viewport" style="background: url('images/walayar_360_cover.jpg') center/cover no-repeat;">
          <div class="gmp-loading-skeleton" id="${this.containerId}-skeleton">
            <div class="gmp-skeleton-spinner"></div>
            <span>Connecting to Google 360° Street View...</span>
          </div>

          <iframe
            id="${this.containerId}-iframe"
            title="Eden Ayurveda Hospital 360 Street View Walkthrough"
            src="${this.embedUrl}"
            width="100%"
            height="100%"
            style="border:0; width:100%; height:100%; position:absolute; inset:0; z-index:2;"
            allowfullscreen=""
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    `;

    // Hide skeleton smoothly when iframe finishes loading
    const iframe = document.getElementById(`${this.containerId}-iframe`);
    const skeleton = document.getElementById(`${this.containerId}-skeleton`);
    if (iframe && skeleton) {
      iframe.addEventListener('load', () => {
        skeleton.style.opacity = '0';
        setTimeout(() => {
          skeleton.style.display = 'none';
        }, 400);
      });
    }

    // Attach Fullscreen Toggle
    const fsBtn = document.getElementById(`${this.containerId}-fs-btn`);
    if (fsBtn) {
      fsBtn.addEventListener('click', () => this.toggleFullscreen());
    }
  }

  toggleFullscreen() {
    const card = document.getElementById(`${this.containerId}-card`) || document.getElementById(this.containerId);
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
