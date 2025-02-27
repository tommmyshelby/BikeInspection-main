"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const ImageUploader = ({
  onImageUpload,
}: {
  onImageUpload: (url: string) => void;
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const router = useRouter();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageName(file.name);
      setImage(imageUrl);
      localStorage.setItem("uploadedImage",imageUrl);
      onImageUpload(imageUrl);
    }
  };
  const handleProceed=()=>{
    if(image){
        router.push("upload/mapping");
    }
}

  return (
    <div className="image-uploader">
      <label className="upload-label">
        Choose Image
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>
      {imageName && <p className="image-name">{imageName}</p>}

      {image && (<div className="uploaded-image-container">
        {image && <img src={image} alt="Uploaded" className="uploaded-image" />}
      </div>)}

      {image &&(<label className="proceed-button" onClick={handleProceed}>
        Proceed to Mapping
       </label>)}


    </div>
  );
};
