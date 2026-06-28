// import {PrismaClient} from '@prisma/client';

// const prisma =new PrismaClient()

// export default prisma


import pg from 'pg';
import dotenv from 'dotenv'

dotenv.config()
const {Pool}=pg

const db=new Pool({
    connectionString:process.env.DATABASE_URL
})

db.on('connect',()=>{
    console.log('Postgres database pool connected succesfully')
})
export default db

