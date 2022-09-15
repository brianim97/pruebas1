const sqlConfig = {
    user: `${process.env.SQL_USER}`,
    password: `${process.env.SQL_PASSWORD}`,
    database: `${process.env.SQL_DATABASE}`,
    server: `${process.env.SQL_HOST}`,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    connectionTimeout:300000,
    requestTimeout:1800000,
    options: {
      encrypt: process.env.ENCRYPT==1?true:false, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  }
  
  
  module.exports = sqlConfig