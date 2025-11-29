import { connectToDB } from "@/dbConfig/db";
import User from "@/models/userModel"
import { NextResponse} from "next/server";
import bcryptjs from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(request){
    try {
        await connectToDB();    
        const reqBody = await request.json();
        const {username, email, password} = reqBody;        
          
        const user = await User.findOne({email});

        if(user){
            return NextResponse.json(
                {error: "User already exists"},
                {status: 400}
            )
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save()
        
        const userResponse = {
            _id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            createdAt: savedUser.createdAt
        };


        return NextResponse.json({
            message: "User created successfully",
            success: true,
            userResponse
        })

    } catch (error) {
        return NextResponse.json({error: error.message},
            {status: 500}
        )
    }
}
