import time
import schedule
import os
import requests
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from datetime import datetime
import uuid

load_dotenv()

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Aviso: DATABASE_URL não definida.")
        return None
    return psycopg2.connect(db_url)

def upsert_assets(assets):
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        # Query de Upsert (Inserir ou Atualizar se já existir)
        query = """
            INSERT INTO "MarketAsset" (id, symbol, name, price, "changePerc", "updatedAt")
            VALUES %s
            ON CONFLICT (symbol) 
            DO UPDATE SET 
                price = EXCLUDED.price,
                "changePerc" = EXCLUDED."changePerc",
                "updatedAt" = EXCLUDED."updatedAt";
        """
        
        values = [
            (
                str(uuid.uuid4()), 
                a['symbol'], 
                a['name'], 
                a['price'], 
                a.get('changePerc', 0.0), 
                datetime.now()
            ) for a in assets
        ]
        
        execute_values(cur, query, values)
        conn.commit()
        print(f"Sucesso: {len(assets)} ativos foram salvos no DB.")
        cur.close()
    except Exception as e:
        print(f"Erro ao salvar no BD: {e}")
        conn.rollback()
    finally:
        conn.close()

def fetch_exchange_rates():
    print("Fetching exchange rates (USD/BRL, EUR/BRL)...")
    try:
        response = requests.get("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL")
        data = response.json()
        
        assets = [
            {
                'symbol': 'USD_BRL',
                'name': 'Dólar Americano',
                'price': float(data['USDBRL']['ask']),
                'changePerc': float(data['USDBRL']['pctChange'])
            },
            {
                'symbol': 'EUR_BRL',
                'name': 'Euro',
                'price': float(data['EURBRL']['ask']),
                'changePerc': float(data['EURBRL']['pctChange'])
            }
        ]
        upsert_assets(assets)
    except Exception as e:
        print(f"Erro ao buscar câmbio: {e}")

def fetch_brapi_stocks():
    print("Fetching stocks from BRAPI...")
    token = os.getenv("BRAPI_TOKEN")
    if not token:
        print("Aviso: BRAPI_TOKEN não definido no .env")
        return
    try:
        response = requests.get(f"https://brapi.dev/api/quote/PETR4,VALE3,ITUB4,BBDC4,ABEV3?token={token}")
        data = response.json()
        
        assets = []
        for stock in data.get('results', []):
            assets.append({
                'symbol': stock['symbol'],
                'name': stock.get('shortName', stock['symbol']),
                'price': float(stock['regularMarketPrice']),
                'changePerc': float(stock.get('regularMarketChangePercent', 0.0))
            })
            
        upsert_assets(assets)
    except Exception as e:
        print(f"Erro ao buscar acoes: {e}")

def run_pipeline():
    print(f"[{datetime.now()}] Iniciando extração ETL do mercado...")
    fetch_exchange_rates()
    fetch_brapi_stocks()

if __name__ == "__main__":
    print("Iniciando Worker ETL do App Financeiro...")
    
    # Roda a extração imediatamente no boot
    run_pipeline()
    
    # Agendamento
    schedule.every().hour.do(run_pipeline)
    
    while True:
        schedule.run_pending()
        time.sleep(60)
