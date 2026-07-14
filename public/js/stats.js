'use strict';

// Self-hosted Plausible analytics (SGC webstats). No third-party calls.
// The server (/stats) hands us { enabled, src, domain, api }; we inject the
// standard Plausible <script defer data-domain=… src=…> tag. Events post to
// the script origin's /api/event (a public proxy to the mesh-only
// webstats.sgc.ai), or to `api` when an override is configured.

const statsDataKey = 'statsData';
const cachedStats = window.sessionStorage.getItem(statsDataKey);
const apiUrl = window.location.origin + '/stats';

if (cachedStats) {
    setStats(JSON.parse(cachedStats));
} else {
    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            setStats(data);
            window.sessionStorage.setItem(statsDataKey, JSON.stringify(data));
        })
        .catch((error) => {
            console.error('Stats fetch error:', error.message);
        });
}

function setStats(data) {
    const { enabled, src, domain, api } = data || {};
    if (!enabled || !src) return;
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('src', src);
    if (domain) script.setAttribute('data-domain', domain);
    if (api) script.setAttribute('data-api', api);
    document.head.appendChild(script);
}
