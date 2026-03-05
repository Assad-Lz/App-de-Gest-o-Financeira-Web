import time
import schedule
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def fetch_exchange_rates():
    print("Fetching exchange rates (USD/BRL, EUR/BRL)...")
    # API pública BCB / AwesomeAPI
    try:
        response = requests.get("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL")
        data = response.json()
        print(f"USD: {data['USDBRL']['ask']}, EUR: {data['EURBRL']['ask']}")
        # TO-DO: Insert to DB via SQLAlchemy
    except Exception as e:
        print(f"Erro ao buscar câmbio: {e}")

def fetch_brapi_stocks():
    print("Fetching stocks from BRAPI...")
    token = os.getenv("BRAPI_TOKEN")
    if not token:
        print("Aviso: BRAPI_TOKEN não definido no .env")
        return
    try:
        response = requests.get(f"https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,BBDC4?token={token}")
        data = response.json()
        for stock in data.get('results', []):
            print(f"Stock: {stock['symbol']} - Price: {stock['regularMarketPrice']}")
        # TO-DO: Insert to DB via SQLAlchemy
    except Exception as e:
        print(f"Erro ao buscar acoes: {e}")

if __name__ == "__main__":
    print("Iniciando Worker ETL do App Financeiro...")
    
    # Roda a extração imediatamente no boot
    fetch_exchange_rates()
    fetch_brapi_stocks()
    
    # Agendamento
    schedule.every().hour.do(fetch_exchange_rates)
    schedule.every().hour.do(fetch_brapi_stocks)
    
    while True:
        schedule.run_pending()
        time.sleep(60)
