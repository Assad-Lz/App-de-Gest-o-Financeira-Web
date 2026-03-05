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
        # Lista expandida com 50 ativos principais da B3 (Blue chips e Mid caps)
        tickers_list = [
            "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "MGLU3", "WEGE3", "RENT3", "HAPV3", "BBAS3", 
            "SANB11", "B3SA3", "JBSS3", "SUZB3", "ELET3", "GGBR4", "CSNA3", "VIVT3", "RAIL3", "RDOR3",
            "RADL3", "LREN3", "PRIO3", "TIMS3", "EGIE3", "VVB11", "IVVB11", "BOVA11", "SMAL11", "KLBN11",
            "BPAC11", "CRFB3", "NTCO3", "BRFS3", "ENGI11", "TAEE11", "EQTL3", "FLRY3", "EZTC3", "CYRE3",
            "GOAU4", "USIM5", "CMIG4", "CPLE6", "TOTS3", "PSSA3", "ALPA4", "MRVE3", "YDUQ3", "CIEL3"
        ]
        
        assets = []
        for ticker in tickers_list:
            try:
                url = f"https://brapi.dev/api/quote/{ticker}?token={token}"
                resp = requests.get(url)
                data = resp.json()
                
                if 'results' in data and len(data['results']) > 0:
                    stock = data['results'][0]
                    assets.append({
                        'symbol': stock['symbol'],
                        'name': stock.get('shortName', stock['symbol']),
                        'price': float(stock['regularMarketPrice']),
                        'changePerc': float(stock.get('regularMarketChangePercent', 0.0))
                    })
                # Pequeno delay para evitar rate limit
                time.sleep(0.5)
            except Exception as e:
                print(f"Erro ao buscar {ticker}: {e}")
            
        if assets:
            upsert_assets(assets)
    except Exception as e:
        print(f"Erro ao processar acoes: {e}")

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
