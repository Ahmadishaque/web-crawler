const axios = require('axios');
const cheerio = require('cheerio');

const urls = [
 "https://www.iitk.ac.in/",
  "https://www.iitm.ac.in/",
  "http://www.iitkgp.ac.in/",
  "https://www.iitr.ac.in/",
  "https://www.iitg.ac.in/",
  "https://www.iitbbs.ac.in/",
  "https://www.iith.ac.in/",
  "http://www.iiti.ac.in/",
  "https://www.du.ac.in/",
  "https://www.jnu.ac.in/",
  "https://www.uohyd.ac.in/",
  "https://www.jmi.ac.in/",
  "https://www.amu.ac.in/", 
];

const searchStrings = [
  "Machine Learning",
  "Compiler",
  "Internet Technology",
  "Computer Networks",
];

const relevantWords = [
  "undergraduate",
  "bachelors",
  "degree",
  "academics",
  "program",
  "admission",
  "course",
  "department",
  "engineering",
  "computer engineering",
  "computer science",
  "information technology",
  "cse",
  "cst"
];

// Extract the hostname (root domain) from a URL
function getHostname(url) {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname;
}

// Case-insensitive string includes check
function includesCaseInsensitive(string, searchString) {
  return string.toLowerCase().includes(searchString.toLowerCase());
}

async function crawlWebsite(url, searchStrings, rootDomain) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Search for the given strings in the HTML
    for (const searchString of searchStrings) {
      let stringFound = false; // Flag to indicate if the string has been found
      $('*:contains("' + searchString + '")').each(function () {
        if (includesCaseInsensitive($(this).text(), searchString)) {
          stringFound = true;
          return false; // Stop searching for this string on the page
        }
      });

      if (stringFound) {
        console.log(`${url}: ${searchString}`);
      } else {
        console.log(`${url}: ${searchString} not found`);
      }
    }

    // Follow the links from the home page within the same root domain
    $('a').each(async (index, element) => {
      const link = $(element).attr('href');
      const linkText = $(element).text();
      if (link && !link.startsWith('http') && includesRelevantWords(linkText, relevantWords)) {
        const absoluteLink = new URL(link, url).href;
        if (getHostname(absoluteLink) === rootDomain) {
          await crawlWebsite(absoluteLink, searchStrings, rootDomain);
        }
      }
    });
  } catch (error) {
    //console.error(`Error crawling ${url}: ${error.message}`);
  }
}

// Case-insensitive search for relevant words
function includesRelevantWords(text, words) {
  return words.some(word => includesCaseInsensitive(text, word));
}

async function startCrawling() {
  for (const url of urls) {
    const rootDomain = getHostname(url);
    await crawlWebsite(url, searchStrings, rootDomain);
  }
}

startCrawling();
