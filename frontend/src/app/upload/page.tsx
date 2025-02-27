"use client"
import { ImageUploader } from "@/components/ImageUploader";


import {useState}from "react"

export default function UploadPage(){
    const [image,setImage]=useState<string | null>(null);
   

   

    return(
        <section className="upload-section">
            <h1>Upload a Bike Image</h1>
            <ImageUploader onImageUpload={setImage}/>
            
        </section>

    );

}
