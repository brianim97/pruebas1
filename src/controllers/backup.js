const fs = require('fs')
const archiver = require('archiver')
const ftp = require("basic-ftp") 

const createZip = async(startInterval,stopInterval)=>{
    stopInterval()
    try {
        if(fs.existsSync(process.env.DB_URL)){
            console.log('Archivo de Backup encontrado');

            let {mtime} =  fs.statSync(process.env.DB_URL)  
            let info = mtime.toLocaleString()
            mtime = mtime.toLocaleString().split(',')[0]
            
            let fechaAux = new Date().toLocaleString().split(',')[0]
            if(mtime == fechaAux){
                console.log('El backup es de hoy');
            }else{
                console.log('El backup no es de hoy');
                console.log('Borrando backup anterior');
                try {
                    let borrado = fs.unlinkSync(process.env.DB_URL)
                    console.log('Backup borrado correctamente');    
                } catch (error) {
                    console.log('Error al borrar backup: '+error);
                    return
                }
                console.log('Creando backup nuevo');
                const respuesta = await forzarBackup()
                if(respuesta){
                    console.log('Backup creado correctamente');
                }else{
                    console.log('Error al crear el backup');
                    return
                }
            }
        }else{
            console.log('No se encontro el archivo');
            console.log('Creando nuevo Backup en '+process.env.DB_URL);
            const respuesta = await forzarBackup()
            if(respuesta){
                console.log('Backup creado correctamente');
            }else{
                console.log('Error al crear el backup');
                return
            }
        }
        console.log('Creando zip');
        let output = fs.createWriteStream(`./src/bak/${process.env.DB_NAME}.zip`);
        let archive = archiver('zip')
        archive.pipe(output)
        
        await archive.append(fs.createReadStream(process.env.DB_URL),{name:`${process.env.DB_NAME}.bak`}); 
        
        output.on('close', async function() {
            console.log(archive.pointer() + ' total bytes');
            console.log(`${process.env.DB_NAME}.zip creado ${new Date().toLocaleString()}`);
            await uploadBackup()
            startInterval()
        });
        
    archive.finalize();
    
    
} catch (error) {
    console.log(error);
}
}
let reintentos = process.env.REINTENTOS
const connectionReturn = async()=>{
    const client = new ftp.Client(timeout=0)
    client.ftp.verbose = true
    try {
      let arhiveSendInfo = fs.statSync(`./src/bak/${process.env.DB_NAME}.zip`) 
        await client.access({
            host: `${process.env.FTP_HOST}`,
            user: `${process.env.FTP_USER}`,
            password: `${process.env.FTP_PASSWORD}`,
            port: `${process.env.FTP_PORT}`,
            secure: false
        })
        client.trackProgress(info => console.log(`${info.bytesOverall} DE ${arhiveSendInfo.size} [%${((info.bytesOverall*100)/arhiveSendInfo.size).toFixed(2)}]`))
        const upload = await client.uploadFrom(`./src/bak/${process.env.DB_NAME}.zip`, `${process.env.DB_NAME}.zip`)
        console.log(upload);
    }
    catch(err) {
        console.log(err)
        reintentos--
          if(reintentos == 0){
              return
          }
          connectionReturn()
    }
    client.close()
}

const uploadBackup = async()=>{
      const client = new ftp.Client(timeout=0)
      client.ftp.verbose = true
      try {
        let arhiveSendInfo = fs.statSync(`./src/bak/${process.env.DB_NAME}.zip`) 
          await client.access({
              host: `${process.env.FTP_HOST}`,
              user: `${process.env.FTP_USER}`,
              password: `${process.env.FTP_PASSWORD}`,
              port: `${process.env.FTP_PORT}`,
              secure: false
          })
          client.trackProgress(info => console.log(`${info.bytesOverall} DE ${arhiveSendInfo.size} [%${((info.bytesOverall*100)/arhiveSendInfo.size).toFixed(2)}]`))
          const upload = await client.uploadFrom(`./src/bak/${process.env.DB_NAME}.zip`, `${process.env.DB_NAME}.zip`)
          console.log(upload);
      }
      catch(err) {
          console.log(err)
          reintentos--
          if(reintentos == 0){
              return
          }
          connectionReturn()
      }
      client.close()
  
}

const forzarBackup = async()=>{
    let conn;
    try {
        const sqlConfig = require('../config/db')
        const sql = require('mssql');
        conn = await sql.connect(sqlConfig)
        const respuesta = await sql.query(`
          BACKUP DATABASE ${process.env.SQL_DATABASE} TO DISK = '${process.env.DB_URL}'
        `)
        console.log(respuesta);
        if(respuesta){
            conn.close()
            return true
        }
    } catch (error) {
        console.log(error);
        return false
    }
}

module.exports = {createZip,uploadBackup,forzarBackup}