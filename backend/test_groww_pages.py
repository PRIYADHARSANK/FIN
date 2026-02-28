import requests
from bs4 import BeautifulSoup

def test_groww_pages():
    for page in range(0, 4):
        url = f"https://groww.in/fii-dii-data?page={page}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        try:
            response = requests.get(url, headers=headers)
            print(f"Page {page} Status Code: {response.status_code}")
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                tables = soup.find_all('table')
                if tables:
                    table = tables[0]
                    rows = table.find_all('tr')
                    if len(rows) > 2:
                        cols = rows[2].find_all(['td', 'th'])
                        print(f"Page {page} first row Date: {cols[0].text.strip()}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_groww_pages()
