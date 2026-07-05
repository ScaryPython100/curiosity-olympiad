export const revalidate = 0;

import { supabase } from "@/utils/supabase";
import { s3Client } from "@/utils/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";

interface Student {
  id: number;
  student_name: string;
}

export default async function Home() {
  // 1. Fetch Supabase Data
  const { data: students, error } = await supabase
    .from("test_students")
    .select("*");

  if (error) console.error("Database Error:", error);

  // 2. Define the AWS Server Action
  async function uploadTestFile() {
    "use server";
    
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: "test-folder/hello-mumbai.txt",
        Body: "AWS S3 connection is fully operational!",
      });

      await s3Client.send(command);
      console.log("Success: File sent to AWS S3!");
    } catch (err) {
      console.error("AWS Error:", err);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans p-8 gap-8">
      <h1 className="text-4xl font-bold text-blue-400">Phase 3: AWS Integration</h1>
      
      {/* Supabase Test UI */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full max-w-md text-center">
        <h2 className="text-xl mb-4 text-gray-300">Supabase Database</h2>
        {students && students.length > 0 ? (
          <ul className="text-green-400 font-mono text-xl">
            {students.map((student: Student) => (
              <li key={student.id}>{student.student_name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-400">No data found.</p>
        )}
      </div>

      {/* AWS S3 Test UI */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full max-w-md text-center">
        <h2 className="text-xl mb-4 text-gray-300">AWS S3 Storage</h2>
        <form action={uploadTestFile}>
          <button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Upload Test File to S3
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          Clicking this will upload "hello-mumbai.txt" to your bucket.
        </p>
      </div>
    </div>
  );
}