const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://tubegains-render.onrender.com'], 
  methods: ['GET', 'POST'], 
  credentials: true, 
}));

app.use(express.json());

app.post("/check-yt-ad", async (req, res) => {
  const videoUrl = req.body.videoUrl;

  if (!videoUrl) {
    return res.status(400).json({ error: "Video URL is required." });
  }

  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(videoUrl, { waitUntil: "networkidle", timeout: 60000 });

    const content = await page.content();
    const hasAds = content.includes("yt_ad");

    await browser.close();
    res.json({ monetizationStatus: hasAds ? "Monetized" : "Not Monetized" });
  } catch (error) {
    console.error("Error checking monetization status:", error);
    if (error.message.includes("Executable doesn't exist")) {
      return res.status(500).json({
        error: "Browser executable not found. Ensure Playwright is installed correctly.",
      });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
