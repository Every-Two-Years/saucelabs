const aigle = require("aigle");
const util = require('util');
const wait = util.promisify(setTimeout);
const { remote } = require('webdriverio');

username = "retrohacker",
accessKey = "c25b3bcf-4c93-4255-a6fd-1237bbd507da",

baseUrl = "https://everytwoyears.org";

const BUILD = String(Date.now());

function str(string) {
  return string.replace(/\s|\./g, '-')
}

async function testDesktop(browserName, platform, version) {
  console.log(`Starting ${browserName} ${platform} ${version}`);
  const browser = await remote({
    user: username,
    key: accessKey,
    capabilities: {
      'browserName': browserName,
      'platform': platform,
      'version': version,
      'build': BUILD,
      'name': 'testdrive'
    }
  });
  try {
    await browser.url(baseUrl);
    await wait(1500);
    await browser.saveScreenshot(`./${str(platform)}_${str(browserName)}_${str(version)}_top.png`)
    await browser.execute("window.scrollTo(0, document.body.scrollHeight);")
    await browser.saveScreenshot(`./${str(platform)}_${str(browserName)}_${str(version)}_bottom.png`)
  } catch (e) {
    console.log(`Failed ${browserName} ${platform} ${version}`);
    console.log(e);
  }
  await browser.deleteSession();
  console.log(`Finished ${browserName} ${platform} ${version}`);
}

async function testPortrait(caps) {
  const c = JSON.parse(JSON.stringify(caps));
  c.deviceOrientation = 'portrait';
  await mobileDriver(c)
}
async function testLandscape(caps) {
  const c = JSON.parse(JSON.stringify(caps));
  c.deviceOrientation = 'landscape';
  await mobileDriver(c)
}
async function mobileDriver(caps) {
  console.log(`Starting ${Object.values(caps).join(" ")}`);
  const browser = await remote({
    user: username,
    key: accessKey,
    capabilities: caps
  });
  try {
    await browser.url(baseUrl);
    await wait(1500);
    await browser.saveScreenshot(`./${str(Object.values(caps).join("_"))}_top.png`)
    await browser.execute("window.scrollTo(0, document.body.scrollHeight);")
    await browser.saveScreenshot(`./${str(Object.values(caps).join("_"))}_bottom.png`)
  } catch (e) {
    console.log(`Failed ${Object.values(caps).join(" ")}`);
    console.log(e);
  }
  await browser.deleteSession();
  console.log(`Finished ${Object.values(caps).join(" ")}`);
}

async function testMobile(caps) {
  await testLandscape(caps);
  await testPortrait(caps);
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

const mobile = []
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'Google Pixel 3 GoogleAPI Emulator',
  'browserName': 'Chrome',
  'platformVersion': '10.0',
  'platformName': 'Android'
});
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'Google Pixel GoogleAPI Emulator',
  'browserName': 'Chrome',
  'platformVersion': '7.0',
  'platformName': 'Android'
});
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'Samsung Galaxy S6 GoogleAPI Emulator',
  'browserName': 'Chrome',
  'platformVersion': '7.1',
  'platformName': 'Android'
});
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'Google Pixel 3 GoogleAPI Emulator',
  'browserName': 'Chrome',
  'platformVersion': '10.0',
  'platformName': 'Android'
});
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'iPhone 5 Simulator',
  'browserName': 'Safari',
  'platformVersion': '10.3',
  'platformName': 'iOS'
});
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'iPhone 6s Plus Simulator',
  'browserName': 'Safari',
  'platformVersion': '11.2',
  'platformName': 'iOS'
});
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'iPhone 7 Simulator',
  'browserName': 'Safari',
  'platformVersion': '`12.0',
  'platformName': 'iOS'
});
mobile.push({
  'appiumVersion': '1.17.1',
  'deviceName': 'iPhone SE Simulator',
  'browserName': 'Safari',
  'platformVersion': '1',
  'platformName': 'iOS'
});
mobile.push({
  'appiumVersion': '1.9.1',
  'deviceName': 'iPad (5th generation) Simulator',
  'browserName': 'Safari',
  'platformVersion': '11.0',
  'platformName': 'iOS'
});
mobile.forEach(v => v.build = BUILD);

aigle
  .resolve(mobile)
  .eachLimit(1, caps => testMobile(caps))
