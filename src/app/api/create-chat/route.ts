import { loadfirebaseinpinecone } from './../../../lib/pinecone';
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req:Request,res:Response){
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
    try{
        const body=await req.json()
      const {url,filenaam}=body;
      loadfirebaseinpinecone(url,filenaam)
      const chat_id = await db
      .insert(chats)
      .values({
        fileKey:filenaam,
        pdfName: filenaam,
        pdfUrl: url,
        userId,
      })
      
      .returning({
        insertedId: chats.id,
      });
    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
    
    }catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "internal server error" },
        { status: 500 }
      );
    }

}