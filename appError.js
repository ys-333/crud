class appError extends Error{
    constructor(stauts,message){
        super() ;
        this.stauts = stauts ;
        this.message= message ;
    }

}
module.exports = appError ;