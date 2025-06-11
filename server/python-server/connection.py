import asyncpg
import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

async def fetch_doctors_with_user():
    conn = await asyncpg.connect(
        os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/mydatabase"),
    )
    
    query = """
    SELECT u.name AS doctor_name, d.id as id, d.ratings AS rating, d.specialization
    FROM "Doctor" d
    JOIN "User" u ON d."userId" = u.id
    LIMIT 10;
    """
    
    rows = await conn.fetch(query)
    
    result = []
    for row in rows:
        result.append({
            "name": row['doctor_name'],
            "rating": row['rating'],
            "Specialization": row['specialization'],
            "id": row['id']
        })
    
    await conn.close()
    return result


print(asyncio.run(fetch_doctors_with_user()))