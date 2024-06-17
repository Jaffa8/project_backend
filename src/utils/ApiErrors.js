class ApiErrors extends Error {
  constructor(
    statusCode,
    message="Something went wrong",
    stack=""
  ){
    super(message);
    this.statusCode = statusCode;
    this.stack = stack;

    if(stack){
        this.stack = stack;
    }
    else{
        Error.captureStackTrace(this, this.constructor);
    }
  }
}

export {ApiErrors};