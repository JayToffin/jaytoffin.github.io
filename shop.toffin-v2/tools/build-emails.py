# Generator template email shop.toffin-v2 (langkah 77). Menulis ulang email-*.html dari komponen bersama.
# Email-safe: tabel, gaya inline, lebar 600px, tanpa SVG (ikon = PNG di images/email/), font Nunito Sans + cadangan.
import os, re, html as H
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))   # folder shop.toffin-v2
# Jalankan: python3 tools/build-emails.py  (menimpa semua email-*.html)

F = "'Nunito Sans',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
INK, BODY, MUTED, LINE = '#212121', '#31353b', '#6d7588', '#e5e7e9'
OR, ORD, ORS = '#f8941f', '#e07c0c', '#fff4e7'
GR, GRS, RD, RDS = '#16a34a', '#e8f7ee', '#d6453d', '#fff1f1'
WA = 'https://wa.me/628119983378'
e = H.escape

# Title Case judul (PUEBI: kata tugas tetap kecil kecuali di awal); keputusan Rendi 2026-11-09, MIGRASI langkah 79
SMALL = {'dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'atau', 'dengan', 'pada', 'oleh', 'bagi', 'tentang', 'sebagai',
         'atas', 'dalam', 'serta', 'agar', 'saat', 'sejak', 'per', 'hingga', 'tanpa', 'bila', 'jika', 'kepada', 'daripada', 'pun', 'a', 'an', 'the', 'of', 'for', 'to', 'in', 'on', 'and', 'or'}
KEEP = {'mm', 'kg', 'ml', 'gr', 'g', 'l', 'pcs', 'x', 'vs'}

def tc_word(w, first):
    if not w or not w[0].isalpha(): return w
    if any(ch.isdigit() for ch in w) or '.' in w.strip('.') or '@' in w: return w        # 58mm, toffin.id, email
    if w != w.lower(): return w                                                          # ID, TFN, iPhone, E-Commerce
    if w in KEEP: return w
    if not first and w in SMALL: return w
    return '-'.join(p[:1].upper() + p[1:] for p in w.split('-')) if '-' in w else w[:1].upper() + w[1:]

def tc(text, first=True):
    out, f = [], first
    for tok in re.split(r'(\s+|/|\(|\)|&amp;|:|\.\s)', text):
        if tok is None or tok == '': continue
        if re.fullmatch(r'\s+|/|\(|\)|&amp;|:|\.\s', tok):
            out.append(tok)
            if tok in (':', '. ', '(') or tok.startswith('.'): f = True
            continue
        m = re.match(r'^([^\wÀ-ÿ]*)(.*?)([^\wÀ-ÿ]*)$', tok)
        pre, core, post = m.groups()
        out.append(pre + tc_word(core, f) + post); f = False if core else f
    return ''.join(out)



def T(inner, w='100%', style=''):
    return f'<table role="presentation" width="{w}" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;{style}">{inner}</table>'

# ---------- komponen ----------
def hero(badge, eyebrow, title, lead='', tone='o'):
    eyebrow, title = tc(eyebrow), tc(title)
    col = {'o': ORD, 'g': GR, 'r': RD}[tone]
    return (f'<tr><td style="padding:0 0 8px"><img src="images/email/{badge}.png" width="56" height="56" alt="" style="display:block;border:0;width:56px;height:56px"></td></tr>'
            f'<tr><td style="padding:10px 0 0;font-family:{F};font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:{col}">{eyebrow}</td></tr>'
            f'<tr><td class="h1" style="padding:6px 0 0;font-family:{F};font-size:26px;line-height:1.25;font-weight:900;color:{INK};letter-spacing:-.01em">{title}</td></tr>'
            + (f'<tr><td style="padding:10px 0 0;font-family:{F};font-size:15px;line-height:1.6;color:{BODY}">{lead}</td></tr>' if lead else ''))

def p(t, pad='16px 0 0', size=15, color=BODY):
    return f'<tr><td style="padding:{pad};font-family:{F};font-size:{size}px;line-height:1.6;color:{color}">{t}</td></tr>'

def hi(name): return p(f'Halo <b style="color:{INK}">{e(name)}</b>,', '24px 0 0')

def section(title, right=''):
    title = tc(title)
    r = f'<td align="right" style="font-family:{F};font-size:13px;font-weight:700;color:{MUTED}">{right}</td>' if right else ''
    return f'<tr><td style="padding:28px 0 10px">{T(f"<tr><td style=\"font-family:{F};font-size:16px;font-weight:900;color:{INK}\">{title}</td>{r}</tr>")}</td></tr>'

def box(inner, bg='#fafbfc', border=LINE, pad='6px 18px'):
    return f'<tr><td style="padding:16px 0 0">{T(f"<tr><td style=\"padding:{pad};background:{bg};border:1px solid {border};border-radius:14px\">{T(inner)}</td></tr>")}</td></tr>'

def kv(rows, first_pad=True):
    """baris label | nilai (nilai rata kanan, tebal); garis putus-putus di antaranya"""
    out = ''
    for i, (k, v) in enumerate(rows):
        bt = '' if i == 0 else f'border-top:1px dashed {LINE};'
        out += (f'<tr><td class="kvk" style="{bt}padding:11px 12px 11px 0;font-family:{F};font-size:13px;color:{MUTED};vertical-align:top;width:42%">{k}</td>'
                f'<td class="kvv" style="{bt}padding:11px 0;font-family:{F};font-size:14px;font-weight:700;color:{INK};text-align:right;vertical-align:top">{v}</td></tr>')
    return out

