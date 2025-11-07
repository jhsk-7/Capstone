import { connectToDB } from "@/dbConfig/db";
import User from "@/models/userModel"
import { NextResponse} from "next/server";
import bcryptjs, { hash } from "bcryptjs";
import jwt from "jsonwebtoken"

export const dynamic = "force-dynamic";


export async function POST(request){
    await connectToDB();

    try {
        const reqBody = await request.json();
        const {email, password} = reqBody;
        
        const user = await User.findOne({email})
        if(!user){
            return NextResponse.json(
                {error: "User does not exist"},
                {status: 400})
        }

        const validPassword = await bcryptjs.compare
        (password, user.password);
        if(!validPassword){
            return NextResponse.json({error: "Invalid password"},{status: 400})    
        }

        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

        const token = await jwt.sign(
            tokenData, 
            process.env.TOKEN_SECRET, 
            {expiresIn: "1h" }
        )

        const response = NextResponse.json({
            message: "Login successful",
            success: true
        })

        response.cookies.set("token", token, {httpOnly: true})

        return response;

    } catch (error) {
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}

