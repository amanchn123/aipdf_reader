"use client";
// import { uploadToS3 } from "@/lib/s3";
// import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { uploadBytes, getDownloadURL, ref, getStorage } from "firebase/storage";
import { analytics } from "../../firebase-config";
import { useMutation } from "@tanstack/react-query";

// https://github.com/aws/aws-sdk-js-v3/issues/4126

const FileUpload = () => {
  const [filenaam,setFilenaam]=useState<string>("")
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);

  const { mutate } = useMutation({
    mutationFn: async (data) => {

      const response = await axios.post("/api/create-chat", {
        url:data.url,filenaam:data.filenaam
      }); 
      
      return response.data;
    },
  });

  const handleFileUpload = async (file:File) => {
    if (!file) return;
  
    try {
      setUploading(true);
  
      const data = await ref(analytics, `ai_pdf/${file.name}`);
      const uploadResult = await uploadBytes(data, file);
      const url = await getDownloadURL(uploadResult.ref);
      // if (!data?.file_key || !data.file_name) {
      //   toast.error("Something went wrong");
      //   return;
      // }
  
      mutate({ url, filenaam: file.name }, {
        onSuccess: ({ chat_id }) => {
          toast.success("Chat created!");
          router.push(`/chat/${chat_id}`);
        },
        onError: (err) => {
          toast.error("Error creating chat");
          console.error(err);
        },
      });
  
    } catch (error) {
      console.log('Error in downloading file', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      
      setFilenaam(file?.name);
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large");
        return;
      }     
      
      await handleFileUpload(file);   

      try {
        // setUploading(true);
        // const data = await ref(analytics, `ai_pdf/${file.name}`);
        // const uploadFile = await uploadBytes(data, file)
        // const url = await getDownloadURL(uploadFile.ref);

        // if (!data?.file_key || !data.file_name) {
        //   toast.error("Something went wrong");
        //   return;
        // }
            
        // mutate(url, {
        //   onSuccess: ({ chat_id }) => {
        //     toast.success("Chat created!");
        //     router.push(`/chat/${chat_id}`);
        //   },
        //   onError: (err) => {
        //     toast.error("Error creating chat");
        //     console.error(err);
        //   },
        // });
        
      } catch (error) {
        console.log('error in downlaoding file',error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading  ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
