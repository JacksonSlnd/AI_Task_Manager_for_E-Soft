import csv
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Формируем конфигурацию, считывая данные из окружения через os.getenv()
DB_CONFIG = {
    "dbname": os.getenv("DB_DATABASE"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

def export_tasks_to_csv():
    conn = None
    try:
        if not all(DB_CONFIG.values()):
            print("Предупреждение: Некоторые переменные окружения не найдены в .env файл!")
            
        print("Подключение к базе данных PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        
        # Принудительно устанавливаем кодировку UTF-8
        conn.set_client_encoding('UTF8')
        
        cursor = conn.cursor()
        
        # Запрос на выгрузку всех задач
        query = "SELECT id, title, description, status, task_date, color, created_at FROM tasks ORDER BY id ASC;"
        cursor.execute(query)
        tasks = cursor.fetchall()
        
        column_names = [desc[0] for desc in cursor.description]
        filename = "exported_tasks.csv"
        
        with open(filename, mode="w", newline="", encoding="utf-8-sig") as file:
            writer = csv.writer(file, delimiter=";")
            writer.writerow(column_names)
            writer.writerows(tasks)
            
        print(f"Успешно! Выгружено задач: {len(tasks)} шт. Файл сохранен как: {filename}")
        
        cursor.close()
    except Exception as error:
        print(f"Произошла ошибка при экспорте: {error}")
    finally:
        if conn is not None:
            conn.close()
            print("Соединение с БД закрыто.")

if __name__ == "__main__":
    export_tasks_to_csv()