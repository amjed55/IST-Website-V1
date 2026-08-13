'use strict';

/**
 * Injects the shared traffic-dashboard tracker into HTML responses.
 *
 * Next.js prerendered pages send Content-Length. Injecting extra bytes without
 * clearing that header truncates responses in browsers. We buffer HTML only,
 * inject once, and strip Content-Length so transfer is chunked.
 */
const CONFIG_BY_PORT = {
  '3003': { site: 'comfort-mobility' },
  '3004': { site: 'lucent-diamond-matcher' },
  '3005': { site: 'northline-agency' },
  '3006': { site: 'ist-website-v0.6' },
};

const cfg = CONFIG_BY_PORT[String(process.env.PORT || '')];
if (!cfg) return;

const ENDPOINT = process.env.TRAFFIC_COLLECT_URL || 'http://142.93.61.217:8082/api/collect';
const TRACKER = process.env.TRAFFIC_TRACKER_URL || 'http://142.93.61.217:8082/tracker.js';
const SNIPPET =
  `<script>window.__TRAFFIC_SITE__=${JSON.stringify(cfg.site)};` +
  `window.__TRAFFIC_ENDPOINT__=${JSON.stringify(ENDPOINT)};</script>` +
  `<script src=${JSON.stringify(TRACKER)} defer></script>`;

const http = require('http');

function contentType(res) {
  return String(res.getHeader?.('content-type') || '');
}

function stripContentLength(res) {
  try {
    res.removeHeader('content-length');
  } catch {
    // ignore
  }
}

function injectHtml(body) {
  if (!body) return body;
  if (body.includes('__TRAFFIC_SITE__') || body.includes('/tracker.js')) return body;
  // Inject before </body> so App Router hydration of <head>/#__next is undisturbed.
  if (/<\/body>/i.test(body)) {
    return body.replace(/<\/body>/i, `${SNIPPET}</body>`);
  }
  if (/<\/html>/i.test(body)) {
    return body.replace(/<\/html>/i, `${SNIPPET}</html>`);
  }
  return `${body}${SNIPPET}`;
}

function decideMode(res, firstChunk) {
  if (res.__trafficMode) return res.__trafficMode;
  const type = contentType(res);
  const encoding = String(res.getHeader?.('content-encoding') || '');
  if ((encoding && encoding !== 'identity') || (res.statusCode >= 300 && res.statusCode < 400)) {
    res.__trafficMode = 'passthrough';
    return res.__trafficMode;
  }
  if (type && !type.includes('text/html')) {
    res.__trafficMode = 'passthrough';
    return res.__trafficMode;
  }
  if (type.includes('text/html')) {
    res.__trafficMode = 'buffer';
    return res.__trafficMode;
  }
  // content-type not set yet — sniff
  if (firstChunk) {
    const sample = Buffer.isBuffer(firstChunk)
      ? firstChunk.subarray(0, 64).toString('utf8')
      : String(firstChunk).slice(0, 64);
    if (/^\s*</.test(sample) || sample.includes('<!DOCTYPE') || sample.includes('<html')) {
      res.__trafficMode = 'buffer';
    } else {
      res.__trafficMode = 'passthrough';
    }
    return res.__trafficMode;
  }
  return null;
}

function patch(proto) {
  const origSetHeader = proto.setHeader;
  const origWriteHead = proto.writeHead;
  const origWrite = proto.write;
  const origEnd = proto.end;

  if (origSetHeader) {
    proto.setHeader = function (name, value) {
      const key = String(name).toLowerCase();
      if (key === 'content-type') {
        const v = String(value || '');
        if (v.includes('text/html')) this.__trafficMode = this.__trafficMode || 'buffer';
        else this.__trafficMode = 'passthrough';
      }
      if (key === 'content-length' && this.__trafficMode === 'buffer') {
        return this;
      }
      return origSetHeader.call(this, name, value);
    };
  }

  if (origWriteHead) {
    proto.writeHead = function (...args) {
      if (this.__trafficMode === 'buffer') {
        stripContentLength(this);
        const headers = args[args.length - 1];
        if (headers && typeof headers === 'object' && !Array.isArray(headers)) {
          delete headers['content-length'];
          delete headers['Content-Length'];
        }
      }
      return origWriteHead.apply(this, args);
    };
  }

  proto.write = function (chunk, encoding, cb) {
    const mode = decideMode(this, chunk);
    if (mode !== 'buffer') {
      return origWrite.call(this, chunk, encoding, cb);
    }
    if (chunk) {
      const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      this.__trafficBuffer = (this.__trafficBuffer || '') + text;
    }
    if (typeof encoding === 'function') cb = encoding;
    if (typeof cb === 'function') cb();
    return true;
  };

  proto.end = function (chunk, encoding, cb) {
    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = null;
      encoding = undefined;
    } else if (typeof encoding === 'function') {
      cb = encoding;
      encoding = undefined;
    }

    const mode = decideMode(this, chunk || this.__trafficBuffer);
    if (mode !== 'buffer') {
      if (this.__trafficBuffer) {
        const prior = this.__trafficBuffer;
        this.__trafficBuffer = '';
        origWrite.call(this, prior);
      }
      return origEnd.call(this, chunk, encoding, cb);
    }

    if (chunk) {
      const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      this.__trafficBuffer = (this.__trafficBuffer || '') + text;
    }

    const body = injectHtml(this.__trafficBuffer || '');
    this.__trafficBuffer = '';
    this.__trafficMode = 'passthrough';
    stripContentLength(this);
    return origEnd.call(this, body, 'utf8', cb);
  };
}

patch(http.OutgoingMessage.prototype);
if (http.ServerResponse?.prototype && http.ServerResponse.prototype !== http.OutgoingMessage.prototype) {
  patch(http.ServerResponse.prototype);
}
