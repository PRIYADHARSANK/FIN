import requests
from bs4 import BeautifulSoup

def test_groww():
    url = "https://groww.in/fii-dii-data"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            tables = soup.find_all('table')
            print(f"Found {len(tables)} tables")
            if tables:
                table = tables[0]
                rows = table.find_all('tr')
                for i, row in enumerate(rows[:5]):
                    cols = row.find_all(['td', 'th'])
                    print(f"Row {i}: {[c.text.strip() for c in cols]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_groww()
