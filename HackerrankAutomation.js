// Demo for pupeteer to open browser and take snap of web page(Hacker rank)

/*Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.*/

let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require("puppeteer");
// node HackerrankAutomation.js --url=https://www.hackerrank.com  --config=config.JSON

let args = minimist(process.argv);
let url = args.url;

let configJSON = fs.readFileSync("config.JSON", "utf-8");
let configJSO = JSON.parse(configJSON);


// await is used in function which have async keyword used before declaration
async function run(){
    let browser=await puppeteer.launch({
        headless: false,
        args:[
            '--start-maximized'
        ],
        defaultViewport: null
    });
    let pages= await browser.newPage();
    await pages.goto(args.url);
    await pages.waitForSelector("a[data-event-action='Login']"); //first page login
    await pages.click("a[data-event-action='Login']");

    await pages.waitForSelector("a[href='https://www.hackerrank.com/login']");  // second page login
    await pages.click("a[href='https://www.hackerrank.com/login']");

    await pages.waitForSelector("input[name='username']");     //username(second page)
    await pages.type("input[name='username']",configJSO.userid,{delay: 50});

    await pages.waitForSelector("input[name='password']");
    await pages.type("input[name='password']",configJSO.password,{delay: 50}); //password(second page)

    await pages.waitForSelector("button[data-analytics='LoginPassword']");  //login (third page)
    await pages.click("button[data-analytics='LoginPassword']");

    await pages.waitForSelector("a[data-analytics='NavBarContests']"); //click on compete
    await pages.click("a[data-analytics='NavBarContests']");

    await pages.waitForSelector("a[href='/administration/contests/']");  // click on manage contest
    await pages.click("a[href='/administration/contests/']");
    
    await pages.waitForSelector("a[data-attr1='Last']");
    let numPages=await pages.$eval("a[data-attr1='Last']",function(lastTag){
        let numPages=lastTag.getAttribute("data-page");
        return parseInt(numPages);

    });
    //move through all pages
    for (let i=0;i<numPages;i++){
        
      await  handlePage(browser,pages);
    }

    async function handlePage(browser,pages){
        //do work for 1 page
          await pages.waitForSelector("a.backbone.block-center");
        let curls=await pages.$$eval("a.backbone.block-center",function(atags){
            let iurls=[];
            for(let i=0;i<atags.length;i++){
                let url=atags[i].getAttribute("href");
                iurls.push(url);
            }
            return iurls;
        })
        for(let i=0;i<curls.length;i++){
            await handleContest(browser,pages,curls[i]);
        }

        //move to next Page
        await pages.waitFor(1500);
        await pages.waitForSelector("a[data-attr1='Right']");
        await pages.click("a[data-attr1='Right']");

    }
    async function handleContest(browser,pages,curl){
        let npage=await browser.newPage();
        await npage.goto(args.url + curl);
        await npage.waitFor(2000);

        await npage.waitForSelector("li[data-tab='moderators']");
        await npage.click("li[data-tab='moderators']");
        for(let i=0;i<configJSO.moderators.length;i++){
            let moderator=configJSO.moderators[i];
            await npage.waitForSelector("input#moderator");
            await npage.type("input#moderator",moderator,{delay:50});
    
            await npage.keyboard.press("Enter");
            
        }

     
        

        await pages.waitFor(1000);


        await npage.close();
        await pages.waitFor(2000);
    }//43 43





    

}
run();
 

/* note - if we enclose a function in a bracket and and after func body we can call it like ();
 this is will invoke the function automatically just after declaration  */
