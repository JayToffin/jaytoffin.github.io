# EmailJS Template — Contact Form Toffin Pakistan

Template untuk form kontak `contact.html` (dikirim via `emailjs.sendForm`, lihat `assets/js/toffin-script.js`).
Variabel yang tersedia = atribut `name` pada field form:

| Variabel            | Sumber field                     |
|---------------------|----------------------------------|
| `{{from_name}}`     | Your name                        |
| `{{business_name}}` | Café / restaurant / hotel name   |
| `{{phone}}`         | Phone (+92 …)                    |
| `{{reply_to}}`      | Email pengirim                   |
| `{{message}}`       | Pesan                            |
| `{{to_email}}`      | hidden, `toffinpakistan@gmail.com` |

## Pengaturan template di dashboard EmailJS

Buat template baru di service **service_x9y58zb**, lalu isi tab **Settings**:

| Field       | Nilai                                                      |
|-------------|------------------------------------------------------------|
| To Email    | `{{to_email}}`                                             |
| From Name   | `Toffin Pakistan Website`                                  |
| From Email  | (biarkan "Use Default Email Address")                      |
| Reply To    | `{{reply_to}}`                                             |
| Bcc / Cc    | kosong                                                     |
| Subject     | `New inquiry from {{from_name}} — {{business_name}}`       |

Template ID yang dipakai: **template_piuwdiq**, sudah terpasang di `templateId` pada
`TOFFIN_EMAILJS_CONFIG` (`assets/js/toffin-script.js`).

## Content (mode HTML / code editor)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New inquiry — Toffin Pakistan</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;color:#1f1a16;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e0d8;">

          <!-- Header -->
          <tr>
            <td style="background:#1f1a16;padding:24px 32px;">
              <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;">Toffin Pakistan</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">New inquiry from the website</h1>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:28px 32px 8px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4039;">
                Someone submitted the contact form on <strong>toffin.pk</strong>. Reply directly to this email to respond to them.
              </p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:16px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;width:38%;font-size:13px;color:#8a7f74;text-transform:uppercase;letter-spacing:1px;">Name</td>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;font-size:15px;color:#1f1a16;font-weight:600;">{{from_name}}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;font-size:13px;color:#8a7f74;text-transform:uppercase;letter-spacing:1px;">Business</td>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;font-size:15px;color:#1f1a16;">{{business_name}}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;font-size:13px;color:#8a7f74;text-transform:uppercase;letter-spacing:1px;">Phone</td>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;font-size:15px;"><a href="tel:{{phone}}" style="color:#1f1a16;text-decoration:none;">{{phone}}</a></td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;font-size:13px;color:#8a7f74;text-transform:uppercase;letter-spacing:1px;">Email</td>
                  <td style="padding:12px 0;border-bottom:1px solid #eee8df;font-size:15px;"><a href="mailto:{{reply_to}}" style="color:#1f1a16;text-decoration:underline;">{{reply_to}}</a></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:20px 32px 8px;">
              <p style="margin:0 0 8px;font-size:13px;color:#8a7f74;text-transform:uppercase;letter-spacing:1px;">Message</p>
              <div style="background:#faf8f4;border-left:4px solid #c9a96e;border-radius:6px;padding:16px 18px;font-size:15px;line-height:1.7;color:#1f1a16;white-space:pre-wrap;">{{message}}</div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 32px 8px;" align="left">
              <a href="mailto:{{reply_to}}?subject=Re:%20Your%20inquiry%20to%20Toffin%20Pakistan"
                 style="display:inline-block;background:#c9a96e;color:#1f1a16;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:6px;">
                Reply to {{from_name}}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a7f74;">
                Sent automatically from the contact form at toffin.pk to {{to_email}}.<br />
                Toffin Pakistan · Plot #34, Puran Arcade, SCHS, Sector E-11/2, Islamabad · +92 309 1115951
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Catatan

- Di dashboard EmailJS, buka tab **Content**, klik ikon `</>` (Edit Content → code editor), hapus isi default, tempel HTML di atas.
- Pakai **Test It** dengan nilai contoh untuk memastikan email masuk ke toffinpakistan@gmail.com.
- Kuota EmailJS gratis: 200 email/bulan untuk satu akun (dibagi dengan service Indonesia bila satu akun).
