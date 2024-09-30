const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(stealthPlugin());

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/check-yt-ad", async (req, res) => {
  const videoUrl = req.body.videoUrl;

  if (!videoUrl) {
    return res.status(400).json({ error: "Video URL is required." });
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(), // Dynamically set executable path
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(videoUrl, { waitUntil: "networkidle2", timeout: 60000 });

    const content = await page.content();
    const hasAds = content.includes("yt_ad");

    await browser.close();
    res.json({ monetizationStatus: hasAds ? "Monetized" : "Not Monetized" });
  } catch (error) {
    console.error("Error checking monetization status:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
