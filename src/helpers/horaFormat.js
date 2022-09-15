const horaFormat = ()=>{
    let hora = new Date()
    hora = hora.toLocaleTimeString().split(':')
    if(hora[0]<10){
        if(!hora[0].includes('0')){
            hora[0] = '0'+hora[0]
        }
    }
    return hora[0]+':'+hora[1]
}

module.exports = {horaFormat}