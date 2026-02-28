import sys
import os

# Add the directory containing the file to Python Path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fetch_data_v3 import fetch_fiidii

if __name__ == "__main__":
    print("Running just the FII/DII scraper...")
    fetch_fiidii()
    print("Done!")
