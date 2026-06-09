from sqlalchemy import text
from app.database import engine

def run_migration():
    print("Running database migrations...")
    with engine.connect() as conn:
        # Check existing columns
        result = conn.execute(text("SHOW COLUMNS FROM users"))
        columns = [row[0] for row in result]
        
        # Add new columns if they don't exist
        if 'username' not in columns:
            print("Adding username column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE"))
            
        if 'password_hash' not in columns:
            print("Adding password_hash column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
            
        if 'telegram_username' not in columns:
            print("Adding telegram_username column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN telegram_username VARCHAR(100)"))
            
        # We also need to alter telegram_id to allow NULL, since users created via web
        # without telegram link (if ever supported) would need it. Though right now we enforce linking first.
        # But our model says nullable=True now.
        print("Altering telegram_id to allow NULL...")
        conn.execute(text("ALTER TABLE users MODIFY COLUMN telegram_id VARCHAR(50) NULL"))

        conn.commit()
    print("Migration completed.")

if __name__ == "__main__":
    run_migration()
