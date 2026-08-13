# Droplet deployment

Version `v0.6` runs independently from the other droplet applications:

- Application: `127.0.0.1:3006`
- Public Caddy listener: `:8086`
- Install root: `/opt/ist-website-v0.6`
- Environment: `/etc/ist-website-v0.6.env`
- Service: `ist-website-v0.6.service`
- PostgreSQL database: `ist_website_v06`

The Next.js standalone build must include:

```text
.next/standalone/
├── .next/static/
├── public/
└── server.js
```

The service user needs write access only to:

```text
.next/standalone/data
.next/standalone/public/uploads
```

Validate after deployment:

```bash
systemctl status ist-website-v0.6 --no-pager
curl --fail http://127.0.0.1:3006/
curl --fail http://127.0.0.1:8086/
```
