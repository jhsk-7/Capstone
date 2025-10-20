import jwt from "jsonwebtoken";

export const getDataFromToken = (request) => {
    try {
        const token = request.cookies.get("token")?.value || "";
        
        if (!token) {
            throw new Error("Authentication token is missing");
        }
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
        return decodedToken.id;

    } catch (error) {
        throw new Error(error)
    }
}