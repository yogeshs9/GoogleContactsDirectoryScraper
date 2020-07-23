const puppeteer = require('puppeteer');
const fs = require('fs')

//CHANGE THIS ACCORDING TO YOUR REQUIREMENTS
const time_between_scrolls_min_max = [500,1500] //Minimum and Maximum time between scrolls

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

const getContacts = async () => {
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


  await page.goto('https://contacts.google.com/directory', { waitUntil: 'networkidle0' })
  console.log("Directory Page Loaded");

  //google login code
  /* page.evaluate((val)=>{
      document.getElementById("identifierId").value = val;
      document.getElementsByClassName("Vwe4Vb MbhUzd")[0].click() 
  },email)
  await page.waitForNavigation({ waitUntil: 'networkidle0' })
  console.log("DONE")
  await page.waitFor(1000)
  page.evaluate((val)=>{
    setTimeout(function(){
      document.getElementsByClassName ("whsOnd zHQkBf")[0].value = val;
      document.getElementsByClassName("Vwe4Vb MbhUzd")[0].click()
    },500)
  },password)
  await page.waitForNavigation({ waitUntil: 'networkidle0' })
  console.log("passwordDone") */

  /*
  for(contact of document.getElementsByClassName("zYQnTe")){
      let name = contact.getElementsByClassName("PDfZbf")[0].innerText
      let email = contact.getElementsByClassName("hUL4le")[0].innerText
      contacts.push({name:name,email:email})
  }


      const scrollMax;
      do{

      }while(document.getElementsByClassName("bhb7sf").scrollTop!=scrollMax)
  */

  //Get Total Number of contacts that is displayed at the top of the page
  var total_contacts_as_shown_on_google = await page.evaluate(() => {return parseInt(/\(([^)]+)\)/.exec(document.querySelector(".FX4Q3d").innerHTML)[1].replace(",",""))});

  var missed_values = 0;

  let contacts = await page.evaluate(() => {
    let contacts = [];
    for (contact of document.getElementsByClassName("zYQnTe")) {
      let name = contact.getElementsByClassName("PDfZbf")[0].innerText
      let email = contact.getElementsByClassName("hUL4le")[0].innerText
      let image = contact.getElementsByClassName("HfynVe")[0].src
      contacts.push({ name: name, email: email, image: image })
    }
    return contacts
  })


  console.log(contacts)

  let scrollMax = await page.evaluate(() => {
    return document.getElementsByClassName("zQTmif SSPGKf eejsDc")[0].scrollHeight - document.getElementsByClassName("zQTmif SSPGKf eejsDc")[0].clientHeight
  })


  console.log(scrollMax)
  
  
  let currentScroll = 0;
  let currentContactsCount = 0;
  do {

    //Scroll down
    await page.evaluate(() => {
      document.getElementsByClassName("E6Tb7b psZcEd")[document.getElementsByClassName("E6Tb7b psZcEd").length - 1].scrollIntoView()

    })
  

    //delay after scroll for loading data
    var time_between_scrolls = getRndInteger(time_between_scrolls_min_max[0],time_between_scrolls_min_max[1])
    await page.waitFor(time_between_scrolls)

    //Get contacts
    console.log("Now Scrolling Down")

    let arr = await page.evaluate((contactsSoFar) => {
      let loopNum = 0;
      let contacts = [];
      for (contact of document.getElementsByClassName("zYQnTe")) {
        loopNum++
        if (loopNum > 2) {
          let name = contact.getElementsByClassName("PDfZbf")[0].innerText
          let email = contact.getElementsByClassName("hUL4le")[0].innerText
          let image = contact.getElementsByClassName("HfynVe")[0].src
          if (contactsSoFar.map(function (e) { return e.email; }).indexOf(email) != -1) {
            console.log(contacts.indexOf({ name: name, email: email, image: image }));
            continue;
          }
          contacts.push({ name: name, email: email, image: image})
          
        }
      }
      return contacts
    }, contacts)

    //Appending currently loaded contacts to main contacts array
    contacts = contacts.concat(arr);

    //Checking how Many contacts were missed
    if (arr.length<18){
      missed_values = missed_values + (18 - arr.length);
    };
    
    //Printing Current Fetch
    console.log(arr);

    //Printing Current Fetch Number
    console.log("Contacts Fetched in this scroll - ",contacts.length - currentContactsCount);
    console.log("Missed Contacts - ",missed_values);

    currentScroll = await page.evaluate(() => {
      return document.getElementsByClassName("zQTmif SSPGKf eejsDc")[0].scrollTop
    });
    console.log("Scrolling (",currentScroll,")")

    currentContactsCount =  contacts.length
    console.log("Total Contacts Fetched till now - ",currentContactsCount)

  } while (currentScroll != scrollMax)



  //Constructing output type 1
  const contactObj = contacts.reduce(function (acc, curr) {
    acc[curr.email] = curr.name;
    return acc;
  }, {})



  /* const filteredOutput = contacts.filter(obj => ![].filter.call(obj.name.replace(/\s/g, ''), isFinite).length)
  console.log("contacts: " + filteredOutput.length)
  console.log("done filtering output") */
  
  //Constructing output type 2
  const contacts_name_email = contacts.map(x=>{return {"name": x.name, "email": x.email}})

  /* try {
    fs.writeFileSync('output.json', JSON.stringify(filteredOutput))
  } catch (err) {
    console.error(err)
  } */



  //Saving Raw Output
  try {
    fs.writeFileSync('raw_output.json', JSON.stringify(contacts))
  } catch (err) {
    console.error(err)
  }

  //Saving Output type 1
  try {
    fs.writeFileSync('output_type_1.json', JSON.stringify(contactObj))
  } catch (err) {
    console.error(err)
  }

  //Saving Output type 2
  try {
    fs.writeFileSync('output_type_2.json', JSON.stringify(contacts_name_email))
  } catch (err) {
    console.error(err)
  }

  //Saving Script Report
  var date_time = new Date();
  var report = `\n
Report Generated on - ${date_time}
Total Number of Contacts Fetched - ${contacts.length}
Total Number Contacts as shown on Directory Page - ${total_contacts_as_shown_on_google}
Estimated Number of contacts missed(Rough Calculation) - ${missed_values}
Real Number of contacts missed - ${total_contacts_as_shown_on_google - contacts.length}`;
  try {
    fs.writeFile('reports.txt',report)
  } catch (err) {
    console.error(err)
  }


  console.log("Finished saving the outputs to File.\n Closing Script Now.")
}


getContacts()