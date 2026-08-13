'use strict';

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

function patchResponse(proto) {
  const origWrite = proto.write;
  const origEnd = proto.end;

  function injectHtml(res, body) {
    if (res.__trafficDone) return body;
    const type = String(res.getHeader('content-type') || '');
    if (!type.includes('text/html')) {
      res.__trafficDone = true;
      return body;
    }
    if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
      res.__trafficDone = true;
      return body;
    }
    if (body.includes('__TRAFFIC_SITE__') || body.includes('/tracker.js')) {
      res.__trafficDone = true;
      return body;
    }
    if (!/<head[\s>]/i.test(body)) return body;
    const replaced = body.replace(/<head([^>]*)>/i, `<head$1>${SNIPPET}`);
    if (replaced === body) return body;
    res.__trafficDone = true;
    res.setHeader('content-length', Buffer.byteLength(replaced, 'utf8'));
    return replaced;
  }

  proto.write = function (chunk, encoding, cb) {
    if (!this.__trafficDone && chunk) {
      let text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      this.__trafficBuffer = (this.__trafficBuffer || '') + text;
      if (/<head[\s>]/i.test(this.__trafficBuffer) || this.__trafficBuffer.length > 131072) {
        const injected = injectHtml(this, this.__trafficBuffer);
        this.__trafficBuffer = '';
        chunk = Buffer.from(injected, 'utf8');
      } else {
        return true;
      }
    }
    return origWrite.call(this, chunk, encoding, cb);
  };

  proto.end = function (chunk, encoding, cb) {
    if (!this.__trafficDone) {
      let text = this.__trafficBuffer || '';
      if (chunk) text += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      if (text) {
        const injected = injectHtml(this, text);
        chunk = Buffer.from(injected, 'utf8');
      }
      this.__trafficBuffer = '';
    }
    return origEnd.call(this, chunk, encoding, cb);
  };
}

patchResponse(http.OutgoingMessage.prototype);
