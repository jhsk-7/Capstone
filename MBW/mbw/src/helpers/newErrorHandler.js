export function normalizeError(err) {

  console.log(err.error)

  let status;
  let message;

  const statusRaw  = err.response.status;
  const dataRaw = err.response.data.error;


  if(dataRaw === "User already exists"){
    status = statusRaw;
    message = dataRaw;
  }

  if(dataRaw === "Invalid password" || dataRaw === "User does not exist"){
    status = statusRaw;
    message = dataRaw;
  }

  if(dataRaw === "JsonWebTokenError: invalid token"){
    status = 401;
    message = "User Invalid - Log In";
  }

  if(dataRaw === "Error: Authentication token is missing"){
    status = 401;
    message = "User Invalid - Log In";
  }

  if(dataRaw === "TokenExpiredError: jwt expired"){
    status = 401;
    message = "Session Expired - Log In";
  }
  
  if(dataRaw.startsWith("E11000 duplicate key error collection: mbw.bikes index: user_1_nickname_1 dup key:")){
    status = 409;
    message = "Choose another nickname for your bike"
  }

  console.log(`${status}: ${message}`)
  return { status, message }
}

