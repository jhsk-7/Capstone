export function normalizeError(err) {

  console.log(err)

  let message;

  const dataRaw = 'j'

  if(dataRaw === "User already exists"){
    message = dataRaw;
  }

  if(dataRaw === "Invalid password" || dataRaw === "User does not exist"){
    message = dataRaw;
  }

  if(dataRaw === "JsonWebTokenError: invalid token"){
    message = "User Invalid - Log In";
  }

  if(dataRaw === "Error: Authentication token is missing"){
    message = "User Invalid - Log In";
  }

  if(dataRaw === "TokenExpiredError: jwt expired"){
    message = "Session Expired - Log In";
  }

  if(dataRaw.startsWith("E11000 duplicate key error collection: mbw.bikes index: user_1_nickname_1 dup key:")){
    message = "Choose another nickname for your bike"
  }

  console.log(`${message}`)

  return { message }
}

