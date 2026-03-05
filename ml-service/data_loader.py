import pandas as pd
import mysql.connector


def load_transactions(user_id):

    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Root@password",
        database="ai_secure_finance"
    )

    query = """
    SELECT date, amount
    FROM transactions
    WHERE user_id = %s AND type = 'expense'
    ORDER BY date
    """

    df = pd.read_sql(query, connection, params=[user_id])

    connection.close()

    return df