def amount(label, value, sub='', tone='o'):
    bg, bd, col = {'o': (ORS, '#fde3c4', ORD), 'g': (GRS, '#c7efd6', GR)}[tone]
    inner = (f'<tr><td style="font-family:{F};font-size:13px;font-weight:700;color:{MUTED}">{label}</td></tr>'
             f'<tr><td class="amt" style="padding-top:4px;font-family:{F};font-size:30px;line-height:1.15;font-weight:900;color:{INK};letter-spacing:-.01em">{value}</td></tr>'
             + (f'<tr><td style="padding-top:6px;font-family:{F};font-size:13px;font-weight:700;color:{col}">{sub}</td></tr>' if sub else ''))
    return box(inner, bg, bd, '18px 20px')

def steps(cur, labels=('Dibuat', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai')):
    """progres: langkah < cur selesai (hijau ✓), = cur aktif (oranye), > cur abu-abu"""
    tds = ''
    w = int(100 / len(labels))
    for i, l in enumerate(labels):
        if i < cur: bg, fg, mark, lc = GR, '#ffffff', '&#10003;', INK
        elif i == cur: bg, fg, mark, lc = OR, '#ffffff', str(i + 1), ORD
        else: bg, fg, mark, lc = '#eceef1', '#9ca3af', str(i + 1), '#9ca3af'
        dot = T(f'<tr><td align="center" width="30" height="30" style="width:30px;height:30px;border-radius:15px;background:{bg};color:{fg};font-family:{F};font-size:13px;font-weight:900;line-height:30px;text-align:center">{mark}</td></tr>', w='30', style='margin:0 auto')
        tds += f'<td width="{w}%" align="center" valign="top" style="padding:0 2px">{dot}<div style="padding-top:7px;font-family:{F};font-size:11.5px;line-height:1.3;font-weight:800;color:{lc}">{l}</div></td>'
    return f'<tr><td style="padding:22px 0 0">{T("<tr>" + tds + "</tr>")}</td></tr>'

def items(rows):
    """rows: (nama, varian, qty, harga, harga_coret, label)"""
    out = ''
    for i, (n, var, q, pr, old, tag) in enumerate(rows):
        bt = '' if i == 0 else f'border-top:1px solid {LINE};'
        tg = f'<span style="display:inline-block;margin-bottom:4px;padding:2px 8px;border-radius:999px;background:{RDS};color:{RD};font-size:11px;font-weight:800">{tag}</span><br>' if tag else ''
        vr = f'<br><span style="color:{MUTED};font-size:12.5px;font-weight:600">{var}</span>' if var else ''
        od = f' <s style="color:#9ca3af">{rp(old)}</s>' if old else ''
        out += (f'<tr><td style="{bt}padding:14px 12px 14px 0;font-family:{F};font-size:14px;line-height:1.45;color:{INK};font-weight:800;vertical-align:top">{tg}{e(n)}{vr}'
                f'<br><span style="color:{BODY};font-size:13px;font-weight:600">{q} &times; {rp(pr)}{od}</span></td>'
                f'<td style="{bt}padding:14px 0;font-family:{F};font-size:14px;font-weight:800;color:{INK};text-align:right;vertical-align:top;white-space:nowrap">{rp(pr * q)}</td></tr>')
    return f'<tr><td>{T(out)}</td></tr>'

def totals(rows, total_label, total, save=None, earn=None):
    out = ''
    for k, v, disc in rows:
        c = GR if disc else BODY
        out += f'<tr><td style="padding:5px 0;font-family:{F};font-size:13.5px;color:{BODY}">{k}</td><td style="padding:5px 0;font-family:{F};font-size:13.5px;color:{c};text-align:right;font-weight:{700 if disc else 600}">{v}</td></tr>'
    out += (f'<tr><td style="padding:14px 0 4px;border-top:1px solid {LINE};font-family:{F};font-size:15px;font-weight:900;color:{INK}">{total_label}</td>'
            f'<td style="padding:14px 0 4px;border-top:1px solid {LINE};font-family:{F};font-size:20px;font-weight:900;color:{INK};text-align:right">{total}</td></tr>')
    s = ''
    if save:
        row = f'<tr><td style="font-family:{F};font-size:13px;font-weight:800;color:{GR}">Anda hemat</td><td style="font-family:{F};font-size:13px;font-weight:900;color:{GR};text-align:right">{save}</td></tr>'
        s += f'<tr><td style="padding-top:10px">{T(f"<tr><td style=\"padding:10px 14px;background:{GRS};border-radius:10px\">" + T(row) + "</td></tr>")}</td></tr>'
    if earn:
        s += p(earn, '10px 0 0', 12.5, MUTED)
    return f'<tr><td style="padding:14px 0 0;border-top:1px solid {LINE}">{T(out)}</td></tr>' + s

def address(label, name, phone, line, extra=''):
    inner = (f'<tr><td style="padding:12px 0 2px;font-family:{F};font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:{MUTED}">{label}</td></tr>'
             f'<tr><td style="font-family:{F};font-size:14px;line-height:1.55;color:{BODY}"><b style="color:{INK}">{e(name)}</b> &middot; {e(phone)}<br>{e(line)}</td></tr>'
             + (f'<tr><td style="padding:10px 0 12px;font-family:{F};font-size:13px;color:{BODY}">{extra}</td></tr>' if extra else '<tr><td style="height:12px"></td></tr>'))
    return box(inner)

def button(text, href, kind='primary', pad='28px 0 0'):
    if kind == 'primary': bg, fg, bd = OR, '#ffffff', OR
    else: bg, fg, bd = '#ffffff', INK, '#d6d9de'
    a = f'<a href="{href}" target="_blank" style="display:block;padding:15px 28px;font-family:{F};font-size:15px;font-weight:800;color:{fg};text-decoration:none;text-align:center;border-radius:999px">{text}</a>'
    return f'<tr><td style="padding:{pad}">{T(f"<tr><td align=\"center\" style=\"background:{bg};border:1px solid {bd};border-radius:999px\">{a}</td></tr>")}</td></tr>'

def fallback(href):
    return p(f'Tombol tidak berfungsi? Salin tautan ini ke browser:<br><a href="{href}" style="color:{ORD};word-break:break-all">{href}</a>', '14px 0 0', 12.5, MUTED)

def note(t, tone='o', title=''):
    bg, bd, col = {'o': (ORS, OR, '#9a3412'), 'g': (GRS, GR, '#166534'), 'r': (RDS, RD, '#991b1b'), 'm': ('#f6f7f9', '#cbd0d8', BODY)}[tone]
    tt = f'<b style="display:block;margin-bottom:2px;color:{INK}">{tc(title)}</b>' if title else ''
    return f'<tr><td style="padding:20px 0 0">{T(f"<tr><td style=\"padding:14px 16px;background:{bg};border-left:4px solid {bd};border-radius:10px;font-family:{F};font-size:13.5px;line-height:1.55;color:{col}\">{tt}{t}</td></tr>")}</td></tr>'

def bullets(lines, mark='&#10003;', color=GR):
    out = ''.join(f'<tr><td width="26" valign="top" style="padding:6px 0;font-family:{F};font-size:14px;font-weight:900;color:{color}">{mark}</td><td style="padding:6px 0;font-family:{F};font-size:14.5px;line-height:1.5;color:{BODY}">{l}</td></tr>' for l in lines)
    return f'<tr><td style="padding:10px 0 0">{T(out)}</td></tr>'

def numbered(lines):
    out = ''.join(f'<tr><td width="38" valign="top" style="padding:7px 0">{T(f"<tr><td align=\"center\" width=\"26\" height=\"26\" style=\"width:26px;height:26px;border-radius:13px;background:{ORS};color:{ORD};font-family:{F};font-size:12.5px;font-weight:900;line-height:26px;text-align:center\">{i + 1}</td></tr>", w="26")}</td><td style="padding:9px 0 7px;font-family:{F};font-size:14.5px;line-height:1.5;color:{BODY}">{l}</td></tr>' for i, l in enumerate(lines))
    return f'<tr><td style="padding:8px 0 0">{T(out)}</td></tr>'

def signoff(team='Tim Toffin Indonesia'):
    return p(f'Salam hangat,<br><b style="color:{INK}">{team}</b>', '28px 0 0')

def rp(n): return 'Rp ' + f'{n:,}'.replace(',', '.')

# ---------- kerangka ----------
def page(fname, title, pre, body, audience='Anda menerima email ini karena memiliki akun di shop.toffin.id.', help=True, logo='images/toffin-logo.png', logo_w=112, comment=''):
    helpcard = ''
    if help:
        helpcard = (f'<tr><td style="padding:16px 0 0">{T(f"<tr><td style=\"padding:16px 20px;background:#ffffff;border:1px solid #eceef1;border-radius:16px\">" + T(f"<tr><td width=\"44\" valign=\"middle\"><img src=\"images/email/ico-wa.png\" width=\"28\" height=\"28\" alt=\"\" style=\"display:block;border:0\"></td><td valign=\"middle\" style=\"font-family:{F};font-size:13.5px;line-height:1.45;color:{BODY}\"><b style=\"color:{INK}\">Butuh Bantuan?</b> Tim Toffin siap membantu lewat WhatsApp.</td><td align=\"right\" valign=\"middle\" style=\"padding-left:10px\"><a href=\"{WA}\" target=\"_blank\" style=\"display:inline-block;padding:9px 16px;border:1px solid #c7efd6;border-radius:999px;background:{GRS};font-family:{F};font-size:13px;font-weight:800;color:{GR};text-decoration:none;white-space:nowrap\">Chat kami</a></td></tr>") + "</td></tr>")}</td></tr>')
    lh = round(logo_w * 305 / 1000) if 'toffin-logo' in logo else round(logo_w * 1512 / 6621)
    return f'''<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{e(tc(title))}</title>
<!-- Template email Toffin v2 (MIGRASI.md langkah 77), dibuat dari generator bersama supaya semua email seragam.
     {comment}
     Data di bawah adalah contoh. Produksi: template mail Odoo (QWeb), nilai diganti field record; tautan relatif prototipe
     diganti URL absolut https://shop.toffin.id/...; gambar di images/email/ di-host di domain yang sama. -->
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  body,table,td,a {{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}
  table,td {{ mso-table-lspace:0pt; mso-table-rspace:0pt; }}
  img {{ -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }}
  body {{ margin:0 !important; padding:0 !important; width:100% !important; }}
  a[x-apple-data-detectors] {{ color:inherit !important; text-decoration:none !important; font:inherit !important; }}
  @media screen and (max-width:620px) {{
    .wrap {{ padding:0 12px !important; }}
    .card {{ padding:28px 20px 30px !important; }}
    .h1 {{ font-size:22px !important; }}
    .amt {{ font-size:26px !important; }}
    .kvk, .kvv {{ display:block !important; width:100% !important; text-align:left !important; }}
    .kvk {{ padding-bottom:0 !important; }}
    .kvv {{ border-top:0 !important; padding-top:2px !important; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background:#f4f5f7">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#f4f5f7">{e(pre)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f5f7">
<tr><td align="center" class="wrap" style="padding:0 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
  <tr><td style="padding:30px 4px 18px"><a href="index.html" target="_blank"><img src="{logo}" width="{logo_w}" height="{lh}" alt="Toffin" style="display:block;border:0;width:{logo_w}px;height:auto"></a></td></tr>
  <tr><td style="background:#ffffff;border:1px solid #eceef1;border-radius:20px;border-top:4px solid {OR}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="card" style="padding:36px 40px 38px">
      {T(body)}
    </td></tr></table>
  </td></tr>
  {helpcard}
  <tr><td align="center" style="padding:26px 12px 34px;font-family:{F};font-size:12px;line-height:1.7;color:{MUTED}">
    <a href="index.html" target="_blank" style="color:{BODY};font-weight:800;text-decoration:none">shop.toffin.id</a> &nbsp;&middot;&nbsp;
    <a href="faq.html" target="_blank" style="color:{BODY};font-weight:800;text-decoration:none">FAQ</a> &nbsp;&middot;&nbsp;
    <a href="kebijakan-privasi.html" target="_blank" style="color:{BODY};font-weight:800;text-decoration:none">Kebijakan Privasi</a><br>
    Toffin Indonesia &middot; Jl. Pluit Permai No. 4, Pluit, Penjaringan, Jakarta Utara 14450<br>
    {audience} Email ini dikirim otomatis, mohon tidak dibalas.<br>
    &copy; 2026 Toffin Indonesia. Semua hak dilindungi.
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
'''

def write(fname, *a, **k):
    open(fname, 'w', encoding='utf-8').write(page(fname, *a, **k))

# ---------- data contoh (sama dengan detail-pembelian.html, SO/2026/10/0421) ----------
SO = 'SO/2026/10/0421'
DETAIL = 'detail-pembelian.html?so=' + SO
ITEMS = [('Eureka Mignon Zero 65 mm', 'Warna: Hitam', 1, 7490000, 9850000, 'Flash Sale'),
         ('Toffin House Blend Ground Coffee 1 kg', '', 2, 255000, 0, '')]
TOT_ROWS = [('Total harga (3 barang)', rp(10360000), False), ('Diskon produk', '&minus;' + rp(2360000), True),
            ('Ongkos kirim (JNE REG)', rp(85000), False), ('Biaya packing', rp(150000), False), ('Biaya admin', rp(4000), False)]
ADDR = ('Kirim ke &middot; Kantor', 'Rendi Bagus', '0812 2200 0XXX', 'Jl. Pluit Permai No. 4, RT.9/RW.4, Pluit, Penjaringan, Jakarta Utara, DKI Jakarta 14450')
def order_block(right='Distributor Toffin Jakarta', earn='Dapat <b style="color:#e07c0c">8.000</b> Toffin Point setelah pesanan selesai.'):
    return section(f'Pesanan {SO}', right) + items(ITEMS) + totals(TOT_ROWS, 'Total', rp(8239000), rp(2360000), earn)

# 1. menunggu pembayaran
write('email-order-confirmed.html', 'Selesaikan pembayaran pesanan ' + SO, 'Bayar Rp 8.239.000 sebelum Kamis, 15 Oktober 2026, 11.40 WIB lewat Virtual Account BCA.',
    hero('pending', 'Menunggu pembayaran', 'Selesaikan pembayaran pesanan Anda', 'Pesanan <b>' + SO + '</b> sudah kami terima. Barang kami siapkan setelah pembayaran masuk.')
    + amount('Total tagihan', rp(8239000), 'Bayar sebelum Kamis, 15 Oktober 2026, 11.40 WIB')
    + box(kv([('Metode pembayaran', 'Virtual Account BCA'), ('Nomor Virtual Account', f'<span style="font-size:17px;letter-spacing:.06em;color:{ORD}">8077 0812 2200 0421</span>'), ('Dipesan', 'Rabu, 14 Oktober 2026, 11.40 WIB')]))
    + button('Bayar sekarang', 'success-checkout.html')
    + p('Pesanan dibatalkan otomatis bila pembayaran melewati batas waktu.', '12px 0 0', 12.5, MUTED)
    + steps(1) + order_block() + address(*ADDR, extra='Pengiriman: <b>JNE REG</b> &middot; 2&ndash;3 hari setelah dikirim')
    + signoff(), comment='Pesanan dibuat, menunggu pembayaran (sale.order draft + invoice Xendit).')

# 2. pembayaran diterima
write('email-payment-confirmed.html', 'Pembayaran pesanan ' + SO + ' diterima', 'Pembayaran Rp 8.239.000 sudah kami terima. Pesanan sedang disiapkan gudang Toffin Jakarta.',
    hero('paid', 'Pembayaran diterima', 'Terima kasih, pembayaran Anda sudah masuk', 'Pesanan <b>' + SO + '</b> sedang disiapkan gudang Toffin Jakarta. Nomor resi kami kirim setelah barang dikirim.', 'g')
    + amount('Total dibayar', rp(8239000), 'Lunas &middot; Rabu, 14 Oktober 2026, 12.05 WIB', 'g')
    + box(kv([('Metode pembayaran', 'Virtual Account BCA'), ('No. pesanan', SO)]))
    + button('Lihat detail pesanan', DETAIL)
    + steps(2) + order_block() + address(*ADDR, extra='Pengiriman: <b>JNE REG</b> &middot; 2&ndash;3 hari setelah dikirim')
    + signoff(), comment='Pembayaran diterima (callback Xendit, pesanan dikonfirmasi).')

# 3. pesanan diterima
write('email-delivered.html', 'Pesanan ' + SO + ' sudah sampai', 'Pesanan Anda sudah diterima. Periksa paket dan ajukan klaim maksimal 1x24 jam bila ada kendala.',
    hero('delivered', 'Pesanan selesai', 'Pesanan Anda sudah sampai', 'Paket pesanan <b>' + SO + '</b> diterima pada <b>Sabtu, 17 Oktober 2026, 14.20 WIB</b>. Terima kasih sudah berbelanja di Toffin.', 'g')
    + note('Klaim barang rusak, kurang, atau tidak sesuai diterima <b>maksimal 1x24 jam</b> sejak diterima, yaitu sampai <b>Minggu, 18 Oktober 2026, 14.20 WIB</b>. Siapkan video unboxing tanpa jeda.', 'o', 'Periksa paket Anda sekarang')
    + button('Lihat detail pesanan', DETAIL) + button('Beli lagi', 'cart.html', 'secondary', '10px 0 0')
    + steps(5) + order_block(earn=None) + note('<b>8.000 Toffin Point</b> sudah masuk ke akun Anda dan bisa dipakai di belanja berikutnya.', 'g')
    + address('Diterima di &middot; Kantor', 'Rendi Bagus', '0812 2200 0XXX', ADDR[3], 'Dikirim dengan <b>JNE REG</b> &middot; Resi JR0042100777')
    + signoff(), comment='Pesanan diterima (stock.picking selesai). Fitur rating produk sudah tidak ada, jadi tombol "Beri penilaian" diganti info masa klaim.')

# 4. servis credit: menunggu pembayaran
SC = 'SO/2026/10/0433'
SC_ROWS = [('Total harga (1 barang)', rp(250000), False), ('Biaya admin', rp(4000), False)]
write('email-order-confirmed-servis-credit.html', 'Selesaikan pembayaran Servis Credit ' + SC, 'Bayar Rp 254.000 sebelum Jumat, 16 Oktober 2026, 10.15 WIB untuk mengaktifkan Servis Credit.',
    hero('scredit', 'Menunggu pembayaran', 'Selesaikan pembayaran Servis Credit', 'Servis Credit aktif di akun Anda setelah pembayaran pesanan <b>' + SC + '</b> masuk.')
    + amount('Total tagihan', rp(254000), 'Bayar sebelum Jumat, 16 Oktober 2026, 10.15 WIB')
    + box(kv([('Metode pembayaran', 'Virtual Account BCA'), ('Nomor Virtual Account', f'<span style="font-size:17px;letter-spacing:.06em;color:{ORD}">8077 0812 2200 0433</span>'), ('Dipesan', 'Kamis, 15 Oktober 2026, 10.15 WIB')]))
    + button('Bayar sekarang', 'success-checkout.html')
    + section('Pesanan ' + SC) + items([('Servis Credit', '1 kredit &middot; untuk After Sales &amp; Training', 1, 250000, 0, '')])
    + totals(SC_ROWS, 'Total', rp(254000))
    + note('Servis Credit dipakai untuk permintaan After Sales dan Training di Toffin App.', 'm')
    + signoff(), comment='Pembelian Servis Credit, menunggu pembayaran.')

# 5. servis credit: lunas
write('email-payment-service-credit.html', 'Servis Credit Anda sudah aktif', 'Pembayaran Rp 254.000 diterima. Servis Credit siap dipakai untuk After Sales dan Training di Toffin App.',
    hero('scredit-paid', 'Pembayaran diterima', 'Servis Credit Anda sudah aktif', 'Terima kasih. Pembayaran pesanan <b>' + SC + '</b> sudah kami terima dan Servis Credit sudah masuk ke akun Anda.', 'g')
    + amount('Total dibayar', rp(254000), 'Lunas &middot; Kamis, 15 Oktober 2026, 10.32 WIB', 'g')
    + box(kv([('Metode pembayaran', 'Virtual Account BCA'), ('No. pesanan', SC), ('Servis Credit', '1 kredit')]))
    + button('Lihat detail transaksi', 'my-account.html#belanja')
    + section('Rincian') + items([('Servis Credit', '1 kredit', 1, 250000, 0, '')]) + totals(SC_ROWS, 'Total', rp(254000))
    + note('Gunakan Servis Credit untuk permintaan <b>After Sales</b> dan <b>Training</b> di Toffin App sebelum masa berlakunya habis.', 'o', 'Cara memakai')
    + signoff(), comment='Servis Credit lunas.')

# 6. after sales
write('email-payment-aftersales.html', 'Permintaan servis FO/2026/10/0255 terkonfirmasi', 'Pembayaran servis diterima. Teknisi Toffin akan menghubungi Anda untuk menjadwalkan kunjungan.',
    hero('service', 'Servis terkonfirmasi', 'Permintaan servis Anda kami terima', 'Pembayaran tiket <b>FO/2026/10/0255</b> sudah masuk. Tim Customer Service Technician kami akan menghubungi Anda untuk menjadwalkan kunjungan.', 'g')
    + section('Detail servis')
    + box(kv([('No. tiket', 'FO/2026/10/0255'), ('Mesin', 'Nuova Simonelli Oscar Mood'), ('Nomor seri', '12340349'), ('Status garansi', 'Di luar garansi'),
              ('Tipe servis', 'Perbaikan'), ('Kendala', 'Mesin bocor'), ('Tanggal tiket', 'Selasa, 20 Oktober 2026')]))
    + section('Pembayaran')
    + box(kv([('Total dibayar', f'<span style="font-size:17px">{rp(254000)}</span>'), ('Metode pembayaran', 'Virtual Account BCA'), ('Waktu pembayaran', 'Selasa, 20 Oktober 2026, 10.12 WIB')]))
    + button('Lihat detail transaksi', 'my-account.html#belanja')
    + note('Pastikan nomor handphone Anda aktif supaya teknisi bisa menghubungi Anda.', 'o')
    + signoff(), comment='After Sales (servis mesin) lunas.')

# 7. training
write('email-payment-training.html', 'Jadwal training Anda terkonfirmasi', 'Training Pengembangan Produk, Jumat 23 Oktober 2026, 09.30–11.30 WIB di Toffin Showroom.',
    hero('training', 'Training terkonfirmasi', 'Sampai jumpa di sesi training', 'Pembayaran sudah kami terima dan jadwal training Anda sudah terkonfirmasi.', 'g')
    + box(kv([('Jadwal', 'Jumat, 23 Oktober 2026'), ('Sesi', 'Sesi 1 &middot; 09.30&ndash;11.30 WIB'), ('Tipe training', 'Pengembangan Produk'), ('Trainer', 'Angga Tunjung')]), ORS, '#fde3c4')
    + section('Lokasi')
    + address('Toffin Showroom', 'PIC: Stephanie', '+62 812 3456 7890', 'Jl. Pluit Permai No. 4, RT.1/RW.7, Pluit, Penjaringan, Jakarta Utara, DKI Jakarta 14450')
    + section('Pembayaran')
    + box(kv([('No. pesanan', 'TR/2026/10/0018'), ('Total dibayar', f'<span style="font-size:17px">{rp(1500000)}</span>'), ('Metode pembayaran', 'Virtual Account BCA'), ('Waktu pembayaran', 'Kamis, 15 Oktober 2026, 07.29 WIB')]))
    + button('Lihat detail transaksi', 'my-account.html#belanja')
    + note('Trainer kami akan menghubungi PIC untuk konfirmasi ulang. Pastikan nomor handphone PIC aktif.', 'o')
    + signoff(), comment='Training lunas dan terjadwal.')

# 8. credit limit jatuh tempo
CL = [('Jumat, 2 Okt 2026', 'SO/2026/10/0302', 1850000), ('Jumat, 9 Okt 2026', 'SO/2026/10/0355', 1150000)]
cl_rows = ''.join(f'<tr><td style="padding:12px 10px 12px 0;{"" if i == 0 else f"border-top:1px solid {LINE};"}font-family:{F};font-size:13.5px;color:{INK};font-weight:800">{s}<br><span style="color:{MUTED};font-size:12px;font-weight:600">{d}</span></td>'
                  f'<td style="padding:12px 0;{"" if i == 0 else f"border-top:1px solid {LINE};"}font-family:{F};font-size:13.5px;font-weight:800;color:{INK};text-align:right;white-space:nowrap">{rp(v)}<br><span style="display:inline-block;margin-top:3px;padding:1px 8px;border-radius:999px;background:{RDS};color:{RD};font-size:11px">Belum dibayar</span></td></tr>' for i, (d, s, v) in enumerate(CL))
write('email-credit-limit.html', 'Tagihan Credit Limit jatuh tempo 2 November 2026', 'Tagihan Credit Limit Rp 3.000.000 jatuh tempo Senin, 2 November 2026. Bayar agar Credit Limit bisa dipakai lagi.',
    hero('due', 'Pengingat tagihan', 'Tagihan Credit Limit Anda segera jatuh tempo', 'Bayar sebelum tanggal jatuh tempo supaya Credit Limit tetap bisa dipakai untuk transaksi berikutnya.')
    + amount('Total tagihan', rp(3000000), 'Jatuh tempo Senin, 2 November 2026')
    + section('Transaksi yang ditagih', '2 transaksi') + f'<tr><td>{T(cl_rows)}</td></tr>'
    + button('Bayar tagihan', 'my-account.html#ringkasan') + fallback('https://shop.toffin.id/my/credit-limit')
    + note('Selama tagihan belum dibayar setelah jatuh tempo, Credit Limit tidak bisa dipakai untuk transaksi baru.', 'm')
    + signoff(), comment='Pengingat Credit Limit jatuh tempo.')

# 9. lupa kata sandi
write('email-forgot-password.html', 'Atur ulang kata sandi akun Toffin', 'Klik tautan di email ini untuk membuat kata sandi baru akun Toffin Anda.',
    hero('password', 'Keamanan akun', 'Atur ulang kata sandi Anda', 'Kami menerima permintaan untuk mengganti kata sandi akun <b>rendi@toffin.id</b>. Klik tombol di bawah untuk membuat kata sandi baru.')
    + button('Buat kata sandi baru', 'reset-password.html') + fallback('https://shop.toffin.id/web/reset_password?token=contoh')
    + note('Tidak merasa meminta ganti kata sandi? Abaikan email ini. Kata sandi Anda tidak berubah dan akun tetap aman.', 'm', 'Bukan Anda?')
    + signoff(), comment='Lupa kata sandi (auth_signup reset_password).')

# 10. verifikasi email: kode OTP (alur check-email.html / existing-user.html -> otp.html)
code = ''.join(f'<td align="center" width="44" height="54" style="width:44px;height:54px;border:1px solid #fde3c4;border-radius:12px;background:#ffffff;font-family:{F};font-size:26px;font-weight:900;color:{INK};line-height:54px;text-align:center">{c}</td><td width="8" style="width:8px"></td>' for c in '123456')
write('email-verify-account.html', 'Kode verifikasi akun Toffin: 123456', 'Kode verifikasi Anda 123456. Berlaku 5 menit. Jangan berikan kode ini kepada siapa pun.',
    hero('verify', 'Verifikasi email', 'Masukkan kode ini untuk mengaktifkan akun', 'Ketik kode 6 digit di bawah pada halaman verifikasi Toffin.')
    + f'<tr><td style="padding:22px 0 0">{T(f"<tr><td align=\"center\" style=\"padding:22px 12px;background:{ORS};border:1px solid #fde3c4;border-radius:16px\">" + T("<tr>" + code[:-len("<td width=\"8\" style=\"width:8px\"></td>")] + "</tr>", w="auto", style="margin:0 auto") + f"<div style=\"padding-top:12px;font-family:{F};font-size:13px;font-weight:700;color:{ORD}\">Berlaku 5 menit</div></td></tr>")}</td></tr>'
    + p('Kode kedaluwarsa? Minta kode baru lewat tombol <b>Kirim ulang</b> di halaman verifikasi.', '16px 0 0', 13.5)
    + note('Tim Toffin tidak pernah meminta kode ini. Jangan berikan kode verifikasi kepada siapa pun, termasuk yang mengaku dari Toffin.', 'r', 'Jaga kerahasiaan kode')
    + signoff(), comment='Kode verifikasi email (OTP 6 digit, berlaku 5 menit, sama dengan otp.html / tf-auth.js). Menggantikan tombol "Konfirmasi akun" lama.')

# 11. verifikasi identitas diterima
write('email-verify-accepted.html', 'Akun Anda sudah terverifikasi', 'Data KTP/NPWP Anda sudah kami verifikasi. Akun siap dipakai berbelanja di shop.toffin.id.',
    hero('verified', 'Akun terverifikasi', 'Selamat, akun Anda siap dipakai belanja', 'Terima kasih sudah melengkapi KTP/NPWP. Data Anda sudah kami verifikasi dan akun Anda kini aktif penuh.', 'g')
    + bullets(['Belanja mesin, grinder, dan bahan F&amp;B dari distributor terdekat', 'Kumpulkan Toffin Point di setiap transaksi', 'Faktur pajak otomatis untuk pembelian atas nama perusahaan'])
    + button('Mulai belanja', 'index.html')
    + signoff(), comment='Verifikasi KTP/NPWP disetujui admin.')

# 12. verifikasi identitas ditolak
write('email-verify-decline.html', 'Data KTP/NPWP perlu diperbarui', 'Data KTP/NPWP Anda belum bisa kami verifikasi. Perbarui data agar akun bisa dipakai belanja.',
    hero('declined', 'Verifikasi belum berhasil', 'Data identitas Anda perlu diperbarui', 'Terima kasih sudah melengkapi KTP/NPWP. Setelah kami periksa, data tersebut belum bisa diverifikasi.', 'r')
    + note('Alamat pada NPWP tidak sesuai dengan alamat yang terdaftar di akun.', 'r', 'Alasan')
    + section('Sebelum mengirim ulang')
    + bullets(['Foto KTP/NPWP jelas, tidak buram, dan tidak terpotong', 'Nama dan nomor sama persis dengan dokumen', 'Alamat NPWP sesuai dengan alamat di akun'], '&bull;', ORD)
    + button('Perbarui data identitas', 'my-account.html')
    + signoff(), comment='Verifikasi KTP/NPWP ditolak admin, dengan alasan.')

# 13. admin: minta verifikasi
write('email-verify-admin.html', '[Admin] Verifikasi KTP/NPWP: Rendi Bagus', 'Pelanggan baru mengirim data KTP/NPWP dan menunggu verifikasi.',
    hero('admin', 'Untuk admin Toffin', 'Data KTP/NPWP menunggu verifikasi', 'Pelanggan berikut mengirim data identitas. Periksa kecocokan data dan dokumen sebelum menyetujui.')
    + section('Data pelanggan')
    + box(kv([('Nama', 'Rendi Bagus'), ('Email', 'rendi@toffin.id'), ('No. handphone', '0812 2200 0442'), ('Tipe akun', 'Korporat &middot; PT Kopi Nusantara'),
              ('Alamat', 'Jl. Kirai No. 5, Cipete Utara, Kebayoran Baru, Jakarta Selatan')]))
    + section('Dokumen')
    + f'<tr><td>{T(f"<tr><td align=\"center\" height=\"150\" style=\"height:150px;background:#f1f2f5;border:1px dashed #cbd0d8;border-radius:14px;font-family:{F};font-size:13px;font-weight:700;color:{MUTED}\">Pratinjau foto KTP / NPWP<br><span style=\"font-weight:600\">(lampiran dari pelanggan)</span></td></tr>")}</td></tr>'
    + button('Buka dan verifikasi', '#')
    + signoff('Sistem Toffin'), audience='Email internal untuk admin verifikasi Toffin.', help=False, comment='Notifikasi internal ke admin: pelanggan mengirim KTP/NPWP.')

# 14. ganti sales: belum disetujui
write('email-salesperson.html', 'Tanggapan permintaan ganti Sales Representative', 'Permintaan Anda sudah kami evaluasi. Untuk saat ini Sales Representative Anda belum diganti.',
    hero('sales', 'Tanggapan permintaan', 'Permintaan ganti Sales Representative', 'Kami minta maaf atas kendala yang Anda alami dengan Sales Representative kami.')
    + p('Kami sudah mengevaluasi ulang Sales Representative Anda sesuai keluhan yang Anda sampaikan. Untuk saat ini permintaan penggantian <b>belum dapat kami setujui</b>.')
    + note('Sales Representative Anda sudah mendapat teguran dan akan meningkatkan kinerjanya supaya bisa melayani Anda lebih baik.', 'o', 'Tindak lanjut kami')
    + p('Bila kendala berlanjut, kabari tim Toffin lewat WhatsApp. Kami akan meninjau kembali permintaan Anda.')
    + button('Hubungi tim Toffin', WA, 'secondary')
    + signoff(), comment='Permintaan ganti sales ditolak.')

# 15. ganti sales: disetujui
write('email-salesperson-approved.html', 'Permintaan ganti Sales Representative disetujui', 'Silakan pilih Sales Representative lain lewat tombol Contact di Toffin App.',
    hero('sales-ok', 'Permintaan disetujui', 'Sales Representative Anda bisa diganti', 'Kami minta maaf atas kendala yang Anda alami. Permintaan Anda sudah kami evaluasi dan kami setujui.', 'g')
    + section('Langkah selanjutnya')
    + numbered(['Buka <b>Toffin App</b>', 'Pilih menu <b>Contact</b>', 'Hubungi Sales Representative baru pilihan Anda'])
    + button('Buka Toffin App', 'https://qrco.de/bdBvQn')
    + signoff(), comment='Permintaan ganti sales disetujui.')

# 16. undangan Toffin App
write('email-invitation-app.html', 'Kenalan dengan Toffin AI Personal Assistant 2.0', 'Toffin App setahun: kini dengan Toffin AI Personal Assistant 2.0 untuk konsultasi bisnis F&B Anda.',
    hero('app', 'Toffin App', 'Kenalan dengan Toffin AI Personal Assistant 2.0', '')
    + hi('Rendi Bagus')
    + p('Sudah setahun Toffin App hadir. Kini ada <b>Toffin AI Personal Assistant 2.0</b>, berbasis GPT-4o, yang siap menjawab pertanyaan seputar bisnis F&amp;B, produk, dan servis Toffin, lengkap dengan rekomendasi yang sesuai kebutuhan Anda.', '10px 0 0')
    + section('Kenapa pakai Toffin App?')
    + bullets(['Promo khusus belanja di Toffin App', 'Belanja lebih cepat', 'Rekomendasi personal sesuai kebutuhan Anda', 'Lacak pesanan dengan mudah', 'Konsultasi cepat dengan Toffin AI Personal Assistant 2.0'])
    + button('Unduh Toffin App', 'https://qrco.de/bdBvQn')
    + section('Cara mendaftar')
    + f'<tr><td style="padding:4px 0 0"><img src="images/user-guide.png" width="518" alt="Langkah pendaftaran Toffin App: buka aplikasi, daftar sebagai pelanggan, pilih cabang, pilih alamat" style="display:block;width:100%;max-width:518px;height:auto;border:1px solid {LINE};border-radius:14px"></td></tr>'
    + signoff('Tim Toffin Digital'), comment='Undangan memakai Toffin App + AI Personal Assistant 2.0.')

# 17. resep Toffin AI
stars = ''.join(f'<td style="padding:0 4px"><a href="rating-recipe.html?recipeId=peach-lychee-sparkling-mocktail&amp;rating={i}" target="_blank" title="{i} bintang" style="font-family:Arial,sans-serif;font-size:34px;line-height:1;color:#f5a524;text-decoration:none">&#9733;</a></td>' for i in range(1, 6))
write('email-AI-recipe-v2.html', 'Resep signature untuk Anda: Peach Lychee Sparkling Mocktail', 'Toffin AI meracik menu signature dari bahan yang biasa Anda beli. Coba resep ini di bar Anda.',
    f'<tr><td style="font-family:{F};font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:{ORD}">Toffin AI Recipe</td></tr>'
    f'<tr><td class="h1" style="padding:6px 0 0;font-family:{F};font-size:26px;line-height:1.25;font-weight:900;color:{INK}">Peach Lychee Sparkling Mocktail</td></tr>'
    + hi('Toffin Customer')
    + p('Jadikan barista Anda bintang di balik bar. Toffin AI menganalisis riwayat belanja Anda dan menemukan menu signature yang belum pernah ada di daftar menu Anda.', '8px 0 0')
    + f'<tr><td style="padding:22px 0 0"><img src="images/recipe.jpg" width="518" alt="Peach Lychee Sparkling Mocktail" style="display:block;width:100%;max-width:518px;height:auto;border-radius:16px"></td></tr>'
    + section('Bahan', 'Mocktail')
    + bullets(['FO Peach Syrup 750 ml', 'FO Lychee Syrup 750 ml', 'FO White Peach Syrup (sedikit, penguat aroma)', 'Soda water', 'Es batu'], '&bull;', ORD)
    + section('Cara membuat')
    + numbered(['Isi gelas dengan es batu hingga 3/4 penuh.', 'Tambahkan FO Peach Syrup dan FO Lychee Syrup.', 'Tambahkan sedikit FO White Peach Syrup untuk memperkuat aroma buah.', 'Tuang soda water perlahan hingga penuh.', 'Aduk perlahan, lalu sajikan.'])
    + f'<tr><td style="padding:26px 0 0">{T(f"<tr><td align=\"center\" style=\"padding:18px 12px;background:{ORS};border-radius:16px\"><div style=\"font-family:{F};font-size:14px;font-weight:800;color:{INK}\">Seberapa Menarik Resep Ini?</div>" + T("<tr>" + stars + "</tr>", w="auto", style="margin:8px auto 0") + f"<div style=\"padding-top:6px;font-family:{F};font-size:12px;color:{MUTED}\">Ketuk bintang untuk memberi nilai</div></td></tr>")}</td></tr>'
    + button('Eksplor varian rasa lainnya', 'product-list.html?cat=Syrup')
    + p('Resep ini dibuat otomatis oleh Toffin AI dari bahan yang Anda beli di Toffin. Tambah varian bahan untuk membuka lebih banyak resep kreatif yang cocok dengan bisnis Anda.', '18px 0 0', 12.5, MUTED)
    + signoff(), comment='Resep otomatis Toffin AI dari riwayat belanja bahan, dengan rating bintang (rating-recipe.html).')
print('ok')
