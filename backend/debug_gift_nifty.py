import sys
from fetch_data_v3 import GiftNiftyScraper

if __name__ == "__main__":
    print("Testing GiftNiftyScraper...", flush=True)
    scraper = GiftNiftyScraper()
    data = scraper.fetch()
    if data:
        print("\nSUCCESS! Scraped Data:", flush=True)
        print(data.to_dict(), flush=True)
    else:
        print("\nFAILED to scrape data.", flush=True)
