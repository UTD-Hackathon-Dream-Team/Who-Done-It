import { useState, useEffect } from "react";
import axios from "axios";

export const LevelOne = () => {
  let [detective, setDetective] = useState("");
  let [image, setImage] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [buttonText, setButtonText] = useState("Select your file first");

  // Handling file selection from input
  const onFileSelected = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setIsDisabled(false); // Enabling upload button
      setButtonText("Let's upload this!");
    }
  };

  // Setting image preview
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      //reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);

  // Uploading image to Cloud Storage
  const handleFileUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);
    setButtonText("Wait we're uploading your file...");

    try {
      if (selectedFile !== "") {
        // Creating a FormData object
        let fileData = new FormData();

        // Adding the 'image' field and the selected file as value to our FormData object
        // Changing file name to make it unique and avoid potential later overrides
        fileData.set(
          "image",
          selectedFile,
          `${Date.now()}-${selectedFile.name}`
        );

        const result = await axios({
          method: "post",
          url: "http://localhost:8080/api/upload",
          data: fileData,
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log(result.data.fileName);

        const response = await axios({
          method: "get",
          url: `http://localhost:5000/most-similar/${result.data.fileName}`,
        });

        console.log(response.data);
        setDetective(response.data);

        setIsLoading(false);
        setIsSuccess(true);

        // Reset to default values after 3 seconds
        setTimeout(() => {
          setSelectedFile(null);
          setPreview(null);
          setIsSuccess(false);
          setFileName(null);
          setButtonText("Select your file first");
        }, 3000);
      }
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      setFileName(null);

      setTimeout(() => {
        setIsError(false);
        setButtonText("Select your file first");
      }, 3000);
    }
  };

  return (
    <div>
      <h1>Upload an image of you dressed as a detective!</h1>

      <main>
        <form onSubmit={(e) => handleFileUpload(e)}>
          <label className="uploader">
            <div className="upload-space">
              {isLoading ? (
                // <Spinner />
                <h1>Loading</h1>
              ) : (
                <>
                  {isError || isSuccess ? (
                    <i
                      className={`icon-${isSuccess ? "success" : "error"}`}
                    ></i>
                  ) : (
                    <>
                      {preview ? (
                        <div className="preview">
                          <img
                            src={preview}
                            alt="Preview of the file to be uploaded"
                          />
                        </div>
                      ) : (
                        <i className="icon-upload"></i>
                      )}
                      <input type="file" onChange={onFileSelected} />
                    </>
                  )}
                </>
              )}
            </div>
            {isError || isSuccess ? (
              <p className={isSuccess ? "success" : "error"}>
                {isSuccess ? "Upload successful!" : "Something went wrong ..."}
              </p>
            ) : (
              <p className="filename">
                {fileName ? fileName : "No file selected yet"}
              </p>
            )}
          </label>

          <button
            type="submit"
            className="btn"
            disabled={isDisabled}
            tabIndex={0}
          >
            {buttonText}
          </button>
        </form>
      </main>

      {detective && <p>You most look like {detective}</p>}
    </div>
  );
};
