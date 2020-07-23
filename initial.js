const puppeteer = require('puppeteer');
const fs = require('fs')

const signIN = async () => {
    try{
        const browser = await puppeteer.launch({
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--disable-gpu',
              '--window-size=1920x1080',
            ],
            userDataDir: "./user_data",
            
            headless: false, // launch headful mode
            //slowMo: 1000, // slow down puppeteer script so that it's easier to follow visually
            
            });
    
            
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        const blockedResourceTypes = [
          'image',
          'media',
          'font',
          'texttrack',
          'object',
          'beacon',
          'csp_report',
          'imageset',
          'stylesheet',
        ];
    
        const skippedResources = [
          'quantserve',
          'adzerk',
          'doubleclick',
          'adition',
          'exelator',
          'sharethrough',
          'cdn.api.twitter',
          'google-analytics',
          'googletagmanager',
          'fontawesome',
          'facebook',
          'analytics',
          'optimizely',
          'clicktale',
          'mixpanel',
          'zedo',
          'clicksor',
          'tiqcdn',
        ];
        page.on('request', (req) => {
          const requestUrl = req._url.split('?')[0].split('#')[0];
          if (
            blockedResourceTypes.indexOf(req.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
          ) {
            req.abort();
          } else {
            req.continue();
        }
        });
        
        console.log("Browser Started, Sign In Now...");
    
        await page.goto('https://accounts.google.com/', {waitUntil: 'networkidle0'})
    }
    catch(e){
      console.log("Browser Closed")
    }

}

signIN()