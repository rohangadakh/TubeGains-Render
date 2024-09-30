const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'https://tubegains-render.onrender.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
};

app.use(cors(corsOptions)); // Apply the CORS middleware
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

app.post("/check-yt-ad", async (req, res) => {
  const videoUrl = req.body.videoUrl;

  if (!videoUrl) {
    return res.status(400).json({ error: "Video URL is required." });
  }

  try {
    // Use Puppeteer with bundled Chromium
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu"
      ],
      executablePath: process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.goto(videoUrl, { waitUntil: "networkidle2", timeout: 60000 });

    const content = await page.content();
    const hasAds = content.includes("yt_ad");

    await browser.close();
    res.json({ monetizationStatus: hasAds ? "Monetized" : "Not Monetized" });
  } catch (error) {
    console.error("Error checking monetization status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
