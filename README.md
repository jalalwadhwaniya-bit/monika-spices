# Monika Spices

Static website for Monika Spices (Custom Road, Chala, Vapi). Same HTML/CSS/JS setup as the current Netlify site — no Next.js, no build step.

## Live on Netlify

**https://monikaspices.netlify.app**

## Deploy again (free)

1. Download **`monika-spices-netlify.zip`**.
2. Unzip it. You should see `index.html` inside the folder.
3. Open [app.netlify.com/drop](https://app.netlify.com/drop) (sign in free).
4. Drag the unzipped folder onto the page.
5. Netlify gives you a live URL.

Netlify’s free Starter plan hosts this kind of static site. You do **not** need Next.js.

## What’s in the zip

- `index.html` — page content
- `styles.css` — layout and colours
- `script.js` — mobile menu, search, cart, and checkout
- `config.js` — Razorpay Key ID and shop UPI ID for live payments
- `images/` — masala product photos
- `favicon.svg` — tab icon
- `netlify.toml` — tells Netlify this is a static site

Home has three sections: **Masala** (powders), **Raw** (whole spices), and **Tea** (dust, CTC, OF and jaggery masala). Use **Add to Cart**, then open **Cart**. **Pay now** asks for full name and a 5-line delivery address (all required). After the address you can optionally **Apply coupon**. For commercial orders, tick **I need GST** and enter the GSTIN so the invoice can be used to claim GST. Then continue to UPI, scan QR, or card payment.

**Shipping:** India — ₹50 per kg when the spice total is below ₹1,000; free across India on ₹1,000 or more. Outside India — ₹1,000 per kg.

Sample coupon codes (edit in `config.js`):

- `MONIKA10` — 10% off (max ₹200)
- `FIRST50` — ₹50 off (minimum order ₹200)
- `SPICE100` — ₹100 off (minimum order ₹500)

## Live payments

Checkout works in demo mode so you can try the flow. To collect real money:

1. Create a [Razorpay](https://razorpay.com) account.
2. Copy the **Key ID** (`rzp_test_...` or `rzp_live_...`) into `config.js` as `razorpayKeyId`.
3. Put your shop UPI ID in `config.js` as `upiId` (for Scan QR).

Put the shop **FSSAI licence number** and **GSTIN** in `config.js` as `fssai` and `gstin`. They appear on the Contact section and in the footer.

Razorpay checkout then accepts debit cards, credit cards, UPI, QR and netbanking. Live card charging also needs Razorpay orders from their dashboard/API when you switch to a live key.

## Save to your Git

Unzip **Monika-Spices-source-for-git.zip**. You should get a `Monika-Spices` folder with `index.html` inside. Then:

```bash
cd Monika-Spices
git init
git add .
git commit -m "Monika Spices shop"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

Replace `YOUR_REPO_URL` with your GitHub, GitLab, or other Git URL. This zip does not include a `.git` folder, so it is ready for a new repository.

## Local preview

Open `index.html` in a browser, or from this folder run:

```bash
python3 -m http.server 43127
```

Then visit `http://127.0.0.1:43127`.
