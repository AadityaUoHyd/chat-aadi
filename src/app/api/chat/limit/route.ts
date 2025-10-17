import { authOptions } from "@/lib/auth";
import { getTodayTokens } from "@/lib/tokenTracker";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    try{     
        const session = await getServerSession(authOptions);
        if(!session?.user.id){
            return NextResponse.json({error: "Unauthorized"}, {status:401})
        }
        const countDailyToken = await getTodayTokens(session.user.id);

        return NextResponse.json({token: countDailyToken}, {status: 200});


    }catch(error){
        console.error("error", error);
        return NextResponse.json({error: "Something went wrong!"}, {status: 500})
    }
}