class ApiResposne{
    constructor(status, message = "success" , data,){
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
    }
}