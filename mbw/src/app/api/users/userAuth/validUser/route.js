import { getDataFromToken } from "@/helpers/userAuth";
import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { connectToDB } from "@/dbConfig/db";


export const dynamic = "force-dynamic";


export async function GET(request){
    await connectToDB();

    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = await User.findOne({_id: userId}).select("-password -isAdmin");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({
            message: "User found",
            data: user
        })
    } catch (error) {
        return NextResponse.json({error: error.message},
            {status: 400}
        )
    }
}