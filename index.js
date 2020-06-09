const aigle = require("aigle");
const util = require('util');
const wait = util.promisify(setTimeout);
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);
const webdriver = require('selenium-webdriver'),

username = "retrohacker",
accessKey = "c25b3bcf-4c93-4255-a6fd-1237bbd507da",

baseUrl = "https://everytwoyears.org";

const BUILD = String(Date.now());

function str(string) {
  return string.replace(/\s|\./g, '-')
}

async function testDesktop(browser, platform, version) {
  console.log(`Starting ${browser} ${platform} ${version}`);
  const driver = new webdriver.Builder().withCapabilities({
    'browserName': browser,
    'platform': platform,
    'version': version,
    'build': BUILD,
    'username': username,
    'accessKey': accessKey,
    'name': 'testdrive'
  }).usingServer("https://" + username + ":" + accessKey +
    "@ondemand.us-west-1.saucelabs.com:443/wd/hub").build();
  try {
    await driver.get(baseUrl);
    await wait(1500);
    const top = Buffer.from(await driver.takeScreenshot(), 'base64');
    await writeFile(`./${str(platform)}_${str(browser)}_${str(version)}_top.png`, top);
    await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);")
    const bottom = Buffer.from(await driver.takeScreenshot(), 'base64');
    await writeFile(`./${str(platform)}_${str(browser)}_${str(version)}_bottom.png`, bottom);
  } catch (e) {
    console.log(`Failed ${browser} ${platform} ${version}`);
    console.log(e);
  }
  /* This tears down the current WebDriver session and ends the test method*/
  driver.quit();
  console.log(`Finished ${browser} ${platform} ${version}`);
}

let Edge = ["18", "17", "16"]
let Firefox = ["52", "56", "60", "63", "72", "75", "76", "77"]
let Chrome = ["31", "49", "67", "71", "80", "81", "83"]

const builds = []
for(let i = 0; i < Edge.length; i++) {
  builds.push(["MicrosoftEdge", "Windows 10", Edge[i]]);
}
for(let i = 0; i < Firefox.length; i++) {
  builds.push(["Firefox", "Windows 10", `${Firefox[i]}.0`]);
  builds.push(["Firefox", "Windows 7", `${Firefox[i]}.0`]);
  builds.push(["Firefox", "macOS 10.15", `${Firefox[i]}.0`]);
  builds.push(["Firefox", "macOS 10.11", `${Firefox[i]}.0`]);
}
for(let i = 0; i < Chrome.length; i++) {
  builds.push(["Chrome", "Windows 10", `${Firefox[i]}.0`]);
  builds.push(["Chrome", "Windows 7", `${Firefox[i]}.0`]);
  builds.push(["Firefox", "macOS 10.15", `${Firefox[i]}.0`]);
  builds.push(["Firefox", "macOS 10.11", `${Firefox[i]}.0`]);
}

aigle
  .resolve(builds)
  .eachLimit(1, build => testDesktop(...build))
